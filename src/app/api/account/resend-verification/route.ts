import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { createToken, appUrl } from '@/lib/auth/tokens'
import { sendEmailVerificationEmail } from '@/lib/email'
import type { ApiResponse } from '@/types'

// POST /api/account/resend-verification — email a fresh verification link to the signed-in user
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || !user.isActive || user.deletedAt) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Account not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json<ApiResponse>({ success: true, message: 'Your email is already verified' })
    }

    const token = createToken('email-verify', user.id, user.email)
    const verifyUrl = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`

    try {
      await sendEmailVerificationEmail(user.email, user.name, verifyUrl)
    } catch (mailError) {
      console.error('[resend-verification] Failed to send email:', mailError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'We could not send the email right now. Please try again later.' },
        { status: 502 },
      )
    }

    return NextResponse.json<ApiResponse>({ success: true, message: 'Verification email sent' })
  } catch (error) {
    console.error('[resend-verification] Unexpected error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
