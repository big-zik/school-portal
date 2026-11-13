import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { z } from 'zod'
import { PaymentStatus, InvoiceStatus, NotificationType } from '@prisma/client'
import { notifyPaymentReceipt, createInAppNotification } from '@/lib/notifications'
import type { ApiResponse } from '@/types'

const patchApprovalSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().max(500).optional(),
})

// GET /api/fees/approvals — list bank transfer payments awaiting verification
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    const canReview = callerRoles.some((r) =>
      ['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'].includes(r),
    )

    if (!canReview) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: only administrative staff can access payment approvals' },
        { status: 403 },
      )
    }

    const { searchParams } = request.nextUrl
    const statusFilter = searchParams.get('status') // 'PENDING' | 'COMPLETED' | 'FAILED' | null

    const where: any = {
      paymentMethod: 'BANK_TRANSFER',
    }

    if (statusFilter && Object.values(PaymentStatus).includes(statusFilter as PaymentStatus)) {
      where.status = statusFilter
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            term: { select: { name: true } },
          },
        },
        student: {
          include: {
            user: { select: { name: true, email: true } },
            currentClass: { select: { name: true } },
          },
        },
        paidBy: {
          select: { id: true, name: true, email: true, phone: true },
        },
        receipt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: payments,
    })
  } catch (error: any) {
    console.error('Error fetching payment approvals:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// PATCH /api/fees/approvals — approve or reject bank transfer proof
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    const canReview = callerRoles.some((r) =>
      ['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'].includes(r),
    )

    if (!canReview) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: only administrative staff can verify payments' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const parsed = patchApprovalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Validation failed', errors: { message: [parsed.error.message] } },
        { status: 422 },
      )
    }

    const { paymentId, action, notes } = parsed.data

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    })

    if (!payment) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Payment record not found' }, { status: 404 })
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `This payment has already been marked as ${payment.status}` },
        { status: 400 },
      )
    }

    if (action === 'APPROVE') {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Mark Payment as COMPLETED
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.COMPLETED,
            gatewayRef: payment.gatewayRef
              ? JSON.stringify({
                  ...JSON.parse(payment.gatewayRef || '{}'),
                  approvedBy: session.user.name,
                  approvedById: session.user.id,
                  approvedAt: new Date().toISOString(),
                  approvalNotes: notes || '',
                })
              : undefined,
          },
        })

        // 2. Generate official school Receipt
        const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
        const receipt = await tx.receipt.create({
          data: {
            paymentId: updatedPayment.id,
            receiptNumber,
          },
        })

        // 3. Update Invoice amounts
        const currentInvoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } })
        if (!currentInvoice) throw new Error('Invoice not found')

        const newPaidAmount = currentInvoice.paidAmount + payment.amount
        const newBalanceAmount = Math.max(0, currentInvoice.balanceAmount - payment.amount)
        const newStatus = newBalanceAmount <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL

        const updatedInvoice = await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            balanceAmount: newBalanceAmount,
            status: newStatus,
          },
        })

        return { payment: updatedPayment, receipt, invoice: updatedInvoice }
      })

      await logAudit({
        userId: session.user.id,
        action: 'APPROVE_BANK_TRANSFER',
        module: 'Finance',
        entityType: 'Payment',
        entityId: payment.id,
        newValue: {
          paymentId,
          amount: payment.amount,
          receiptNumber: result.receipt.receiptNumber,
          notes,
        },
      })

      // Dispatch payment receipt notifications (SendGrid email, Twilio SMS, In-App)
      notifyPaymentReceipt({
        receiptNumber: result.receipt.receiptNumber,
        amount: payment.amount,
        paymentMethod: 'Bank Transfer (Bursar Approved)',
        paymentDate: new Date(),
        invoiceTitle: payment.invoice ? `Invoice #${payment.invoice.invoiceNumber}` : 'School Tuition Fees',
        balanceRemaining: result.invoice.balanceAmount,
        studentId: payment.studentId,
        paidById: payment.paidById,
      }).catch((err) => console.error('[Fee Approval] Notification error:', err))

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Payment approved successfully. Receipt issued and invoice updated.',
        data: result,
      })
    } else {
      // REJECT action
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          gatewayRef: payment.gatewayRef
            ? JSON.stringify({
                ...JSON.parse(payment.gatewayRef || '{}'),
                rejectedBy: session.user.name,
                rejectedById: session.user.id,
                rejectedAt: new Date().toISOString(),
                rejectionReason: notes || 'Rejected by bursary',
              })
            : undefined,
        },
      })

      await logAudit({
        userId: session.user.id,
        action: 'REJECT_BANK_TRANSFER',
        module: 'Finance',
        entityType: 'Payment',
        entityId: payment.id,
        newValue: { paymentId, reason: notes },
      })

      // In-App Notification of Rejection
      if (payment.paidById) {
        createInAppNotification({
          userId: payment.paidById,
          title: 'Bank Transfer Verification Declined',
          body: `Your payment teller for ${payment.invoice ? `Invoice #${payment.invoice.invoiceNumber}` : 'school fees'} was declined: ${notes || 'Unable to verify against bank statement'}. Please re-upload valid proof.`,
          type: NotificationType.PAYMENT,
          link: '/parent/fees',
        }).catch((err) => console.error('[Fee Approval] Rejection notification error:', err))
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Payment rejected. Parent notified to rectify details.',
        data: updatedPayment,
      })
    }
  } catch (error: any) {
    console.error('Error processing payment approval:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
