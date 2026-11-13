import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { forgotPasswordSchema } from '@/lib/validators'
import { createToken, appUrl, TOKEN_TTL_SECONDS } from '@/lib/auth/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// Identical response whether or not the account exists, so this endpoint
// cannot be used to discover which emails are registered.
const GENERIC_OK = {
  success: true,
  message: 'If an active account exists for that email, a reset link has been sent.',
}

// POST /api/auth/forgot-password — email a password reset link
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Please enter a valid email address' },
      { status: 422 },
    )
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })

    if (user && user.isActive && !user.isSuspended && !user.deletedAt) {
      // Bound to the current password hash: the link dies as soon as the
      // password changes, so it can only be used once.
      const token = createToken('password-reset', user.id, user.password)
      const resetUrl = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`
      const minutes = `${TOKEN_TTL_SECONDS['password-reset'] / 60} minutes`

      try {
        await sendPasswordResetEmail(user.email, user.name, resetUrl, minutes)
      } catch (mailError) {
        // Never reveal delivery problems to the caller; they would also reveal
        // that the account exists.
        console.error('[forgot-password] Failed to send reset email:', mailError)
        if (process.env.NODE_ENV !== 'production') {
          console.info(`[forgot-password] (dev) reset link for ${user.email}: ${resetUrl}`)
        }
      }

      await logAudit({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        module: 'Auth',
        entityType: 'User',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
      })
    }

    return NextResponse.json<ApiResponse>(GENERIC_OK)
  } catch (error) {
    console.error('[forgot-password] Unexpected error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
