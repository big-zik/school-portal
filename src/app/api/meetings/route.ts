import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { EventType, RoleName } from '@prisma/client'
import type { ApiResponse } from '@/types'

const DEFAULT_MEETINGS = [
  {
    id: 'm-default-1',
    title: 'Term 2 Academic & STEM Progress Consultation',
    teacherName: 'Dr. Robert Smith (Mathematics)',
    childName: 'Daniel Johnson',
    date: 'Feb 22, 2025',
    time: '02:30 PM - 03:00 PM',
    mode: 'VIRTUAL',
    locationOrLink: 'https://meet.google.com/cgs-academic-progress',
    status: 'CONFIRMED',
  },
  {
    id: 'm-default-2',
    title: 'Parent-Teacher Association (PTA) General Assembly',
    teacherName: 'Executive PTA Council',
    childName: 'All Children',
    date: 'Mar 01, 2025',
    time: '10:00 AM - 12:30 PM',
    mode: 'IN_PERSON',
    locationOrLink: 'CHOSEN GENERATION SCHOOL Main Auditorium',
    status: 'CONFIRMED',
  },
]

// GET /api/meetings — retrieve parent consultation meetings and conferences
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: {
        type: EventType.MEETING,
      },
      orderBy: { startDate: 'desc' },
      take: 50,
    })

    if (events.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: DEFAULT_MEETINGS,
      })
    }

    const formatted = events.map((ev) => {
      // Parse metadata from description if formatted as key-value
      const desc = ev.description || ''
      const childMatch = desc.match(/Child:\s*([^|]+)/)
      const teacherMatch = desc.match(/Teacher:\s*([^|]+)/)
      const modeMatch = desc.match(/Mode:\s*([^|]+)/)

      return {
        id: ev.id,
        title: ev.title,
        teacherName: teacherMatch ? teacherMatch[1].trim() : 'Class Faculty',
        childName: childMatch ? childMatch[1].trim() : 'Daniel Johnson',
        date: ev.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: `${ev.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${ev.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        mode: modeMatch && modeMatch[1].trim() === 'IN_PERSON' ? 'IN_PERSON' : 'VIRTUAL',
        locationOrLink: ev.location || 'Google Meet Link',
        status: 'CONFIRMED',
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formatted,
    })
  } catch (error: any) {
    console.error('GET /api/meetings error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/meetings — schedule a new parent-teacher meeting
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, teacherName, childName, date, time, mode, locationOrLink } = body

    if (!title) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Meeting title is required' }, { status: 400 })
    }

    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'School not configured' }, { status: 400 })
    }

    // Determine start and end date
    const parsedDate = date ? new Date(date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const endDate = new Date(parsedDate.getTime() + 45 * 60 * 1000) // 45 minutes

    const event = await prisma.event.create({
      data: {
        schoolId: school.id,
        title: title.trim(),
        description: `Child: ${childName || 'Student'} | Teacher: ${teacherName || 'Faculty'} | Mode: ${mode || 'VIRTUAL'} | Time: ${time || 'TBD'}`,
        startDate: parsedDate,
        endDate,
        location: locationOrLink || (mode === 'IN_PERSON' ? 'Campus Conference Room' : 'Google Meet Link'),
        type: EventType.MEETING,
        isPublished: true,
        targetRoles: ['PARENT', 'TEACHER', 'ADMIN'],
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: event,
        message: 'Teacher consultation request booked and saved to calendar',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/meetings error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
