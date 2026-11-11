import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { announcementSchema } from '@/lib/validators'
import type { ApiResponse, PaginationMeta } from '@/types'

// GET /api/announcements — list announcements visible to the caller's role, paginated
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit

    const callerRoles: string[] = (session.user as any).roles ?? []
    const isAdmin = callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))

    const now = new Date()

    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (!isAdmin) {
      where.isPublished = true
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ]
    }

    // Fetch announcements
    const allMatching = await prisma.announcement.findMany({
      where: where as any,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Filter by targetRoles if not admin
    const visible = isAdmin
      ? allMatching
      : allMatching.filter((ann) => {
          const targets = ann.targetRoles as string[] | null
          if (!targets || !Array.isArray(targets) || targets.length === 0) {
            return true
          }
          return targets.some((targetRole) => callerRoles.includes(targetRole))
        })

    const total = visible.length
    const totalPages = Math.ceil(total / limit)
    const paginated = visible.slice(skip, skip + limit)

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
      data: paginated,
      pagination,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/announcements — create an announcement (Admin/Teacher only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    if (!callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(r))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: only teachers or admins can create announcements' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = announcementSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      parsed.error.errors.forEach((e) => {
        const key = e.path.join('.')
        errors[key] = [...(errors[key] ?? []), e.message]
      })
      return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
    }

    const data = parsed.data
    const now = new Date()

    const announcement = await prisma.announcement.create({
      data: {
        authorId: session.user.id,
        title: data.title,
        content: data.content,
        targetRoles: data.targetRoles ?? [],
        isPinned: data.isPinned ?? false,
        isPublished: data.isPublished ?? true,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : (data.isPublished ? now : null),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        attachments: data.attachmentUrls ?? [],
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'Announcements',
      entityType: 'Announcement',
      entityId: announcement.id,
      newValue: { title: announcement.title, isPublished: announcement.isPublished },
    })

    return NextResponse.json<ApiResponse>({ success: true, data: announcement }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
