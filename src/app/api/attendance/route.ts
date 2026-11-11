import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { AttendanceStatus } from '@prisma/client'
import type { ApiResponse } from '@/types'

// GET /api/attendance — query records with filters + summary counts
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const studentId = searchParams.get('studentId') ?? undefined
    const classId = searchParams.get('classId') ?? undefined
    const subjectId = searchParams.get('subjectId') ?? undefined
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const dateParam = searchParams.get('date')

    const where: Record<string, unknown> = {}

    if (studentId) where.studentId = studentId
    if (classId) where.classId = classId
    if (subjectId) where.subjectId = subjectId

    if (dateParam) {
      const d = new Date(dateParam)
      where.date = d
    } else if (startDateParam || endDateParam) {
      const dateFilter: Record<string, Date> = {}
      if (startDateParam) dateFilter.gte = new Date(startDateParam)
      if (endDateParam) dateFilter.lte = new Date(endDateParam)
      where.date = dateFilter
    }

    const records = await prisma.attendance.findMany({
      where: where as any,
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
        markedBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    })

    // Calculate summary counts
    let present = 0
    let absent = 0
    let late = 0
    let excused = 0
    let sick = 0

    records.forEach((r) => {
      switch (r.status) {
        case 'PRESENT':
          present++
          break
        case 'ABSENT':
          absent++
          break
        case 'LATE':
          late++
          break
        case 'EXCUSED':
          excused++
          break
        case 'SICK':
          sick++
          break
      }
    })

    const summary = {
      total: records.length,
      present,
      absent,
      late,
      excused,
      sick,
      attendanceRate: records.length > 0 ? Math.round((present / records.length) * 100) : 0,
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        records,
        summary,
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/attendance — batch submit attendance
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { classId, subjectId, date } = body
    const items = body.records || body.entries

    if (!classId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'classId and an array of records/entries are required' },
        { status: 400 },
      )
    }

    // Look up active term & academic year from DB
    const now = new Date()
    let activeTerm = await prisma.term.findFirst({
      where: { isCurrent: true },
      include: { academicYear: true },
    })

    if (!activeTerm) {
      activeTerm = await prisma.term.findFirst({
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: { academicYear: true },
      })
    }

    if (!activeTerm) {
      activeTerm = await prisma.term.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { academicYear: true },
      })
    }

    if (!activeTerm) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No academic term found in database' },
        { status: 500 },
      )
    }

    const termId = activeTerm.id
    const academicYearId = activeTerm.academicYearId
    const recordDate = date ? new Date(date) : new Date()

    const results = []
    for (const r of items) {
      const rec = await prisma.attendance.upsert({
        where: {
          studentId_classId_subjectId_date: {
            studentId: r.studentId,
            classId,
            subjectId: subjectId || null,
            date: recordDate,
          },
        },
        update: {
          status: r.status as AttendanceStatus,
          remarks: r.remarks ?? null,
          markedById: session.user.id,
        },
        create: {
          studentId: r.studentId,
          classId,
          subjectId: subjectId || null,
          date: recordDate,
          status: r.status as AttendanceStatus,
          remarks: r.remarks ?? null,
          markedById: session.user.id,
          termId,
          academicYearId,
        },
      })
      results.push(rec)
    }

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      module: 'ATTENDANCE',
      entityType: 'AttendanceRegister',
      entityId: classId,
      newValue: { count: results.length, date: recordDate, classId },
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: `Successfully recorded ${results.length} attendance entries`, data: { count: results.length } },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
