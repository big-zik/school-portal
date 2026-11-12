import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { EventType } from '@prisma/client'
import type { ApiResponse } from '@/types'

// GET /api/events — query events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') as EventType | undefined
    const isPublished = searchParams.get('isPublished')

    const where: any = {}
    if (type) where.type = type
    if (isPublished !== null && isPublished !== undefined && isPublished !== '') {
      where.isPublished = isPublished === 'true'
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      take: 100,
    })

    return NextResponse.json<ApiResponse>({ success: true, data: events })
  } catch (error: any) {
    console.error('GET /api/events error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/events — create event
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, startDate, endDate, location, type, targetRoles, isPublished } = body

    if (!title || !startDate || !endDate || !type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'title, startDate, endDate, and type are required' },
        { status: 400 },
      )
    }

    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'School not found' }, { status: 404 })
    }

    const event = await prisma.event.create({
      data: {
        schoolId: school.id,
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || null,
        type: type as EventType,
        targetRoles: targetRoles || ['PARENT', 'STUDENT', 'TEACHER'],
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'COMMUNICATION',
      entityType: 'Event',
      entityId: event.id,
      newValue: { title, type, startDate },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: event }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/events error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
