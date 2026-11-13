import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'
import { DayOfWeek } from '@prisma/client'

// GET /api/timetable — list timetable slots filtered by class, teacher, or day
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const classId = searchParams.get('classId')
    const teacherId = searchParams.get('teacherId')
    const dayOfWeek = searchParams.get('dayOfWeek') as DayOfWeek | null

    const where: any = {}
    if (classId) where.classId = classId
    if (teacherId) where.teacherId = teacherId
    if (dayOfWeek && Object.values(DayOfWeek).includes(dayOfWeek)) {
      where.dayOfWeek = dayOfWeek
    }

    // If caller is student without explicit classId, default to student's class
    const callerRoles = ((session.user as any).roles || []) as string[]
    if (callerRoles.includes('STUDENT') && !classId && !teacherId) {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { currentClassId: true },
      })
      if (student?.currentClassId) {
        where.classId = student.currentClassId
      }
    }

    // If caller is parent without explicit classId, find parent's first student's class
    if (callerRoles.includes('PARENT') && !classId && !teacherId) {
      const guardian = await prisma.guardian.findUnique({
        where: { userId: session.user.id },
        include: {
          studentGuardians: {
            include: {
              student: { select: { currentClassId: true } },
            },
          },
        },
      })
      const childClassId = guardian?.studentGuardians?.[0]?.student?.currentClassId
      if (childClassId) {
        where.classId = childClassId
      }
    }

    // If caller is teacher without explicit teacherId/classId, default to teacher's schedule
    if (callerRoles.includes('TEACHER') && !classId && !teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (teacher?.id) {
        where.teacherId = teacher.id
      }
    }

    const timetable = await prisma.timetable.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true, level: true } },
        teacher: {
          select: {
            id: true,
            user: { select: { name: true, email: true, avatar: true } },
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: timetable,
    })
  } catch (error: any) {
    console.error('GET /api/timetable error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/timetable — create a timetable period slot
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = ((session.user as any).roles || []) as string[]
    const allowed = ['SUPER_ADMIN', 'ADMIN', 'TEACHER']
    if (!allowed.some((role) => userRoles.includes(role))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const {
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      sectionId,
      academicYearId,
      termId,
    } = body

    if (!classId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'classId, subjectId, teacherId, dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      )
    }

    // Validate day of week
    if (!Object.values(DayOfWeek).includes(dayOfWeek as DayOfWeek)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Invalid day of week: ${dayOfWeek}` },
        { status: 400 }
      )
    }

    // Resolve academic year
    let resolvedYearId = academicYearId
    if (!resolvedYearId) {
      const year = await prisma.academicYear.findFirst({
        where: { isCurrent: true },
      }) || await prisma.academicYear.findFirst({
        orderBy: { startDate: 'desc' },
      })
      resolvedYearId = year?.id
    }

    // If still missing, create a fallback academic year
    if (!resolvedYearId) {
      const school = await prisma.school.findFirst()
      if (!school) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'School not configured' }, { status: 400 })
      }
      const newYear = await prisma.academicYear.create({
        data: {
          schoolId: school.id,
          name: '2025/2026 Academic Session',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2026-07-31'),
          isCurrent: true,
        },
      })
      resolvedYearId = newYear.id
    }

    // Resolve term
    let resolvedTermId = termId
    if (!resolvedTermId) {
      const term = await prisma.term.findFirst({
        where: { isCurrent: true, academicYearId: resolvedYearId },
      }) || await prisma.term.findFirst({
        where: { academicYearId: resolvedYearId },
      })
      resolvedTermId = term?.id
    }

    // If still missing, create a fallback term
    if (!resolvedTermId) {
      const newTerm = await prisma.term.create({
        data: {
          academicYearId: resolvedYearId,
          name: 'Second Term',
          startDate: new Date('2026-01-08'),
          endDate: new Date('2026-04-10'),
          isCurrent: true,
        },
      })
      resolvedTermId = newTerm.id
    }

    const slot = await prisma.timetable.create({
      data: {
        classId,
        subjectId,
        teacherId,
        dayOfWeek: dayOfWeek as DayOfWeek,
        startTime,
        endTime,
        room: room || null,
        sectionId: sectionId || null,
        academicYearId: resolvedYearId,
        termId: resolvedTermId,
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true, level: true } },
        teacher: {
          select: {
            id: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: slot,
        message: 'Timetable period slot scheduled successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/timetable error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
