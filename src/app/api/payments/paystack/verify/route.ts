import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { verifyPaystackTransaction } from '@/lib/payments/paystack'
import { PaymentStatus, InvoiceStatus } from '@prisma/client'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// GET /api/payments/paystack/verify?reference=...
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const reference = searchParams.get('reference')
    if (!reference) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Transaction reference is required' }, { status: 400 })
    }

    const verification = await verifyPaystackTransaction(reference)
    if (!verification.success) {
      return NextResponse.json<ApiResponse>({ success: false, error: verification.error || 'Transaction not verified' }, { status: 400 })
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ referenceNumber: reference }, { gatewayRef: reference }],
      },
      include: { invoice: true, receipt: true },
    })

    if (!payment) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Payment record not found' }, { status: 404 })
    }

    // If not completed yet, complete it now
    if (payment.status !== PaymentStatus.COMPLETED) {
      const amountPaid = verification.amount || payment.amount

      const updated = await prisma.$transaction(async (tx) => {
        const completedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            amount: amountPaid,
          },
        })

        const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
        const receipt = await tx.receipt.create({
          data: {
            paymentId: completedPayment.id,
            receiptNumber,
          },
        })

        const currentInvoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } })
        if (currentInvoice) {
          const newPaid = currentInvoice.paidAmount + amountPaid
          const newBalance = Math.max(0, currentInvoice.balanceAmount - amountPaid)
          await tx.invoice.update({
            where: { id: payment.invoiceId },
            data: {
              paidAmount: newPaid,
              balanceAmount: newBalance,
              status: newBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL,
            },
          })
        }

        return { payment: completedPayment, receipt }
      })

      await logAudit({
        userId: session.user.id,
        action: 'VERIFY_PAYSTACK_PAYMENT',
        module: 'Finance',
        entityType: 'Payment',
        entityId: payment.id,
        newValue: { reference, receiptNumber: updated.receipt.receiptNumber },
      })

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Payment verified and receipt issued successfully',
        data: updated,
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Payment is verified and settled',
      data: { payment, receipt: payment.receipt },
    })
  } catch (error: any) {
    console.error('Error verifying Paystack payment:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
