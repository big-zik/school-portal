import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'

// GET /api/messages — returns user's inbox or sent messages
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const folder = searchParams.get('folder') || 'inbox'
    const userId = session.user.id

    const where = folder === 'sent'
      ? { senderId: userId, deletedAt: null }
      : { recipientId: userId, deletedAt: null }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
        recipient: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: messages,
    })
  } catch (error: any) {
    console.error('GET /api/messages error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/messages — sends a new message
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, subject, content, parentMessageId } = body

    if (!recipientId || !subject || !content) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'recipientId, subject, and content are required' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        recipientId,
        subject,
        content,
        parentMessageId: parentMessageId || null,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: message,
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/messages error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
