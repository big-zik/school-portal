import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { z } from 'zod'
import { TicketStatus, TicketPriority } from '@prisma/client'
import type { ApiResponse } from '@/types'

const ticketCreateSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Please describe your inquiry or issue in detail'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.string().optional(),
  childName: z.string().optional(),
})

// GET /api/support/tickets — list caller's tickets or all tickets for admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    const isAdmin = callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))

    const where: any = {}
    if (!isAdmin) {
      where.userId = session.user.id
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: tickets,
    })
  } catch (error: any) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/support/tickets — parent submits an issue or inquiry to school
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = ticketCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Validation failed', errors: { message: [parsed.error.message] } },
        { status: 422 },
      )
    }

    const data = parsed.data

    const formattedDescription = `[Category: ${data.category || 'General'}] [Child: ${data.childName || 'N/A'}]\n\n${data.description}`

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: data.subject,
        description: formattedDescription,
        priority: data.priority as TicketPriority,
        status: TicketStatus.OPEN,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_SUPPORT_TICKET',
      module: 'Support',
      entityType: 'SupportTicket',
      entityId: ticket.id,
      newValue: { subject: data.subject, priority: data.priority },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Your inquiry has been submitted to the school administration',
        data: ticket,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
