import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { z } from 'zod'
import { InvoiceStatus } from '@prisma/client'
import type { ApiResponse, PaginationMeta } from '@/types'

const createInvoiceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date' }),
  termId: z.string().optional(),
  academicYearId: z.string().optional(),
  discountAmount: z.number().min(0).default(0),
  items: z
    .array(
      z.object({
        feeCategoryId: z.string().min(1, 'Fee category is required'),
        description: z.string().min(1, 'Description is required'),
        amount: z.number().min(0.01, 'Amount must be greater than 0'),
      }),
    )
    .min(1, 'At least one item is required'),
})

// GET /api/fees — paginated list of invoices with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const status = searchParams.get('status') as InvoiceStatus | null
    const studentId = searchParams.get('studentId') ?? undefined
    const classId = searchParams.get('classId') ?? undefined
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status && Object.values(InvoiceStatus).includes(status)) {
      where.status = status
    }
    if (studentId) {
      where.studentId = studentId
    }
    if (classId) {
      where.student = { currentClassId: classId }
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where: where as any }),
      prisma.invoice.findMany({
        where: where as any,
        include: {
          student: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              currentClass: { select: { id: true, name: true, level: true } },
            },
          },
          invoiceItems: {
            include: {
              feeCategory: { select: { id: true, name: true } },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              paymentDate: true,
              referenceNumber: true,
              status: true,
            },
          },
          term: { select: { id: true, name: true } },
          academicYear: { select: { id: true, name: true } },
        },
        orderBy: { generatedAt: 'desc' },
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
      data: invoices,
      pagination,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/fees — create a new Invoice with InvoiceItems
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    if (!callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'].includes(r))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      parsed.error.errors.forEach((e) => {
        const key = e.path.join('.')
        errors[key] = [...(errors[key] ?? []), e.message]
      })
      return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
    }

    const data = parsed.data

    // Find student
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: { school: true },
    })
    if (!student || student.deletedAt) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Student not found' }, { status: 404 })
    }

    // Resolve term and academic year
    let termId = data.termId
    let academicYearId = data.academicYearId

    if (!termId || !academicYearId) {
      const now = new Date()
      let activeTerm = await prisma.term.findFirst({
        where: { isCurrent: true },
        include: { academicYear: true },
      })
      if (!activeTerm) {
        activeTerm = await prisma.term.findFirst({
          where: { startDate: { lte: now }, endDate: { gte: now } },
          include: { academicYear: true },
        })
      }
      if (!activeTerm) {
        activeTerm = await prisma.term.findFirst({
          orderBy: { createdAt: 'desc' },
          include: { academicYear: true },
        })
      }
      if (!activeTerm) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'No active term found' }, { status: 500 })
      }
      termId = termId || activeTerm.id
      academicYearId = academicYearId || activeTerm.academicYearId
    }

    // Calculate totals
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0)
    const discountAmount = data.discountAmount ?? 0
    const balanceAmount = Math.max(0, totalAmount - discountAmount)
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

    const invoice = await prisma.$transaction(async (tx) => {
      // Validate or create feeCategories if necessary
      const preparedItems = []
      for (const item of data.items) {
        let category = await tx.feeCategory.findUnique({ where: { id: item.feeCategoryId } })
        if (!category) {
          category = await tx.feeCategory.findFirst({ where: { schoolId: student.schoolId } })
          if (!category) {
            category = await tx.feeCategory.create({
              data: {
                name: 'Tuition Fee',
                schoolId: student.schoolId,
              },
            })
          }
        }
        preparedItems.push({
          feeCategoryId: category.id,
          description: item.description,
          amount: item.amount,
        })
      }

      const created = await tx.invoice.create({
        data: {
          studentId: data.studentId,
          termId: termId!,
          academicYearId: academicYearId!,
          invoiceNumber,
          totalAmount,
          discountAmount,
          paidAmount: 0,
          balanceAmount,
          status: balanceAmount === 0 ? 'PAID' : 'PENDING',
          dueDate: new Date(data.dueDate),
          invoiceItems: {
            create: preparedItems,
          },
        },
        include: {
          invoiceItems: true,
          student: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      })

      return created
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'Fees',
      entityType: 'Invoice',
      entityId: invoice.id,
      newValue: { invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount, studentId: invoice.studentId },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: invoice }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
