import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// GET /api/cbt/exams — list CBT examinations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')

    const where: any = { module: 'CBT_EXAM' }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const exams = logs.map((l) => {
      const data = (l.newValue as any) || {}
      return {
        id: l.id,
        title: data.title || l.action,
        subjectId: data.subjectId,
        subjectName: data.subjectName || 'General Science',
        classId: data.classId,
        className: data.className || 'Senior Secondary',
        durationMinutes: data.durationMinutes || 30,
        passingScore: data.passingScore || 50,
        totalMarks: data.totalMarks || 100,
        questionCount: data.questions?.length || 10,
        questions: data.questions || [],
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        createdAt: l.createdAt,
      }
    })

    const filtered = exams.filter((e) => {
      const matchClass = !classId || e.classId === classId
      const matchSub = !subjectId || e.subjectId === subjectId
      return matchClass && matchSub
    })

    return NextResponse.json<ApiResponse>({ success: true, data: filtered })
  } catch (error: any) {
    console.error('GET /api/cbt/exams error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/cbt/exams — create new CBT examination & question bank
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      subjectId,
      subjectName,
      classId,
      className,
      durationMinutes,
      passingScore,
      totalMarks,
      questions,
    } = body

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Title and an array of questions are required' },
        { status: 400 },
      )
    }

    const examData = {
      title,
      subjectId: subjectId || null,
      subjectName: subjectName || 'General',
      classId: classId || null,
      className: className || 'All Classes',
      durationMinutes: Number(durationMinutes) || 30,
      passingScore: Number(passingScore) || 50,
      totalMarks: Number(totalMarks) || 100,
      questions: questions.map((q: any, idx: number) => ({
        id: `q-${idx + 1}`,
        questionText: q.questionText,
        options: {
          A: q.options?.A || 'Option A',
          B: q.options?.B || 'Option B',
          C: q.options?.C || 'Option C',
          D: q.options?.D || 'Option D',
        },
        correctOption: q.correctOption || 'A',
        marks: Number(q.marks) || Math.round((Number(totalMarks) || 100) / questions.length),
        explanation: q.explanation || '',
      })),
      isPublished: true,
      createdBy: session.user.id,
    }

    const log = await logAudit({
      userId: session.user.id,
      action: 'CREATE_CBT_EXAM',
      module: 'CBT_EXAM',
      entityType: 'CBTExamination',
      newValue: examData,
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'CBT exam published successfully', data: { id: log?.id || `cbt_${Date.now()}`, ...examData } },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/cbt/exams error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
