import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { studentProfileSchema } from '@/lib/validators'
import type { ApiResponse } from '@/types'

const bloodGroupMap: Record<string, string> = {
  'A+': 'A_POSITIVE',
  'A-': 'A_NEGATIVE',
  'B+': 'B_POSITIVE',
  'B-': 'B_NEGATIVE',
  'AB+': 'AB_POSITIVE',
  'AB-': 'AB_NEGATIVE',
  'O+': 'O_POSITIVE',
  'O-': 'O_NEGATIVE',
  UNKNOWN: 'UNKNOWN',
}

// GET /api/students/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, isActive: true, createdAt: true } },
        currentClass: { select: { id: true, name: true, level: true } },
        currentSection: { select: { id: true, name: true, roomNumber: true } },
        currentAcademicYear: { select: { id: true, name: true, startDate: true, endDate: true } },
        currentTerm: { select: { id: true, name: true, startDate: true, endDate: true } },
        studentGuardians: {
          include: {
            guardian: {
              include: {
                user: { select: { name: true, email: true, phone: true } },
              },
            },
          },
        },
        enrollments: {
          include: {
            class: { select: { name: true } },
            term: { select: { name: true } },
            academicYear: { select: { name: true } },
          },
          orderBy: { enrolledAt: 'desc' },
          take: 5,
        },
        studentDocuments: {
          select: { id: true, type: true, name: true, file: true, status: true, createdAt: true },
        },
      },
    })

    if (!student || student.deletedAt) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({ success: true, data: student })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// PATCH /api/students/[id]
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

    const existing = await prisma.student.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    if (!existing || existing.deletedAt) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Student not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = studentProfileSchema.partial().safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      parsed.error.errors.forEach((e) => {
        const key = e.path.join('.')
        errors[key] = [...(errors[key] ?? []), e.message]
      })
      return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
    }

    const data = parsed.data

    const updated = await prisma.$transaction(async (tx) => {
      // Update user fields if provided
      if (data.fullName || data.email || data.phone) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            ...(data.fullName ? { name: data.fullName } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
          },
        })
      }

      // Update student fields
      return tx.student.update({
        where: { id },
        data: {
          ...(data.dateOfBirth ? { dateOfBirth: new Date(data.dateOfBirth) } : {}),
          ...(data.gender ? { gender: data.gender as any } : {}),
          ...(data.bloodGroup ? { bloodGroup: bloodGroupMap[data.bloodGroup] as any } : {}),
          ...(data.religion !== undefined ? { religion: data.religion } : {}),
          ...(data.nationality !== undefined ? { nationality: data.nationality } : {}),
          ...(data.address !== undefined ? { address: data.address } : {}),
          ...(data.city !== undefined ? { city: data.city } : {}),
          ...(data.state !== undefined ? { state: data.state } : {}),
          ...(data.country !== undefined ? { country: data.country } : {}),
          ...(data.emergencyContact ? { emergencyContact: data.emergencyContact as any } : {}),
          ...(data.medicalInfo ? { medicalInfo: data.medicalInfo as any } : {}),
          ...(data.admissionDate ? { admissionDate: new Date(data.admissionDate) } : {}),
          ...(data.admissionNumber !== undefined ? { admissionNumber: data.admissionNumber } : {}),
          ...(data.currentClassId !== undefined ? { currentClassId: data.currentClassId } : {}),
          ...(data.currentSectionId !== undefined ? { currentSectionId: data.currentSectionId } : {}),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          currentClass: { select: { id: true, name: true } },
        },
      })
    })

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      module: 'Students',
      entityType: 'Student',
      entityId: id,
      oldValue: { name: existing.user.name, email: existing.user.email },
      newValue: { ...data },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/students/[id] — soft delete (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    if (!callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.student.findUnique({
      where: { id },
      select: { id: true, userId: true, studentId: true, deletedAt: true },
    })
    if (!existing || existing.deletedAt) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Student not found' }, { status: 404 })
    }

    const now = new Date()
    await prisma.$transaction([
      prisma.student.update({
        where: { id },
        data: { deletedAt: now, status: 'WITHDRAWN' },
      }),
      prisma.user.update({
        where: { id: existing.userId },
        data: { deletedAt: now, isActive: false },
      }),
    ])

    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      module: 'Students',
      entityType: 'Student',
      entityId: id,
      newValue: { studentId: existing.studentId, deletedAt: now },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
