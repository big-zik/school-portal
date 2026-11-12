import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'

// GET /api/examinations/schedules — list CA and Exam schedules filtered by class
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const classId = searchParams.get('classId')
    const type = searchParams.get('type') // 'CA' | 'FINAL' | 'MID_TERM'

    const where: any = {}
    if (classId) where.classId = classId
    if (type) {
      where.examination = { type }
    }

    const schedules = await prisma.examSchedule.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true, level: true } },
        examination: {
          select: {
            id: true,
            name: true,
            type: true,
            startDate: true,
            endDate: true,
            isPublished: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
      take: 100,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: schedules,
    })
  } catch (error: any) {
    console.error('Error fetching exam schedules:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
