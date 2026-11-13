import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { LoanStatus } from '@prisma/client'
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
    const statusParam = searchParams.get('status') as LoanStatus | null

    const where: any = {}
    if (statusParam && Object.values(LoanStatus).includes(statusParam)) {
      where.status = statusParam
    }

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
            user: { select: { name: true, email: true } },
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

// POST /api/library/loans — issue a new book loan OR return an existing loan
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = ((session.user as any).roles || []) as string[]
    const allowed = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN', 'TEACHER']
    if (!allowed.some((role) => userRoles.includes(role))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { action, loanId, bookId, studentId, dueDate } = body

    // Handle return action via POST
    if (action === 'return' || (loanId && !bookId)) {
      if (!loanId) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'loanId is required to return a book' }, { status: 400 })
      }

      const existingLoan = await prisma.bookLoan.findUnique({
        where: { id: loanId },
        include: { book: true },
      })

      if (!existingLoan) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Loan record not found' }, { status: 404 })
      }

      if (existingLoan.status === LoanStatus.RETURNED) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'This book has already been returned' }, { status: 400 })
      }

      const updated = await prisma.$transaction(async (tx) => {
        const returned = await tx.bookLoan.update({
          where: { id: loanId },
          data: {
            status: LoanStatus.RETURNED,
            returnedAt: new Date(),
          },
          include: {
            book: true,
            student: { select: { id: true, admissionNumber: true, user: { select: { name: true } } } },
          },
        })

        await tx.book.update({
          where: { id: existingLoan.bookId },
          data: {
            availableCopies: {
              increment: 1,
            },
          },
        })

        return returned
      })

      return NextResponse.json<ApiResponse>({
        success: true,
        data: updated,
        message: 'Book successfully returned and inventory restored',
      })
    }

    // Default action: Issue a new loan
    if (!bookId || !studentId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'bookId and studentId are required to issue a loan' },
        { status: 400 }
      )
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Book not found' }, { status: 404 })
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No copies of this book are currently available for loan' },
        { status: 400 }
      )
    }

    let student = await prisma.student.findUnique({
      where: { id: studentId },
    })
    if (!student) {
      student = await prisma.student.findUnique({
        where: { admissionNumber: studentId },
      })
    }
    if (!student) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Student not found' }, { status: 404 })
    }

    const parsedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.bookLoan.create({
        data: {
          bookId: book.id,
          studentId: student.id,
          issuedById: session.user.id,
          issuedAt: new Date(),
          dueDate: parsedDueDate,
          status: LoanStatus.ACTIVE,
        },
        include: {
          book: true,
          student: { select: { id: true, admissionNumber: true, user: { select: { name: true } } } },
        },
      })

      await tx.book.update({
        where: { id: book.id },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      })

      return loan
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: result,
        message: 'Book loan issued successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/library/loans error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// PATCH /api/library/loans — return an existing loan
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = ((session.user as any).roles || []) as string[]
    const allowed = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN', 'TEACHER']
    if (!allowed.some((role) => userRoles.includes(role))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { loanId } = body

    if (!loanId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'loanId is required' }, { status: 400 })
    }

    const existingLoan = await prisma.bookLoan.findUnique({
      where: { id: loanId },
      include: { book: true },
    })

    if (!existingLoan) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Loan record not found' }, { status: 404 })
    }

    if (existingLoan.status === LoanStatus.RETURNED) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'This book has already been returned' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const returned = await tx.bookLoan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.RETURNED,
          returnedAt: new Date(),
        },
        include: {
          book: true,
          student: { select: { id: true, admissionNumber: true, user: { select: { name: true } } } },
        },
      })

      await tx.book.update({
        where: { id: existingLoan.bookId },
        data: {
          availableCopies: {
            increment: 1,
          },
        },
      })

      return returned
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updated,
      message: 'Book returned successfully and inventory updated',
    })
  } catch (error: any) {
    console.error('PATCH /api/library/loans error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
