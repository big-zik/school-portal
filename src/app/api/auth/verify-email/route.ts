import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { readToken, matchesFingerprint } from '@/lib/auth/tokens'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

const INVALID_LINK = 'This verification link is invalid or has expired. Please request a new one.'

// POST /api/auth/verify-email — confirm ownership of an email address
export async function POST(request: NextRequest) {
  let body: { token?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const token = readToken(body.token, 'email-verify')
    if (!token) {
      return NextResponse.json<ApiResponse>({ success: false, error: INVALID_LINK }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: token.userId } })

    // Bound to the email address it was issued for, so changing the address
    // invalidates any outstanding link.
    if (!user || user.deletedAt || !matchesFingerprint(token, user.email)) {
      return NextResponse.json<ApiResponse>({ success: false, error: INVALID_LINK }, { status: 400 })
    }

    if (user.emailVerified) {
      return NextResponse.json<ApiResponse>({ success: true, message: 'Email already verified' })
    }

    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })

    await logAudit({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      module: 'Auth',
      entityType: 'User',
      entityId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json<ApiResponse>({ success: true, message: 'Email verified successfully' })
  } catch (error) {
    console.error('[verify-email] Unexpected error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
