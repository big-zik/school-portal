import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { resetPasswordSchema } from '@/lib/validators'
import { readToken, matchesFingerprint } from '@/lib/auth/tokens'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

const INVALID_LINK = 'This reset link is invalid or has expired. Please request a new one.'

// POST /api/auth/reset-password — set a new password using an emailed token
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    const errors: Record<string, string[]> = {}
    parsed.error.errors.forEach((e) => {
      const key = e.path.join('.')
      errors[key] = [...(errors[key] ?? []), e.message]
    })
    return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
  }

  try {
    const token = readToken(parsed.data.token, 'password-reset')
    if (!token) {
      return NextResponse.json<ApiResponse>({ success: false, error: INVALID_LINK }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: token.userId } })

    // The token is bound to the password hash it was issued against, so a link
    // that has already been used (or a password changed since) no longer works.
    if (
      !user ||
      !user.isActive ||
      user.isSuspended ||
      user.deletedAt ||
      !matchesFingerprint(token, user.password)
    ) {
      return NextResponse.json<ApiResponse>({ success: false, error: INVALID_LINK }, { status: 400 })
    }

    const hashed = await bcrypt.hash(parsed.data.password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        // A successful reset also clears any failed-login lockout.
        loginAttempts: 0,
        lockedUntil: null,
      },
    })

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      module: 'Auth',
      entityType: 'User',
      entityId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json<ApiResponse>({ success: true, message: 'Password updated. You can now sign in.' })
  } catch (error) {
    console.error('[reset-password] Unexpected error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
