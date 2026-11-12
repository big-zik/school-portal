import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'

// GET /api/assignments/[id]/submissions — list submissions for an assignment
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const submissions = await prisma.submission.findMany({
      where: { assignmentId: id },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        grade: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: submissions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/assignments/[id]/submissions — submit work (by student) or grade work (by teacher)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assignmentId } = await params
    const body = await req.json()
    const { action } = body // 'SUBMIT' or 'GRADE'

    if (action === 'GRADE') {
      // Teacher grading a submission
      const { submissionId, studentId, marksObtained, feedback } = body
      if (!submissionId || marksObtained === undefined) {
        return NextResponse.json({ error: 'submissionId and marksObtained are required' }, { status: 400 })
      }

      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      })
      if (!assignment) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
      }

      let teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      })
      if (!teacher) {
        teacher = await prisma.teacher.findFirst()
      }
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher profile required to grade' }, { status: 403 })
      }

      const marks = parseFloat(marksObtained)
      const total = assignment.totalMarks || 100
      const percentage = Math.min(100, Math.round((marks / total) * 100 * 10) / 10)

      let letterGrade = 'F'
      if (percentage >= 75) letterGrade = 'A'
      else if (percentage >= 65) letterGrade = 'B'
      else if (percentage >= 50) letterGrade = 'C'
      else if (percentage >= 40) letterGrade = 'D'

      const grade = await prisma.grade.upsert({
        where: { submissionId },
        update: {
          marksObtained: marks,
          percentage,
          letterGrade,
          feedback: feedback || null,
          gradedById: teacher.id,
          gradedAt: new Date(),
        },
        create: {
          submissionId,
          studentId,
          assignmentId,
          marksObtained: marks,
          percentage,
          letterGrade,
          feedback: feedback || null,
          gradedById: teacher.id,
          gradedAt: new Date(),
        },
      })

      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'GRADED' },
      })

      await logAudit({
        userId: session.user.id,
        action: 'UPDATE',
        module: 'ACADEMICS',
        entityType: 'SubmissionGrade',
        entityId: submissionId,
        newValue: { marksObtained: marks, letterGrade },
      })

      return NextResponse.json({ success: true, data: grade })
    }

    // Default: Student submitting work
    const { remarks, files } = body
    let student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    })

    if (!student) {
      // In demo/test fallback
      student = await prisma.student.findFirst()
    }

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    })
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const isLate = new Date() > new Date(assignment.dueDate)

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id,
        },
      },
      update: {
        submittedAt: new Date(),
        files: files || null,
        remarks: remarks || null,
        isLate,
        status: 'SUBMITTED',
      },
      create: {
        assignmentId,
        studentId: student.id,
        submittedAt: new Date(),
        files: files || null,
        remarks: remarks || null,
        isLate,
        status: 'SUBMITTED',
      },
    })

    return NextResponse.json({ success: true, data: submission })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
