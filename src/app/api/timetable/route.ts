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
