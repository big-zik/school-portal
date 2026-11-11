import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'

// GET /api/notifications — retrieves notifications for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        items: notifications,
        unreadCount,
      },
    })
  } catch (error: any) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// PATCH /api/notifications — mark one or all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'All notifications marked as read',
      })
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId: session.user.id },
        data: { isRead: true, readAt: new Date() },
      })
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Notification marked as read',
      })
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Provide either notificationId or markAllAsRead: true' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('PATCH /api/notifications error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
