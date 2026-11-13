import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { calculateNigerianPAYE } from '@/lib/utils/payroll'
import type { ApiResponse } from '@/types'

// GET /api/payroll — list payroll records & runs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const month = searchParams.get('month') || 'February 2026'

    const logs = await prisma.auditLog.findMany({
      where: { module: 'PAYROLL' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const payrollRuns = logs.map((l) => {
      const data = (l.newValue as any) || {}
      return {
        id: l.id,
        month: data.month || 'Current Month',
        staffCount: data.staffCount || 0,
        totalGrossKobo: data.totalGrossKobo || 0,
        totalDeductionsKobo: data.totalDeductionsKobo || 0,
        totalNetKobo: data.totalNetKobo || 0,
        slips: data.slips || [],
        generatedAt: l.createdAt,
      }
    })

    return NextResponse.json<ApiResponse>({ success: true, data: payrollRuns })
  } catch (error: any) {
    console.error('GET /api/payroll error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/payroll — execute monthly payroll run
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { month } = body

    // Fetch active teachers & staff
    const teachers = await prisma.teacher.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { name: true } },
      },
    })

    const slips = teachers.map((t, idx) => {
      const baseSalaryKobo = 25000000 + (idx * 2500000) // 250k - 350k NGN
      const housingKobo = Math.round(baseSalaryKobo * 0.2)
      const transportKobo = Math.round(baseSalaryKobo * 0.1)
      const grossKobo = baseSalaryKobo + housingKobo + transportKobo

      const pensionKobo = Math.round(baseSalaryKobo * 0.08) // 8% statutory employee pension
      const payeCalculation = calculateNigerianPAYE(grossKobo, pensionKobo)
      const taxKobo = payeCalculation.monthlyTaxKobo // Nigerian PITA progressive PAYE tax
      const totalDeductionsKobo = pensionKobo + taxKobo
      const netPayKobo = grossKobo - totalDeductionsKobo

      return {
        teacherId: t.id,
        staffName: t.user.name,
        staffNo: t.employeeId,
        department: t.department?.name || 'Academic Faculty',
        baseSalaryKobo,
        housingKobo,
        transportKobo,
        grossKobo,
        pensionKobo,
        taxKobo,
        effectiveTaxRate: payeCalculation.effectiveTaxRate,
        craKobo: payeCalculation.annualCraKobo,
        totalDeductionsKobo,
        netPayKobo,
      }
    })

    const totalGrossKobo = slips.reduce((acc, s) => acc + s.grossKobo, 0)
    const totalDeductionsKobo = slips.reduce((acc, s) => acc + s.totalDeductionsKobo, 0)
    const totalNetKobo = slips.reduce((acc, s) => acc + s.netPayKobo, 0)

    const payload = {
      month: month || 'February 2026',
      staffCount: slips.length,
      totalGrossKobo,
      totalDeductionsKobo,
      totalNetKobo,
      slips,
      approvedBy: session.user.name || 'Bursar / Administrator',
    }

    const log = await logAudit({
      userId: session.user.id,
      action: 'EXECUTE_PAYROLL_RUN',
      module: 'PAYROLL',
      entityType: 'PayrollRun',
      newValue: payload,
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Successfully executed payroll run for ${slips.length} academic and administrative staff`,
        data: { id: log?.id || `pay_${Date.now()}`, ...payload },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/payroll error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
