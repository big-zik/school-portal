import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// POST /api/cbt/attempts — grade and record student CBT attempt
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { examId, answers } = body // answers: { "q-1": "B", "q-2": "C" }

    if (!examId || !answers) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'examId and answers object are required' },
        { status: 400 },
      )
    }

    const examLog = await prisma.auditLog.findUnique({
      where: { id: examId },
    })

    if (!examLog || examLog.module !== 'CBT_EXAM') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Exam not found' }, { status: 404 })
    }

    const examData = (examLog.newValue as any) || {}
    const questions = examData.questions || []

    let marksObtained = 0
    let totalMarks = examData.totalMarks || 100
    const questionReview = []

    for (const q of questions) {
      const studentChoice = answers[q.id]
      const isCorrect = studentChoice === q.correctOption
      const awarded = isCorrect ? q.marks || 10 : 0
      marksObtained += awarded

      questionReview.push({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        studentChoice: studentChoice || 'SKIPPED',
        correctOption: q.correctOption,
        isCorrect,
        awardedMarks: awarded,
        explanation: q.explanation || '',
      })
    }

    const percentage = Math.min(100, Math.round((marksObtained / totalMarks) * 100 * 10) / 10)
    const passed = percentage >= (examData.passingScore || 50)

    // Log student attempt
    const attempt = await logAudit({
      userId: session.user.id,
      action: 'SUBMIT_CBT_ATTEMPT',
      module: 'CBT_ATTEMPT',
      entityType: 'CBTAttempt',
      entityId: examId,
      newValue: {
        examId,
        examTitle: examData.title,
        marksObtained,
        totalMarks,
        percentage,
        passed,
        candidateName: session.user.name || 'Candidate',
        submittedAt: new Date(),
        questionReview,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: passed ? 'Congratulations! You passed the CBT test.' : 'Test completed. Keep studying to improve!',
      data: {
        attemptId: attempt?.id || `att_${Date.now()}`,
        examTitle: examData.title,
        marksObtained,
        totalMarks,
        percentage,
        passed,
        passingScore: examData.passingScore || 50,
        questionReview,
      },
    })
  } catch (error: any) {
    console.error('POST /api/cbt/attempts error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
