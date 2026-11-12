import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyPaystackWebhookSignature } from '@/lib/payments/paystack'
import { PaymentStatus, InvoiceStatus, PaymentMethod } from '@prisma/client'
import { logAudit } from '@/lib/auth/audit'

// POST /api/webhooks/paystack — idempotent webhook listener for Paystack charges
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    const isValid = verifyPaystackWebhookSignature(rawBody, signature)
    if (!isValid) {
      console.warn('[Paystack Webhook] Invalid signature rejected.')
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Handle charge.success
    if (event.event === 'charge.success') {
      const data = event.data
      const reference = data.reference
      const amountPaid = data.amount ? data.amount / 100 : 0 // convert kobo to Naira
      const metadata = data.metadata || {}
      const invoiceId = metadata.invoiceId

      // Find existing payment
      let payment = await prisma.payment.findFirst({
        where: {
          OR: [{ referenceNumber: reference }, { gatewayRef: reference }],
        },
        include: { invoice: true },
      })

      // If already processed, respond 200 immediately (idempotency)
      if (payment && payment.status === PaymentStatus.COMPLETED) {
        return NextResponse.json({ status: 'already_processed' }, { status: 200 })
      }

      const targetInvoiceId = invoiceId || payment?.invoiceId
      if (!targetInvoiceId) {
        console.error('[Paystack Webhook] No invoice ID found for reference:', reference)
        return NextResponse.json({ status: 'invoice_not_found' }, { status: 200 })
      }

      await prisma.$transaction(async (tx) => {
        // 1. Update or create payment record
        if (payment) {
          payment = await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.COMPLETED,
              amount: amountPaid || payment.amount,
              paymentDate: data.paid_at ? new Date(data.paid_at) : new Date(),
            },
            include: { invoice: true },
          })
        } else {
          const inv = await tx.invoice.findUnique({ where: { id: targetInvoiceId } })
          if (!inv) throw new Error('Invoice not found')

          payment = await tx.payment.create({
            data: {
              invoiceId: inv.id,
              studentId: inv.studentId,
              amount: amountPaid,
              paymentMethod: PaymentMethod.ONLINE,
              paymentDate: new Date(),
              referenceNumber: reference,
              gatewayRef: reference,
              status: PaymentStatus.COMPLETED,
              paidById: metadata.paidById || inv.studentId,
            },
            include: { invoice: true },
          })
        }

        // 2. Issue official receipt
        const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
        await tx.receipt.create({
          data: {
            paymentId: payment.id,
            receiptNumber,
          },
        })

        // 3. Update Invoice
        const currentInvoice = await tx.invoice.findUnique({ where: { id: targetInvoiceId } })
        if (currentInvoice) {
          const newPaidAmount = currentInvoice.paidAmount + amountPaid
          const newBalanceAmount = Math.max(0, currentInvoice.balanceAmount - amountPaid)
          const newStatus = newBalanceAmount <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL

          await tx.invoice.update({
            where: { id: targetInvoiceId },
            data: {
              paidAmount: newPaidAmount,
              balanceAmount: newBalanceAmount,
              status: newStatus,
            },
          })
        }
      })

      if (payment) {
        await logAudit({
          userId: payment.paidById,
          action: 'PAYSTACK_WEBHOOK_PAYMENT_SUCCESS',
          module: 'Finance',
          entityType: 'Payment',
          entityId: payment.id,
          newValue: { reference, amount: amountPaid },
        })
      }

      return NextResponse.json({ status: 'success' }, { status: 200 })
    }

    // Default 200 for unhandled event types
    return NextResponse.json({ status: 'ignored' }, { status: 200 })
  } catch (error: any) {
    console.error('Error handling Paystack webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
