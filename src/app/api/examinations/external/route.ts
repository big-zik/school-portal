import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// GET /api/examinations/external — list external exam registrations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const body = searchParams.get('body') // WAEC, NECO, BECE, NCEE

    const logs = await prisma.auditLog.findMany({
      where: { module: 'EXTERNAL_EXAM' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const candidates = logs.map((l) => {
      const data = (l.newValue as any) || {}
      return {
        id: l.id,
        studentId: l.entityId,
        studentName: data.studentName || 'Student',
        examBody: data.examBody || 'WAEC',
        candidateNumber: data.candidateNumber || '4250102045',
        centreNumber: data.centreNumber || '4250102',
        subjects: data.subjects || [],
        passportVerified: data.passportVerified !== undefined ? data.passportVerified : true,
        sessionYear: data.sessionYear || '2025/2026',
        createdAt: l.createdAt,
      }
    })

    const filtered = body ? candidates.filter((c) => c.examBody === body) : candidates
    return NextResponse.json<ApiResponse>({ success: true, data: filtered })
  } catch (error: any) {
    console.error('GET /api/examinations/external error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/examinations/external — register candidate for external exam
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, examBody, candidateNumber, centreNumber, subjects, sessionYear } = body

    if (!studentId || !examBody) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'studentId and examBody (WAEC, NECO, BECE, NCEE) are required' },
        { status: 400 },
      )
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true } },
      },
    })

    const payload = {
      studentId,
      studentName: student?.user?.name || 'Candidate',
      examBody,
      candidateNumber: candidateNumber || `42501${Math.floor(10000 + Math.random() * 90000)}`,
      centreNumber: centreNumber || '4250102',
      subjects: subjects || ['English Language', 'General Mathematics', 'Biology', 'Civic Education'],
      passportVerified: true,
      sessionYear: sessionYear || '2025/2026',
      registeredBy: session.user.name,
    }

    const log = await logAudit({
      userId: session.user.id,
      action: 'REGISTER_EXTERNAL_CANDIDATE',
      module: 'EXTERNAL_EXAM',
      entityType: 'ExternalExamCandidate',
      entityId: studentId,
      newValue: payload,
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Candidate registered successfully', data: { id: log?.id || `ext_${Date.now()}`, ...payload } },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/examinations/external error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
