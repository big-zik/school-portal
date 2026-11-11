import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { studentProfileSchema } from '@/lib/validators'
import bcrypt from 'bcryptjs'
import type { ApiResponse, PaginationMeta } from '@/types'

// Map validator bloodGroup strings to Prisma enum values
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

// GET /api/students — paginated list with search & filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const search = searchParams.get('search') ?? ''
    const classId = searchParams.get('classId') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (classId) where.currentClassId = classId
    if (status) where.status = status

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where: where as any }),
      prisma.student.findMany({
        where: where as any,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true, isActive: true } },
          currentClass: { select: { id: true, name: true, level: true } },
          currentSection: { select: { id: true, name: true, roomNumber: true } },
          studentGuardians: {
            include: {
              guardian: {
                include: {
                  user: { select: { name: true, email: true, phone: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: students,
      pagination,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/students — create a new student (User + Student + UserRole)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Role check — only ADMIN / SUPER_ADMIN
    const callerRoles: string[] = (session.user as any).roles ?? []
    if (!callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = studentProfileSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      parsed.error.errors.forEach((e) => {
        const key = e.path.join('.')
        errors[key] = [...(errors[key] ?? []), e.message]
      })
      return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
    }

    const data = parsed.data
    const rawPassword: string = body.password ?? Math.random().toString(36).slice(-10) + 'A1!'
    const hashedPassword = await bcrypt.hash(rawPassword, 12)

    // Look up the STUDENT role
    const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } })
    if (!studentRole) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'STUDENT role not configured' }, { status: 500 })
    }

    // Look up active academic year + term for the school (pick first active)
    const activeYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } })
    const activeTerm = activeYear
      ? await prisma.term.findFirst({ where: { academicYearId: activeYear.id, isCurrent: true } })
      : null

    // We need a schoolId — take from the active year or fall back to any school
    const schoolId = activeYear?.schoolId ?? (await prisma.school.findFirst())?.id
    if (!schoolId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'No school found in database' }, { status: 500 })
    }

    // Generate unique studentId (prefix + epoch ms)
    const studentId = `STU-${Date.now()}`

    const student = await prisma.$transaction(async (tx) => {
      // 1. Create user
      const user = await tx.user.create({
        data: {
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          password: hashedPassword,
        },
      })

      // 2. Assign STUDENT role
      await tx.userRole.create({
        data: { userId: user.id, roleId: studentRole.id },
      })

      // 3. Create student record
      const student = await tx.student.create({
        data: {
          userId: user.id,
          schoolId,
          studentId,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender as any,
          bloodGroup: data.bloodGroup ? (bloodGroupMap[data.bloodGroup] as any) : undefined,
          religion: data.religion,
          nationality: data.nationality,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          emergencyContact: data.emergencyContact as any,
          medicalInfo: data.medicalInfo as any,
          admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined,
          admissionNumber: data.admissionNumber,
          currentClassId: data.currentClassId,
          currentSectionId: data.currentSectionId,
          currentAcademicYearId: activeYear?.id,
          currentTermId: activeTerm?.id,
          status: 'ACTIVE',
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          currentClass: { select: { id: true, name: true } },
        },
      })

      return student
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'Students',
      entityType: 'Student',
      entityId: student.id,
      newValue: { studentId: student.studentId, name: data.fullName, email: data.email },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: student }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
