import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { initializePaystackTransaction } from '@/lib/payments/paystack'
import { PaymentMethod, PaymentStatus } from '@prisma/client'
import type { ApiResponse } from '@/types'

// POST /api/payments/paystack/initialize — start online card/USSD checkout
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invoiceId, amount } = body

    if (!invoiceId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invoice ID is required' }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    const payAmount = amount && Number(amount) > 0 ? Number(amount) : invoice.balanceAmount || invoice.totalAmount

    const reference = `PSK_${invoice.id.slice(-6)}_${Date.now()}`
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parent/fees?verified_ref=${reference}`

    const initResult = await initializePaystackTransaction({
      email: session.user.email || 'parent@school.com',
      amount: payAmount,
      reference,
      callbackUrl,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        studentId: invoice.studentId,
        studentName: invoice.student?.user?.name,
        paidById: session.user.id,
      },
    })

    if (!initResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: initResult.error || 'Failed to initialize Paystack checkout' },
        { status: 500 },
      )
    }

    // Record pending online payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        studentId: invoice.studentId,
        amount: payAmount,
        paymentMethod: PaymentMethod.ONLINE,
        paymentDate: new Date(),
        referenceNumber: reference,
        gatewayRef: reference,
        status: PaymentStatus.PENDING,
        paidById: session.user.id,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        authorizationUrl: initResult.authorizationUrl,
        reference: initResult.reference,
        amount: payAmount,
      },
    })
  } catch (error: any) {
    console.error('Error initializing Paystack:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
