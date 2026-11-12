import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import bcrypt from 'bcryptjs'
import type { ApiResponse, PaginationMeta } from '@/types'

// GET /api/teachers — paginated list of teachers with search and department filtering
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
    const departmentId = searchParams.get('departmentId') ?? undefined
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (departmentId) where.departmentId = departmentId

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, teachers] = await Promise.all([
      prisma.teacher.count({ where: where as any }),
      prisma.teacher.findMany({
        where: where as any,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true, isActive: true } },
          department: { select: { id: true, name: true } },
          classSubjects: {
            include: {
              class: { select: { id: true, name: true } },
              subject: { select: { id: true, name: true, code: true } },
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
      data: teachers,
      pagination,
    })
  } catch (error: any) {
    console.error('GET /api/teachers error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/teachers — create a new teacher profile
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, employeeId, qualification, specialization, departmentId, gender, employmentType } = body

    if (!name || !email || !employeeId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Name, email, and employee ID are required' }, { status: 400 })
    }

    // Check duplicate email or employeeId
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'A user with this email already exists' }, { status: 409 })
    }

    const existingEmp = await prisma.teacher.findUnique({ where: { employeeId } })
    if (existingEmp) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'A teacher with this employee ID already exists' }, { status: 409 })
    }

    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'No school found' }, { status: 500 })
    }

    const teacherRole = await prisma.role.findFirst({ where: { name: 'TEACHER' } })
    const defaultPasswordHash = await bcrypt.hash('Password@123', 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: defaultPasswordHash,
          emailVerified: true,
          isActive: true,
        },
      })

      if (teacherRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: teacherRole.id,
          },
        })
      }

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          schoolId: school.id,
          employeeId,
          qualification: qualification || null,
          specialization: specialization || null,
          departmentId: departmentId || null,
          gender: gender || null,
          employmentType: employmentType || 'FULL_TIME',
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          department: { select: { id: true, name: true } },
        },
      })

      return teacher
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'STAFF',
      entityType: 'Teacher',
      entityId: result.id,
      newValue: { name, email, employeeId, qualification },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: 'Teacher created successfully',
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/teachers error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
