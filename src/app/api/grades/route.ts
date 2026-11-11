import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

const gradeInputSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  marksObtained: z
    .number({ invalid_type_error: 'Marks must be a number' })
    .min(0, 'Marks cannot be negative'),
  feedback: z.string().max(2000).optional(),
})

function calculateLetterGrade(pct: number): string {
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

// GET /api/grades — query student grades filtered by studentId, subjectId, termId
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    let studentId = searchParams.get('studentId') ?? undefined
    const subjectId = searchParams.get('subjectId') ?? undefined
    const termId = searchParams.get('termId') ?? undefined

    const callerRoles: string[] = (session.user as any).roles ?? []
    const isStudent = callerRoles.includes('STUDENT') && !callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(r))

    // If caller is student, constrain to their student record
    if (isStudent) {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      })
      if (!student) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Student profile not found' }, { status: 404 })
      }
      studentId = student.id
    }

    const where: Record<string, unknown> = {}
    if (studentId) where.studentId = studentId

    if (subjectId || termId) {
      where.assignment = {
        ...(subjectId ? { subjectId } : {}),
        ...(termId ? { termId } : {}),
      }
    }

    const grades = await prisma.grade.findMany({
      where: where as any,
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            subject: { select: { id: true, name: true, code: true } },
            term: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
        },
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        gradedBy: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { gradedAt: 'desc' },
      take: 100,
    })

    return NextResponse.json<ApiResponse>({ success: true, data: grades })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/grades — teacher submits or updates a grade
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    if (!callerRoles.some((r) => ['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(r))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: only teachers or admins can submit grades' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = gradeInputSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      parsed.error.errors.forEach((e) => {
        const key = e.path.join('.')
        errors[key] = [...(errors[key] ?? []), e.message]
      })
      return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
    }

    const { submissionId, marksObtained, feedback } = parsed.data

    // Find submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: true,
      },
    })

    if (!submission) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Submission not found' }, { status: 404 })
    }

    // Resolve teacher record
    let teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    })

    if (!teacher) {
      // If admin/super_admin graded, fall back to assignment teacher or first teacher
      teacher = await prisma.teacher.findUnique({
        where: { id: submission.assignment.teacherId },
      })
      if (!teacher) {
        teacher = await prisma.teacher.findFirst()
      }
    }

    if (!teacher) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Teacher profile not found' }, { status: 400 })
    }

    const totalMarks = submission.assignment.totalMarks || 100
    const percentage = Math.min(100, Math.round((marksObtained / totalMarks) * 100 * 10) / 10)
    const letterGrade = calculateLetterGrade(percentage)
    const now = new Date()

    const grade = await prisma.$transaction(async (tx) => {
      // Update submission status to GRADED
      await tx.submission.update({
        where: { id: submissionId },
        data: { status: 'GRADED' },
      })

      // Upsert Grade
      return tx.grade.upsert({
        where: { submissionId },
        update: {
          marksObtained,
          percentage,
          letterGrade,
          feedback: feedback ?? null,
          gradedById: teacher!.id,
          gradedAt: now,
        },
        create: {
          submissionId,
          studentId: submission.studentId,
          assignmentId: submission.assignmentId,
          marksObtained,
          percentage,
          letterGrade,
          feedback: feedback ?? null,
          gradedById: teacher!.id,
          gradedAt: now,
        },
        include: {
          assignment: { select: { id: true, title: true, totalMarks: true } },
          student: { include: { user: { select: { id: true, name: true } } } },
        },
      })
    })

    await logAudit({
      userId: session.user.id,
      action: 'GRADE_CHANGE',
      module: 'Grades',
      entityType: 'Grade',
      entityId: grade.id,
      newValue: {
        marksObtained,
        percentage,
        letterGrade,
        submissionId,
        studentId: submission.studentId,
      },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: grade }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
