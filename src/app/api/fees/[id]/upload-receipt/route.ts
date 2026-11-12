import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { z } from 'zod'
import { PaymentMethod, PaymentStatus, InvoiceStatus } from '@prisma/client'
import type { ApiResponse } from '@/types'

const uploadReceiptSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than zero'),
  referenceNumber: z.string().min(3, 'Bank reference or teller number is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  paymentDate: z.string().optional(),
  receiptUrl: z.string().url('A valid uploaded receipt image or document URL is required'),
  notes: z.string().max(500).optional(),
})

// POST /api/fees/[id]/upload-receipt — parent submits bank transfer proof for approval
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
      include: {
        student: {
          include: {
            studentGuardians: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === InvoiceStatus.PAID) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'This invoice has already been fully settled' },
        { status: 400 },
      )
    }

    const body = await request.json()
    const parsed = uploadReceiptSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      parsed.error.errors.forEach((e) => {
        const key = e.path.join('.')
        errors[key] = [...(errors[key] ?? []), e.message]
      })
      return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
    }

    const data = parsed.data

    const metadata = JSON.stringify({
      receiptUrl: data.receiptUrl,
      bankName: data.bankName,
      notes: data.notes || '',
      submittedByName: session.user.name || 'Parent',
      submittedByEmail: session.user.email || '',
      submittedAt: new Date().toISOString(),
    })

    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        studentId: invoice.studentId,
        amount: data.amount,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        referenceNumber: data.referenceNumber.trim(),
        gatewayRef: metadata,
        status: PaymentStatus.PENDING,
        paidById: session.user.id,
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'SUBMIT_PAYMENT_PROOF',
      module: 'Finance',
      entityType: 'Payment',
      entityId: payment.id,
      newValue: {
        invoiceId: invoice.id,
        amount: data.amount,
        referenceNumber: data.referenceNumber,
        bankName: data.bankName,
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Payment proof submitted successfully and is awaiting bursar verification',
        data: payment,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error submitting bank receipt:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
