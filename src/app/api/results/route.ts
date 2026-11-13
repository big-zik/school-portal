import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// Helper for Nigerian Secondary Grading Scale:
// 75-100: A1 (Distinction)
// 70-74:  B2 (Very Good)
// 65-69:  B3 (Good)
// 60-64:  C4 (Credit)
// 55-59:  C5 (Credit)
// 50-54:  C6 (Credit)
// 45-49:  D7 (Pass)
// 40-44:  E8 (Pass)
// 0-39:   F9 (Fail)
function calculateNigerianGrade(total: number): { grade: string; remark: string } {
  if (total >= 75) return { grade: 'A1', remark: 'Distinction' }
  if (total >= 70) return { grade: 'B2', remark: 'Very Good' }
  if (total >= 65) return { grade: 'B3', remark: 'Good' }
  if (total >= 60) return { grade: 'C4', remark: 'Credit' }
  if (total >= 55) return { grade: 'C5', remark: 'Credit' }
  if (total >= 50) return { grade: 'C6', remark: 'Credit' }
  if (total >= 45) return { grade: 'D7', remark: 'Pass' }
  if (total >= 40) return { grade: 'E8', remark: 'Pass' }
  return { grade: 'F9', remark: 'Fail' }
}

// GET /api/results — query results for a class & subject
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')
    const termId = searchParams.get('termId')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (classId) where.classId = classId
    if (subjectId) where.subjectId = subjectId
    if (termId) where.termId = termId
    if (studentId) where.studentId = studentId

    const userRoles: string[] = (session.user as any)?.roles || []
    const isPrivileged = userRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(r))

    let targetStudentId = studentId

    // Enforce role-based student scoping and fee check for unprivileged users (STUDENT and PARENT)
    if (!isPrivileged) {
      if (userRoles.includes('STUDENT')) {
        const studentRecord = await prisma.student.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        })
        if (!studentRecord) {
          return NextResponse.json<ApiResponse>({ success: false, error: 'Student profile not found' }, { status: 404 })
        }
        targetStudentId = studentRecord.id
        where.studentId = studentRecord.id
      } else if (userRoles.includes('PARENT')) {
        const guardian = await prisma.guardian.findUnique({
          where: { userId: session.user.id },
          include: { studentGuardians: { select: { studentId: true } } },
        })
        const childIds = guardian?.studentGuardians.map((sg) => sg.studentId) || []
        if (targetStudentId && !childIds.includes(targetStudentId)) {
          return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: Access to requested student results denied' }, { status: 403 })
        }
        if (!targetStudentId) {
          targetStudentId = childIds[0]
        }
        if (targetStudentId) {
          where.studentId = targetStudentId
        }
      }

      // Check for outstanding fee balance (Fee-Based Result Lock)
      if (targetStudentId) {
        const unpaidInvoices = await prisma.invoice.findMany({
          where: {
            studentId: targetStudentId,
            status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
            balanceAmount: { gt: 0 },
          },
          select: {
            id: true,
            invoiceNumber: true,
            balanceAmount: true,
            totalAmount: true,
            dueDate: true,
          },
        })

        const totalBalance = unpaidInvoices.reduce((acc, inv) => acc + (inv.balanceAmount || 0), 0)
        if (totalBalance > 0) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: 'Fee-based result lock: Terminal academic records are locked pending tuition clearance.',
              data: {
                locked: true,
                studentId: targetStudentId,
                outstandingBalance: totalBalance,
                invoices: unpaidInvoices,
              },
            },
            { status: 403 },
          )
        }
      }
    }

    const results = await prisma.result.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true } },
        term: { select: { id: true, name: true } },
      },
      orderBy: { totalScore: 'desc' },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: results })
  } catch (error: any) {
    console.error('GET /api/results error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/results — batch record/save Continuous Assessment & Exam scores
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { classId, subjectId, examinationId: reqExamId, scores } = body

    if (!classId || !subjectId || !scores || !Array.isArray(scores) || scores.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'classId, subjectId, and an array of scores are required' },
        { status: 400 },
      )
    }

    // Resolve or find current Term & Academic Year
    const activeTerm = await prisma.term.findFirst({
      where: { isCurrent: true },
      include: { academicYear: true },
    })

    const term = activeTerm || (await prisma.term.findFirst({ include: { academicYear: true } }))
    if (!term || !term.academicYearId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Academic term not configured' }, { status: 500 })
    }

    // Resolve examination
    let examId = reqExamId
    if (!examId) {
      const exam = await prisma.examination.findFirst({
        where: { termId: term.id },
      })
      if (exam) {
        examId = exam.id
      } else {
        const anyExam = await prisma.examination.findFirst()
        if (anyExam) {
          examId = anyExam.id
        } else {
          // Create default term examination record
          const school = await prisma.school.findFirst()
          if (!school) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'School not found' }, { status: 500 })
          }
          const createdExam = await prisma.examination.create({
            data: {
              schoolId: school.id,
              name: `${term.name} Examination`,
              type: 'FINAL',
              termId: term.id,
              academicYearId: term.academicYearId,
              startDate: new Date(),
              endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          })
          examId = createdExam.id
        }
      }
    }

    // Sort scores descending to calculate positions/ranks
    const computedScores = scores.map((s: any) => {
      const ca1 = Math.min(20, Math.max(0, parseFloat(s.ca1 ?? s.caScore ?? 0) || 0))
      const ca2 = Math.min(20, Math.max(0, parseFloat(s.ca2 ?? 0) || 0))
      const caTotal = ca1 + ca2
      const examScore = Math.min(60, Math.max(0, parseFloat(s.examScore ?? 0) || 0))
      const totalScore = Math.min(100, caTotal + examScore)
      const grading = calculateNigerianGrade(totalScore)

      return {
        studentId: s.studentId,
        caScore: caTotal,
        examScore,
        totalScore,
        percentage: totalScore,
        letterGrade: grading.grade,
        teacherRemark: s.teacherRemark || grading.remark,
      }
    })

    // Sort to assign positions
    computedScores.sort((a: any, b: any) => b.totalScore - a.totalScore)

    const savedResults = []
    for (let i = 0; i < computedScores.length; i++) {
      const row = computedScores[i]
      const position = i + 1

      const result = await prisma.result.upsert({
        where: {
          studentId_examinationId_subjectId: {
            studentId: row.studentId,
            examinationId: examId,
            subjectId,
          },
        },
        update: {
          classId,
          termId: term.id,
          academicYearId: term.academicYearId,
          caScore: row.caScore,
          examScore: row.examScore,
          totalScore: row.totalScore,
          percentage: row.percentage,
          letterGrade: row.letterGrade,
          position,
          teacherRemark: row.teacherRemark,
        },
        create: {
          studentId: row.studentId,
          examinationId: examId,
          subjectId,
          classId,
          termId: term.id,
          academicYearId: term.academicYearId,
          caScore: row.caScore,
          examScore: row.examScore,
          totalScore: row.totalScore,
          percentage: row.percentage,
          letterGrade: row.letterGrade,
          position,
          teacherRemark: row.teacherRemark,
        },
      })
      savedResults.push(result)
    }

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      module: 'EXAMINATIONS',
      entityType: 'ContinuousAssessment',
      entityId: `${classId}_${subjectId}`,
      newValue: { count: savedResults.length, examId },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Successfully processed and recorded scores for ${savedResults.length} students`,
        data: savedResults,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/results error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
