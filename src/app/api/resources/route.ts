import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { EResourceType } from '@prisma/client'
import type { ApiResponse } from '@/types'

// GET /api/resources — list digital learning resources
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const classId = searchParams.get('classId') || undefined
    const subjectId = searchParams.get('subjectId') || undefined
    const type = searchParams.get('type') as EResourceType | undefined
    const search = searchParams.get('search') || undefined

    const where: any = {}
    if (classId) where.classId = classId
    if (subjectId) where.subjectId = subjectId
    if (type) where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const resources = await prisma.eResource.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json<ApiResponse>({ success: true, data: resources })
  } catch (error: any) {
    console.error('GET /api/resources error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/resources — upload/publish e-resource
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, type, url, file, subjectId, classId } = body

    if (!title || !type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Title and type are required' },
        { status: 400 },
      )
    }

    // Resolve school
    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'School not found' }, { status: 404 })
    }

    const resource = await prisma.eResource.create({
      data: {
        schoolId: school.id,
        title,
        description: description || null,
        type: type as EResourceType,
        url: url || null,
        file: file || null,
        subjectId: subjectId || null,
        classId: classId || null,
        uploadedById: session.user.id,
      },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'ACADEMICS',
      entityType: 'EResource',
      entityId: resource.id,
      newValue: { title, type },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: resource }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/resources error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/resources — delete e-resource
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Resource id is required' }, { status: 400 })
    }

    await prisma.eResource.delete({
      where: { id },
    })

    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      module: 'ACADEMICS',
      entityType: 'EResource',
      entityId: id,
    })

    return NextResponse.json<ApiResponse>({ success: true, message: 'Resource deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/resources error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
