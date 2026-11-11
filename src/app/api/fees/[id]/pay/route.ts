import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { z } from 'zod'
import { PaymentMethod, InvoiceStatus } from '@prisma/client'
import type { ApiResponse } from '@/types'

const paymentBodySchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z
    .enum(['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'MOBILE_MONEY', 'ONLINE', 'POS'])
    .default('ONLINE'),
  referenceNumber: z.string().max(100).optional(),
  paymentDate: z.string().optional(),
  notes: z.string().max(500).optional(),
})

const methodMapping: Record<string, PaymentMethod> = {
  CASH: PaymentMethod.CASH,
  BANK_TRANSFER: PaymentMethod.BANK_TRANSFER,
  CARD: PaymentMethod.CARD,
  ONLINE: PaymentMethod.ONLINE,
  CHEQUE: PaymentMethod.CHEQUE,
  MOBILE_MONEY: PaymentMethod.ONLINE,
  POS: PaymentMethod.CARD,
}

// POST /api/fees/[id]/pay — record payment against invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { student: true },
    })

    if (!invoice) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === InvoiceStatus.PAID) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invoice is already fully paid' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = paymentBodySchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      parsed.error.errors.forEach((e) => {
        const key = e.path.join('.')
        errors[key] = [...(errors[key] ?? []), e.message]
      })
      return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
    }

    const data = parsed.data
    const paymentAmount = data.amount
    const newPaidAmount = invoice.paidAmount + paymentAmount
    const newBalanceAmount = Math.max(0, invoice.balanceAmount - paymentAmount)
    const newStatus: InvoiceStatus = newBalanceAmount <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL
    const prismaPaymentMethod = methodMapping[data.paymentMethod] || PaymentMethod.ONLINE

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          studentId: invoice.studentId,
          amount: paymentAmount,
          paymentMethod: prismaPaymentMethod,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          referenceNumber: data.referenceNumber || `REF-${Date.now()}`,
          status: 'COMPLETED',
          paidById: session.user.id,
        },
      })

      // 2. Generate Receipt
      const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
      const receipt = await tx.receipt.create({
        data: {
          paymentId: payment.id,
          receiptNumber,
        },
      })

      // 3. Update Invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          status: newStatus,
        },
      })

      return { payment, receipt, invoice: updatedInvoice }
    })

    await logAudit({
      userId: session.user.id,
      action: 'PAYMENT',
      module: 'Fees',
      entityType: 'Invoice',
      entityId: id,
      oldValue: { paidAmount: invoice.paidAmount, balanceAmount: invoice.balanceAmount, status: invoice.status },
      newValue: {
        amount: paymentAmount,
        newPaidAmount,
        newBalanceAmount,
        status: newStatus,
        paymentId: result.payment.id,
        receiptNumber: result.receipt.receiptNumber,
      },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: result }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
