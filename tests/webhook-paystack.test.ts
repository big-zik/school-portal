const tx = {
  payment: { update: jest.fn(), create: jest.fn() },
  invoice: { findUnique: jest.fn(), update: jest.fn() },
  receipt: { create: jest.fn() },
}

const mockPrisma = {
  payment: { findFirst: jest.fn() },
  $transaction: jest.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)),
}

jest.mock('@/lib/db', () => ({ __esModule: true, default: mockPrisma }))
jest.mock('@prisma/client', () => ({
  PaymentStatus: { PENDING: 'PENDING', COMPLETED: 'COMPLETED' },
  InvoiceStatus: { PAID: 'PAID', PARTIAL: 'PARTIAL' },
  PaymentMethod: { ONLINE: 'ONLINE' },
}))
jest.mock('@/lib/auth/audit', () => ({ logAudit: jest.fn() }))
jest.mock('@/lib/payments/paystack', () => ({ verifyPaystackWebhookSignature: jest.fn() }))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/webhooks/paystack/route'
import { verifyPaystackWebhookSignature } from '@/lib/payments/paystack'
import { logAudit } from '@/lib/auth/audit'

const verifySig = verifyPaystackWebhookSignature as jest.Mock
const audit = logAudit as jest.Mock

function webhook(payload: unknown, signature: string | null = 'sig') {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (signature) headers['x-paystack-signature'] = signature
  return new NextRequest('http://localhost:3000/api/webhooks/paystack', {
    method: 'POST',
    headers,
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  })
}

const chargeSuccess = (overrides: Record<string, unknown> = {}) => ({
  event: 'charge.success',
  data: {
    reference: 'REF-1',
    amount: 5000000, // 50,000 NGN in kobo
    paid_at: '2026-11-13T09:00:00Z',
    metadata: { invoiceId: 'inv-1' },
    ...overrides,
  },
})

