import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { AllocationStatus, HostelType, RoomType } from '@prisma/client'
import type { ApiResponse } from '@/types'

const INITIAL_HOSTELS = [
  {
    name: 'Nelson Mandela Hall (Boys Senior)',
    type: HostelType.MALE,
    capacity: 120,
    termFee: 150000,
  },
  {
    name: 'Queen Amina Hall (Girls Senior)',
    type: HostelType.FEMALE,
    capacity: 120,
    termFee: 150000,
  },
  {
    name: 'Junior Scholars Residence',
    type: HostelType.MIXED,
    capacity: 80,
    termFee: 135000,
  },
]

// GET /api/hostel — list all hostels with room allocations
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let hostels = await prisma.hostel.findMany({
      include: {
        warden: {
          select: {
            user: { select: { name: true, phone: true } },
          },
        },
        rooms: {
          include: {
            hostelAllocations: {
              where: { status: AllocationStatus.ACTIVE },
              include: {
                student: {
                  select: {
                    id: true,
                    admissionNumber: true,
                    user: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // If no hostels exist in database, seed initial hostels
    if (hostels.length === 0) {
      const school = await prisma.school.findFirst()
      if (school) {
        for (const h of INITIAL_HOSTELS) {
          const createdHostel = await prisma.hostel.create({
            data: {
              schoolId: school.id,
              name: h.name,
              type: h.type,
              capacity: h.capacity,
            },
          })

          // Seed 4 sample rooms per hostel
          for (let r = 1; r <= 4; r++) {
            await prisma.room.create({
              data: {
                hostelId: createdHostel.id,
                roomNumber: `Room 10${r}`,
                capacity: 4,
                type: RoomType.DORMITORY,
                floor: '1',
              },
            })
          }
        }

        hostels = await prisma.hostel.findMany({
          include: {
            warden: {
              select: {
                user: { select: { name: true, phone: true } },
              },
            },
            rooms: {
              include: {
                hostelAllocations: {
                  where: { status: AllocationStatus.ACTIVE },
                  include: {
                    student: {
                      select: {
                        id: true,
                        admissionNumber: true,
                        user: { select: { name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { name: 'asc' },
        })
      }
    }

    // Format data with computed totals
    const formatted = hostels.map((h) => {
      const totalRoomCapacity = h.rooms.reduce((acc, r) => acc + r.capacity, 0)
      const effectiveCapacity = totalRoomCapacity > 0 ? totalRoomCapacity : h.capacity
      const occupied = h.rooms.reduce((acc, r) => acc + r.hostelAllocations.length, 0)

      return {
        id: h.id,
        name: h.name,
        type: h.type,
        warden: h.warden?.user?.name || 'Staff Warden',
        wardenPhone: h.warden?.user?.phone || '+234 802 000 0000',
        capacity: effectiveCapacity,
        occupied,
        availableBeds: Math.max(0, effectiveCapacity - occupied),
        roomsCount: h.rooms.length > 0 ? h.rooms.length : 30,
        termFee: 150000,
        rooms: h.rooms.map((r) => ({
          id: r.id,
          roomNumber: r.roomNumber,
          capacity: r.capacity,
          occupied: r.hostelAllocations.length,
          allocations: r.hostelAllocations,
        })),
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formatted,
    })
  } catch (error: any) {
    console.error('GET /api/hostel error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/hostel — create hostel OR allocate room
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = ((session.user as any).roles || []) as string[]
    const allowed = ['SUPER_ADMIN', 'ADMIN', 'HOSTEL_STAFF']
    if (!allowed.some((role) => userRoles.includes(role))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { action, studentId, roomId, name, type, capacity, termFee } = body

    // Action 1: Allocate student to room
    if (action === 'allocate' || (studentId && roomId)) {
      if (!studentId || !roomId) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'studentId and roomId are required for allocation' },
          { status: 400 }
        )
      }

      let student = await prisma.student.findUnique({ where: { id: studentId } })
      if (!student) {
        student = await prisma.student.findUnique({ where: { admissionNumber: studentId } })
      }
      if (!student) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Student not found' }, { status: 404 })
      }

      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { hostelAllocations: { where: { status: AllocationStatus.ACTIVE } } },
      })
      if (!room) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Room not found' }, { status: 404 })
      }

      if (room.hostelAllocations.length >= room.capacity) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'This room is currently at full capacity' },
          { status: 400 }
        )
      }

      // Resolve academic year and term
      const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } }) || await prisma.academicYear.findFirst()
      const term = await prisma.term.findFirst({ where: { isCurrent: true } }) || await prisma.term.findFirst()

      if (!year || !term) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Active term and year not configured' }, { status: 400 })
      }

      const allocation = await prisma.hostelAllocation.create({
        data: {
          studentId: student.id,
          roomId: room.id,
          termId: term.id,
          academicYearId: year.id,
          status: AllocationStatus.ACTIVE,
          fee: termFee ? Number(termFee) : 150000,
        },
        include: {
          room: { include: { hostel: true } },
          student: { select: { id: true, admissionNumber: true, user: { select: { name: true } } } },
        },
      })

      return NextResponse.json<ApiResponse>(
        { success: true, data: allocation, message: 'Student room allocation completed successfully' },
        { status: 201 }
      )
    }

    // Action 2: Create new hostel
    if (!name) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Hostel name is required' }, { status: 400 })
    }

    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'School not found' }, { status: 404 })
    }

    const newHostel = await prisma.hostel.create({
      data: {
        schoolId: school.id,
        name: name.trim(),
        type: (type as HostelType) || HostelType.MIXED,
        capacity: Number(capacity) || 50,
      },
    })

    // Create initial rooms
    for (let i = 1; i <= 5; i++) {
      await prisma.room.create({
        data: {
          hostelId: newHostel.id,
          roomNumber: `Room 10${i}`,
          capacity: 4,
          type: RoomType.DORMITORY,
          floor: '1',
        },
      })
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: newHostel, message: 'Hostel created successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/hostel error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
