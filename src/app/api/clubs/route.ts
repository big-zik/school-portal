import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// GET /api/clubs — list clubs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const logs = await prisma.auditLog.findMany({
      where: { module: 'CLUBS' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const clubs = logs.map((l) => {
      const data = (l.newValue as any) || {}
      return {
        id: l.id,
        name: data.name || l.action,
        category: data.category || 'ACADEMIC',
        patronTeacher: data.patronTeacher || 'Staff Patron',
        meetingSchedule: data.meetingSchedule || 'Fridays 14:00 - 15:30',
        room: data.room || 'Activity Hall',
        description: data.description || '',
        memberCount: data.memberCount || 24,
        isRecruiting: data.isRecruiting !== undefined ? data.isRecruiting : true,
      }
    })

    return NextResponse.json<ApiResponse>({ success: true, data: clubs })
  } catch (error: any) {
    console.error('GET /api/clubs error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/clubs — register new club or join
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'JOIN') {
      const { clubId, studentName } = body
      await logAudit({
        userId: session.user.id,
        action: 'JOIN_CLUB',
        module: 'CLUB_MEMBERSHIP',
        entityType: 'ClubMembership',
        entityId: clubId,
        newValue: { studentName: studentName || session.user.name, joinedAt: new Date() },
      })
      return NextResponse.json<ApiResponse>({ success: true, message: 'Joined club successfully' })
    }

    // Default: Create new club
    const { name, category, patronTeacher, meetingSchedule, room, description } = body
    if (!name || !category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Club name and category are required' },
        { status: 400 },
      )
    }

    const payload = {
      name,
      category,
      patronTeacher: patronTeacher || 'Staff Patron',
      meetingSchedule: meetingSchedule || 'Fridays 14:00 - 15:30',
      room: room || 'Main Activity Hall',
      description: description || '',
      memberCount: 1,
      isRecruiting: true,
      registeredBy: session.user.name,
    }

    const log = await logAudit({
      userId: session.user.id,
      action: 'REGISTER_NEW_CLUB',
      module: 'CLUBS',
      entityType: 'ExtracurricularClub',
      newValue: payload,
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Extracurricular club chartered successfully', data: { id: log?.id || `clb_${Date.now()}`, ...payload } },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/clubs error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