beforeEach(() => {
  jest.clearAllMocks()
  verifySig.mockReturnValue(true)
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('POST /api/webhooks/paystack', () => {
  it('rejects an invalid signature with 400 and touches nothing', async () => {
    verifySig.mockReturnValue(false)
    const res = await POST(webhook(chargeSuccess()))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/signature/i)
    expect(mockPrisma.payment.findFirst).not.toHaveBeenCalled()
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('passes the raw body and signature header to the verifier', async () => {
    const body = JSON.stringify({ event: 'ping' })
    await POST(webhook(body, 'abc123'))
    expect(verifySig).toHaveBeenCalledWith(body, 'abc123')
  })

  it('acknowledges unhandled event types with 200 "ignored"', async () => {
    const res = await POST(webhook({ event: 'transfer.success', data: {} }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ignored' })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('returns 500 for a malformed JSON body', async () => {
    const res = await POST(webhook('{not json'))
    expect(res.status).toBe(500)
  })

  it('is idempotent: an already-COMPLETED payment is not processed again', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({ id: 'pay-1', status: 'COMPLETED', invoiceId: 'inv-1' })
    const res = await POST(webhook(chargeSuccess()))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'already_processed' })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    expect(audit).not.toHaveBeenCalled()
  })

  it('looks the payment up by referenceNumber or gatewayRef', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({ id: 'pay-1', status: 'COMPLETED' })
    await POST(webhook(chargeSuccess()))
    expect(mockPrisma.payment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ referenceNumber: 'REF-1' }, { gatewayRef: 'REF-1' }] },
      }),
    )
  })

  it('returns 200 "invoice_not_found" when no invoice can be resolved', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue(null)
    const res = await POST(webhook(chargeSuccess({ metadata: {} })))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'invoice_not_found' })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  describe('existing pending payment', () => {
    beforeEach(() => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        status: 'PENDING',
        amount: 50000,
        invoiceId: 'inv-1',
        paidById: 'parent-1',
      })
      tx.payment.update.mockResolvedValue({ id: 'pay-1', paidById: 'parent-1', amount: 50000 })
      tx.receipt.create.mockResolvedValue({ id: 'rec-1' })
    })

    it('marks the payment COMPLETED, issues a receipt and marks a fully-paid invoice PAID', async () => {
      tx.invoice.findUnique.mockResolvedValue({ id: 'inv-1', paidAmount: 0, balanceAmount: 50000 })

      const res = await POST(webhook(chargeSuccess()))

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ status: 'success' })
      expect(tx.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({ status: 'COMPLETED', amount: 50000 }),
        }),
      )
      expect(tx.receipt.create).toHaveBeenCalledWith({
        data: { paymentId: 'pay-1', receiptNumber: expect.stringMatching(/^REC-\d{6}-\d{4}$/) },
      })
      expect(tx.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { paidAmount: 50000, balanceAmount: 0, status: 'PAID' },
      })
    })

    it('marks the invoice PARTIAL when the payment does not clear the balance', async () => {
      tx.invoice.findUnique.mockResolvedValue({ id: 'inv-1', paidAmount: 0, balanceAmount: 120000 })

      await POST(webhook(chargeSuccess()))

      expect(tx.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { paidAmount: 50000, balanceAmount: 70000, status: 'PARTIAL' },
      })
    })

    it('never lets the invoice balance go negative on an overpayment', async () => {
      tx.invoice.findUnique.mockResolvedValue({ id: 'inv-1', paidAmount: 40000, balanceAmount: 10000 })

      await POST(webhook(chargeSuccess()))

      const data = tx.invoice.update.mock.calls[0][0].data
      expect(data.balanceAmount).toBe(0)
      expect(data.status).toBe('PAID')
    })

    it('converts the kobo amount to Naira exactly once', async () => {
      tx.invoice.findUnique.mockResolvedValue({ id: 'inv-1', paidAmount: 0, balanceAmount: 999999 })
      await POST(webhook(chargeSuccess({ amount: 123456 })))
      expect(tx.payment.update.mock.calls[0][0].data.amount).toBe(1234.56)
    })

    it('writes an audit entry for the payment', async () => {
      tx.invoice.findUnique.mockResolvedValue({ id: 'inv-1', paidAmount: 0, balanceAmount: 50000 })
      await POST(webhook(chargeSuccess()))
      expect(audit).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'parent-1',
          action: 'PAYSTACK_WEBHOOK_PAYMENT_SUCCESS',
          entityId: 'pay-1',
        }),
      )
    })
  })

  describe('no existing payment record', () => {
    beforeEach(() => {
      mockPrisma.payment.findFirst.mockResolvedValue(null)
    })

    it('creates an ONLINE payment from the invoice and settles it', async () => {
      tx.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        studentId: 'stu-1',
        paidAmount: 0,
        balanceAmount: 50000,
      })
      tx.payment.create.mockResolvedValue({ id: 'pay-9', paidById: 'stu-1' })
      tx.receipt.create.mockResolvedValue({ id: 'rec-9' })

      const res = await POST(webhook(chargeSuccess()))

      expect(res.status).toBe(200)
      expect(tx.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceId: 'inv-1',
            studentId: 'stu-1',
            amount: 50000,
            paymentMethod: 'ONLINE',
            referenceNumber: 'REF-1',
            gatewayRef: 'REF-1',
            status: 'COMPLETED',
            paidById: 'stu-1',
          }),
        }),
      )
    })

    it('uses metadata.paidById when provided', async () => {
      tx.invoice.findUnique.mockResolvedValue({ id: 'inv-1', studentId: 'stu-1', paidAmount: 0, balanceAmount: 50000 })
      tx.payment.create.mockResolvedValue({ id: 'pay-9', paidById: 'parent-7' })
      tx.receipt.create.mockResolvedValue({ id: 'rec-9' })

      await POST(webhook(chargeSuccess({ metadata: { invoiceId: 'inv-1', paidById: 'parent-7' } })))

      expect(tx.payment.create.mock.calls[0][0].data.paidById).toBe('parent-7')
    })

    it('returns 500 and writes no receipt when the invoice does not exist', async () => {
      tx.invoice.findUnique.mockResolvedValue(null)

      const res = await POST(webhook(chargeSuccess()))

      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe('Invoice not found')
      expect(tx.receipt.create).not.toHaveBeenCalled()
    })
  })
})
