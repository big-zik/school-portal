import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { hash } from 'bcryptjs'
import { AdmissionStatus, Gender, RoleName, StudentStatus, EnrollmentStatus, GuardianRelationship } from '@prisma/client'
import type { ApiResponse } from '@/types'

// GET /api/admissions/[id] — get single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: {
        appliedClass: true,
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (!application) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({ success: true, data: application })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// PATCH /api/admissions/[id] — update review status or notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, reviewNote } = body

    const updated = await prisma.admissionApplication.update({
      where: { id },
      data: {
        ...(status ? { status: status as AdmissionStatus } : {}),
        ...(reviewNote !== undefined ? { reviewNote } : {}),
        reviewedById: session.user.id,
      },
      include: {
        appliedClass: true,
        reviewedBy: { select: { id: true, name: true } },
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE_ADMISSION_STATUS',
      module: 'Admissions',
      entityType: 'AdmissionApplication',
      entityId: id,
      newValue: { status, reviewNote },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Application status updated successfully',
      data: updated,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/admissions/[id] — convert application to enrolled student record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    const canConvert = callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))
    if (!canConvert) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { appliedClass: true },
    })

    if (!application) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Application not found' }, { status: 404 })
    }

    // 1. Roles
    const studentRole = await prisma.role.findFirst({ where: { name: RoleName.STUDENT } })
    const parentRole = await prisma.role.findFirst({ where: { name: RoleName.PARENT } })
    const defaultPassword = await hash('Password@123', 12)

    // 2. Academic Session & Term
    const currentYear =
      (await prisma.academicYear.findFirst({ where: { isCurrent: true } })) ||
      (await prisma.academicYear.findFirst({ orderBy: { createdAt: 'desc' } }))
    const currentTerm =
      (await prisma.term.findFirst({ where: { isCurrent: true } })) ||
      (await prisma.term.findFirst({ orderBy: { createdAt: 'desc' } }))

    const yearSuffix = new Date().getFullYear().toString()
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString()
    const studentIdNumber = `STU${yearSuffix}${randomSuffix}`

    const nameParts = application.applicantName.trim().split(' ')
    const firstName = nameParts[0] || 'Student'
    const lastName = nameParts.slice(1).join(' ') || 'Candidate'
    const studentEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}${randomSuffix.slice(-2)}@school.com`

    const enrollmentResult = await prisma.$transaction(async (tx) => {
      // 3. Create Student User
      const studentUser = await tx.user.create({
        data: {
          name: application.applicantName,
          email: studentEmail,
          password: defaultPassword,
          isActive: true,
          roles: studentRole ? { create: { roleId: studentRole.id } } : undefined,
        },
      })

      // 4. Create Student Record
      const newStudent = await tx.student.create({
        data: {
          userId: studentUser.id,
          studentId: studentIdNumber,
          schoolId: application.schoolId,
          gender: application.gender || Gender.OTHER,
          dateOfBirth: application.dateOfBirth || new Date('2010-01-01'),
          currentClassId: application.appliedClassId,
          currentAcademicYearId: currentYear?.id,
          currentTermId: currentTerm?.id,
          status: StudentStatus.ACTIVE,
          admissionDate: new Date(),
        },
      })

      // 5. Parent / Guardian Creation & Linking
      let guardianRecord: any = null
      if (application.parentEmail) {
        let parentUser = await tx.user.findUnique({
          where: { email: application.parentEmail.toLowerCase().trim() },
        })

        if (!parentUser) {
          parentUser = await tx.user.create({
            data: {
              name: application.parentName || 'Parent',
              email: application.parentEmail.toLowerCase().trim(),
              phone: application.parentPhone || undefined,
              password: defaultPassword,
              isActive: true,
              roles: parentRole ? { create: { roleId: parentRole.id } } : undefined,
            },
          })
        }

        guardianRecord = await tx.guardian.findFirst({
          where: { userId: parentUser.id },
        })

        if (!guardianRecord) {
          guardianRecord = await tx.guardian.create({
            data: {
              userId: parentUser.id,
              relationship: GuardianRelationship.GUARDIAN,
              occupation: 'Guardian',
              officeAddress: application.address || 'Address on file',
            },
          })
        }

        // Link student and guardian
        await tx.studentGuardian.create({
          data: {
            studentId: newStudent.id,
            guardianId: guardianRecord.id,
            isPrimary: true,
          },
        })
      }

      // 6. Enrollment record
      if (application.appliedClassId && currentYear?.id && currentTerm?.id) {
        await tx.enrollment.create({
          data: {
            studentId: newStudent.id,
            classId: application.appliedClassId,
            academicYearId: currentYear.id,
            termId: currentTerm.id,
            enrolledAt: new Date(),
            status: EnrollmentStatus.ACTIVE,
          },
        })
      }

      // 7. Update Application status to ACCEPTED
      const updatedApp = await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: AdmissionStatus.ACCEPTED,
          reviewedById: session.user.id,
          reviewNote: `Converted to active student ${studentIdNumber} on ${new Date().toLocaleDateString()}`,
        },
      })

      return {
        student: newStudent,
        studentUser,
        studentId: studentIdNumber,
        temporaryPassword: 'Password@123',
        application: updatedApp,
      }
    })

    await logAudit({
      userId: session.user.id,
      action: 'CONVERT_APPLICATION_TO_STUDENT',
      module: 'Admissions',
      entityType: 'Student',
      entityId: enrollmentResult.student.id,
      newValue: {
        applicationId: application.id,
        studentId: enrollmentResult.studentId,
        studentEmail,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Applicant converted successfully! Enrolled as ${enrollmentResult.studentId}`,
      data: enrollmentResult,
    })
  } catch (error: any) {
    console.error('Error converting applicant:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
