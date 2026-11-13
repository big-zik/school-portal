import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'

// GET /api/subjects — list all subjects
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const classId = searchParams.get('classId')

    const where: any = {}
    if (classId) {
      where.classSubjects = {
        some: { classId },
      }
    }

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: subjects,
    })
  } catch (error: any) {
    console.error('GET /api/subjects error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/subjects — create a subject
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, description, creditHours, isElective } = body

    if (!name || !code) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Name and code are required' }, { status: 400 })
    }

    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'School not found' }, { status: 404 })
    }

    const subject = await prisma.subject.create({
      data: {
        schoolId: school.id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
        creditHours: creditHours ? Number(creditHours) : null,
        isElective: Boolean(isElective),
      },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: subject }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/subjects error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
