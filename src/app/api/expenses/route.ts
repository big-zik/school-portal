import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// GET /api/expenses — query operating expenses
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')

    const logs = await prisma.auditLog.findMany({
      where: { module: 'EXPENSES' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const expenses = logs.map((l) => {
      const data = (l.newValue as any) || {}
      return {
        id: l.id,
        title: data.title || l.action,
        category: data.category || 'OPERATIONS',
        amountKobo: data.amountKobo || 0,
        vendor: data.vendor || 'N/A',
        paymentMethod: data.paymentMethod || 'TRANSFER',
        approvedBy: data.approvedBy || 'Bursar',
        date: data.date || l.createdAt,
        remarks: data.remarks || '',
      }
    })

    const filtered = category ? expenses.filter((e) => e.category === category) : expenses
    return NextResponse.json<ApiResponse>({ success: true, data: filtered })
  } catch (error: any) {
    console.error('GET /api/expenses error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/expenses — log new operating expenditure
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, category, amount, vendor, paymentMethod, remarks } = body

    if (!title || !category || !amount) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Title, category, and amount are required' },
        { status: 400 },
      )
    }

    const amountKobo = Math.round(Number(amount) * 100)

    const payload = {
      title,
      category,
      amountKobo,
      vendor: vendor || 'Direct Vendor',
      paymentMethod: paymentMethod || 'BANK_TRANSFER',
      approvedBy: session.user.name || 'Bursar / Management',
      date: new Date().toISOString(),
      remarks: remarks || '',
    }

    const log = await logAudit({
      userId: session.user.id,
      action: 'LOG_OPERATING_EXPENSE',
      module: 'EXPENSES',
      entityType: 'OperatingExpense',
      newValue: payload,
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Expenditure logged successfully', data: { id: log?.id || `exp_${Date.now()}`, ...payload } },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/expenses error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
