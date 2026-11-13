import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'

// GET /api/settings — get institution settings
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let school = await prisma.school.findFirst()
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'CHOSEN GENERATION SCHOOL',
          email: 'info@chosengenerationschool.edu',
          phone: '+234 1 234 5678',
          address: '42 Academic Way, Victoria Island, Lagos',
          timezone: 'Africa/Lagos',
          currency: 'NGN',
          country: 'Nigeria',
        },
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: school,
    })
  } catch (error: any) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// PATCH /api/settings — update institution settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = ((session.user as any).roles || []) as string[]
    const allowed = ['SUPER_ADMIN', 'ADMIN']
    if (!allowed.some((role) => userRoles.includes(role))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, address, timezone, currency, website, primaryColor, secondaryColor } = body

    let school = await prisma.school.findFirst()
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: name || 'CHOSEN GENERATION SCHOOL',
          email,
          phone,
          address,
          timezone: timezone || 'Africa/Lagos',
          currency: currency || 'NGN',
          website,
          primaryColor,
          secondaryColor,
        },
      })
    } else {
      school = await prisma.school.update({
        where: { id: school.id },
        data: {
          ...(name && { name: name.trim() }),
          ...(email !== undefined && { email: email ? email.trim() : null }),
          ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
          ...(address !== undefined && { address: address ? address.trim() : null }),
          ...(timezone !== undefined && { timezone: timezone ? timezone.trim() : 'Africa/Lagos' }),
          ...(currency !== undefined && { currency: currency ? currency.trim() : 'NGN' }),
          ...(website !== undefined && { website: website ? website.trim() : null }),
          ...(primaryColor !== undefined && { primaryColor }),
          ...(secondaryColor !== undefined && { secondaryColor }),
        },
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: school,
      message: 'Institution settings saved successfully',
    })
  } catch (error: any) {
    console.error('PATCH /api/settings error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
