import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'

// GET /api/library/loans — get active loans
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (studentId) {
      where.studentId = studentId
    } else {
      // If student calling, restrict to student's own loans
      const callerRoles = ((session.user as any).roles || []) as string[]
      if (callerRoles.includes('STUDENT')) {
        const student = await prisma.student.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        })
        if (student) {
          where.studentId = student.id
        }
      }
    }

    const loans = await prisma.bookLoan.findMany({
      where,
      include: {
        book: { select: { id: true, title: true, author: true, isbn: true } },
        student: {
          select: {
            id: true,
            admissionNumber: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 50,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: loans,
    })
  } catch (error: any) {
    console.error('GET /api/library/loans error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
