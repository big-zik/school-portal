import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { EnrollmentStatus } from '@prisma/client'
import type { ApiResponse } from '@/types'

// POST /api/students/promotions — bulk promotion, stream allocation, repeat, or graduation
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const roles = (session.user as any).roles || []
    if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden. Admin privileges required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, studentIds, sourceClassId, targetClassId, targetAcademicYearId, targetTermId, stream } = body

    if (!action || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'action and an array of studentIds are required' },
        { status: 400 },
      )
    }

    // Resolve target academic year & term if promoting/repeating
    let academicYearId = targetAcademicYearId
    let termId = targetTermId

    if (action === 'PROMOTE' || action === 'REPEAT' || action === 'ASSIGN_STREAM') {
      if (!targetClassId) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'targetClassId is required for promotion or repetition' },
          { status: 400 },
        )
      }

      if (!academicYearId || !termId) {
        const activeTerm = await prisma.term.findFirst({
          where: { isCurrent: true },
          include: { academicYear: true },
        })
        academicYearId = academicYearId || activeTerm?.academicYearId || (await prisma.academicYear.findFirst())?.id
        termId = termId || activeTerm?.id || (await prisma.term.findFirst())?.id
      }

      if (!academicYearId || !termId) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Target academic year and term could not be determined' },
          { status: 500 },
        )
      }
    }

    const results = []

    for (const studentId of studentIds) {
      // Find current active enrollment
      const currentEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId,
          status: 'ACTIVE',
        },
        orderBy: { enrolledAt: 'desc' },
      })

      if (action === 'GRADUATE') {
        if (currentEnrollment) {
          await prisma.enrollment.update({
            where: { id: currentEnrollment.id },
            data: { status: 'COMPLETED' },
          })
        }
        await prisma.student.update({
          where: { id: studentId },
          data: { status: 'GRADUATED' },
        })
        results.push({ studentId, action: 'GRADUATED' })
      } else if (action === 'REPEAT') {
        if (currentEnrollment) {
          await prisma.enrollment.update({
            where: { id: currentEnrollment.id },
            data: { status: 'COMPLETED' },
          })
        }
        const newEnrollment = await prisma.enrollment.create({
          data: {
            studentId,
            classId: targetClassId || currentEnrollment?.classId || sourceClassId,
            academicYearId,
            termId,
            status: 'ACTIVE',
            enrolledAt: new Date(),
          },
        })
        results.push({ studentId, action: 'REPEATED', newEnrollmentId: newEnrollment.id })
      } else {
        // PROMOTE or ASSIGN_STREAM
        if (currentEnrollment) {
          await prisma.enrollment.update({
            where: { id: currentEnrollment.id },
            data: { status: 'COMPLETED' },
          })
        }

        // Create new active enrollment in target class
        const newEnrollment = await prisma.enrollment.create({
          data: {
            studentId,
            classId: targetClassId,
            academicYearId,
            termId,
            status: 'ACTIVE',
            enrolledAt: new Date(),
          },
        })

        // If target class or arm has stream (e.g. Science, Arts, Commercial)
        await prisma.student.update({
          where: { id: studentId },
          data: {
            currentClassId: targetClassId,
            status: 'ACTIVE',
          },
        })

        results.push({ studentId, action: 'PROMOTED', newEnrollmentId: newEnrollment.id, stream })
      }
    }

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      module: 'STUDENTS',
      entityType: 'StudentPromotion',
      entityId: sourceClassId || 'BULK',
      newValue: { action, count: results.length, targetClassId, stream },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Successfully processed ${results.length} students (${action})`,
      data: results,
    })
  } catch (error: any) {
    console.error('POST /api/students/promotions error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
