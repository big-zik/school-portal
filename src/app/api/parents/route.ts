import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import bcrypt from 'bcryptjs'
import { GuardianRelationship } from '@prisma/client'
import type { ApiResponse } from '@/types'

// GET /api/parents — list guardians with linked students
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { occupation: { contains: search, mode: 'insensitive' } },
      ]
    }

    const guardians = await prisma.guardian.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        studentGuardians: {
          include: {
            student: {
              include: {
                user: { select: { name: true } },
                currentClass: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: guardians,
    })
  } catch (error: any) {
    console.error('GET /api/parents error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/parents — create or link a parent / guardian
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    if (!callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      relationship = 'GUARDIAN',
      occupation,
      officeAddress,
      studentIds = [],
      password,
    } = body

    if (!name || !email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Parent full name and email are required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const validRelationship = Object.values(GuardianRelationship).includes(relationship)
      ? (relationship as GuardianRelationship)
      : GuardianRelationship.GUARDIAN

    const parentRole = await prisma.role.findFirst({ where: { name: 'PARENT' } })
    const initialPassword = password || 'Parent@123'
    const passwordHash = await bcrypt.hash(initialPassword, 10)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create User
      let user = await tx.user.findUnique({ where: { email: cleanEmail } })
      if (!user) {
        user = await tx.user.create({
          data: {
            name,
            email: cleanEmail,
            phone: phone || null,
            password: passwordHash,
            emailVerified: true,
            isActive: true,
          },
        })
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            name: name || user.name,
            phone: phone || user.phone,
          },
        })
      }

      // Ensure PARENT role assigned
      if (parentRole) {
        const existingRole = await tx.userRole.findUnique({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId: parentRole.id,
            },
          },
        })
        if (!existingRole) {
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: parentRole.id,
            },
          })
        }
      }

      // 2. Find or create Guardian record
      let guardian = await tx.guardian.findUnique({
        where: { userId: user.id },
      })

      if (!guardian) {
        guardian = await tx.guardian.create({
          data: {
            userId: user.id,
            relationship: validRelationship,
            occupation: occupation || null,
            officeAddress: officeAddress || null,
          },
        })
      } else {
        guardian = await tx.guardian.update({
          where: { id: guardian.id },
          data: {
            relationship: validRelationship,
            occupation: occupation || guardian.occupation,
            officeAddress: officeAddress || guardian.officeAddress,
          },
        })
      }

      // 3. Link studentIds
      if (Array.isArray(studentIds) && studentIds.length > 0) {
        for (const studentId of studentIds) {
          const existingLink = await tx.studentGuardian.findUnique({
            where: {
              studentId_guardianId: {
                studentId,
                guardianId: guardian.id,
              },
            },
          })
          if (!existingLink) {
            await tx.studentGuardian.create({
              data: {
                studentId,
                guardianId: guardian.id,
                isPrimary: true,
              },
            })
          }
        }
      }

      // Fetch fresh record with relations
      return tx.guardian.findUnique({
        where: { id: guardian.id },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          studentGuardians: {
            include: {
              student: {
                include: {
                  user: { select: { name: true } },
                  currentClass: { select: { name: true } },
                },
              },
            },
          },
        },
      })
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'PARENTS',
      entityType: 'Guardian',
      entityId: result?.id || '',
      newValue: { name, email: cleanEmail, relationship: validRelationship, studentCount: studentIds.length },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: result,
        message: 'Parent registered successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/parents error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
