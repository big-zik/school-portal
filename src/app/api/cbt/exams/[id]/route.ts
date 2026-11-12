import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'

// GET /api/cbt/exams/[id] — get details of a specific CBT exam
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const log = await prisma.auditLog.findUnique({
      where: { id },
    })

    if (!log || log.module !== 'CBT_EXAM') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'CBT examination not found' }, { status: 404 })
    }

    const data = (log.newValue as any) || {}
    const isStudent = (session.user as any).roles?.includes('STUDENT')

    // For students taking test, hide correct answers during test
    const questions = (data.questions || []).map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      ...(!isStudent && { correctOption: q.correctOption, explanation: q.explanation }),
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: log.id,
        title: data.title,
        subjectName: data.subjectName,
        className: data.className,
        durationMinutes: data.durationMinutes,
        passingScore: data.passingScore,
        totalMarks: data.totalMarks,
        questions,
      },
    })
  } catch (error: any) {
    console.error('GET /api/cbt/exams/[id] error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
