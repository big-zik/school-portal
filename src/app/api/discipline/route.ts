import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// GET /api/discipline — list discipline infractions and commendations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const studentId = searchParams.get('studentId')
    const type = searchParams.get('type') // 'COMMENDATION' or 'INFRACTION'

    const where: any = { module: 'DISCIPLINE' }
    if (studentId) where.entityId = studentId

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const formatted = logs
      .map((log) => {
        const payload = (log.newValue as any) || {}
        return {
          id: log.id,
          studentId: log.entityId,
          studentName: payload.studentName || 'Student',
          admissionNo: payload.admissionNo || 'N/A',
          className: payload.className || 'General',
          category: payload.category || 'CONDUCT',
          type: payload.type || 'INFRACTION', // 'COMMENDATION' | 'INFRACTION'
          title: payload.title || log.action,
          points: payload.points || 0,
          actionTaken: payload.actionTaken || 'Warning',
          reportedBy: log.user?.name || 'Staff Member',
          remarks: payload.remarks || '',
          createdAt: log.createdAt,
        }
      })
      .filter((rec) => (!type ? true : rec.type === type))

    return NextResponse.json<ApiResponse>({ success: true, data: formatted })
  } catch (error: any) {
    console.error('GET /api/discipline error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/discipline — log a new conduct record (merit or disciplinary infraction)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, type, category, title, points, actionTaken, remarks } = body

    if (!studentId || !title || !type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'studentId, title, and type (COMMENDATION | INFRACTION) are required' },
        { status: 400 },
      )
    }

    // Lookup student details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true } },
        currentClass: { select: { name: true } },
      },
    })

    const studentName = student?.user?.name || 'Student'
    const admissionNo = student?.admissionNumber || student?.studentId || 'N/A'
    const className = student?.currentClass?.name || 'General'

    await logAudit({
      userId: session.user.id,
      action: type === 'COMMENDATION' ? 'AWARD_COMMENDATION' : 'LOG_INFRACTION',
      module: 'DISCIPLINE',
      entityType: 'StudentConduct',
      entityId: studentId,
      newValue: {
        type,
        category: category || 'ACADEMIC_INTEGRITY',
        title,
        points: Number(points) || (type === 'COMMENDATION' ? 5 : -5),
        actionTaken: actionTaken || (type === 'COMMENDATION' ? 'Honor Roll Certificate' : 'Verbal Admonition'),
        remarks: remarks || '',
        studentName,
        admissionNo,
        className,
      },
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Student conduct record saved successfully' },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/discipline error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
