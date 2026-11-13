import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { changePasswordSchema } from '@/lib/validators'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// POST /api/account/change-password — signed-in user changes their own password
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    const errors: Record<string, string[]> = {}
    parsed.error.errors.forEach((e) => {
      const key = e.path.join('.')
      errors[key] = [...(errors[key] ?? []), e.message]
    })
    return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || !user.isActive || user.deletedAt) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Account not found' }, { status: 404 })
    }

    const currentOk = await bcrypt.compare(parsed.data.currentPassword, user.password)
    if (!currentOk) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Current password is incorrect', errors: { currentPassword: ['Current password is incorrect'] } },
        { status: 400 },
      )
    }

    const hashed = await bcrypt.hash(parsed.data.password, 12)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_CHANGED',
      module: 'Auth',
      entityType: 'User',
      entityId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json<ApiResponse>({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('[change-password] Unexpected error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
