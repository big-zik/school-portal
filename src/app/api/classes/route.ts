import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const schoolId = searchParams.get('schoolId')

    const where: any = {}
    if (schoolId) {
      where.schoolId = schoolId
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        sections: true,
        classSubjects: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { level: 'asc' },
    })

    return NextResponse.json({ success: true, data: classes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = session.user.roles || []
    if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, level, capacity, description, schoolId } = body

    if (!name) {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 })
    }

    let targetSchoolId = schoolId
    if (!targetSchoolId) {
      const firstSchool = await prisma.school.findFirst({ select: { id: true } })
      targetSchoolId = firstSchool?.id
    }

    if (!targetSchoolId) {
      return NextResponse.json({ error: 'School not configured' }, { status: 400 })
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        level: level ? parseInt(level, 10) : null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        description,
        schoolId: targetSchoolId,
      },
      include: {
        sections: true,
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'ACADEMICS',
      entityType: 'Class',
      entityId: newClass.id,
      newValue: { name, level, capacity },
    })

    return NextResponse.json({ success: true, data: newClass }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
