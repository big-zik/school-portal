import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { TransportType } from '@prisma/client'
import type { ApiResponse } from '@/types'

const INITIAL_ROUTES = [
  {
    name: 'Lekki - Ajah Express Route',
    startPoint: 'Ajah Roundabout',
    endPoint: 'School Campus Victoria Island',
    vehiclePlate: 'LND-482-XA',
    vehicleModel: 'Toyota Coaster',
    driverName: 'Mr. Paul Babatunde',
    driverPhone: '+234 802 333 4441',
    capacity: 32,
    fee: 65000,
    stops: ['VGC Roundabout', 'Chevron Gate', 'Jakande', 'Admiralty Circle', 'Campus'],
  },
  {
    name: 'Ikoyi - Victoria Island Shuttle',
    startPoint: 'Awolowo Rd Ikoyi',
    endPoint: 'School Campus Victoria Island',
    vehiclePlate: 'KJA-192-BC',
    vehicleModel: 'Toyota HiAce',
    driverName: 'Mr. Emmanuel Okon',
    driverPhone: '+234 802 333 4442',
    capacity: 18,
    fee: 55000,
    stops: ['Bourdillon Rd', 'Awolowo Way', 'Ahmadu Bello', 'Campus'],
  },
  {
    name: 'Surulere - Mainland Line',
    startPoint: 'Stadium Hotel Surulere',
    endPoint: 'School Campus Victoria Island',
    vehiclePlate: 'APP-552-DE',
    vehicleModel: 'Toyota Coaster',
    driverName: 'Mr. Sunday Alabi',
    driverPhone: '+234 802 333 4443',
    capacity: 32,
    fee: 75000,
    stops: ['Stadium Hotel', 'Ojuelegba', 'Costain', 'Third Mainland', 'Campus'],
  },
]

// GET /api/transport — list bus routes with vehicles, stops, and allocations
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let routes = await prisma.transportRoute.findMany({
      include: {
        vehicles: true,
        routeStops: { orderBy: { order: 'asc' } },
        studentTransports: {
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
      orderBy: { name: 'asc' },
    })

    // If no routes exist in database, seed initial routes
    if (routes.length === 0) {
      const school = await prisma.school.findFirst()
      if (school) {
        for (const r of INITIAL_ROUTES) {
          const createdRoute = await prisma.transportRoute.create({
            data: {
              schoolId: school.id,
              name: r.name,
              startPoint: r.startPoint,
              endPoint: r.endPoint,
              fee: r.fee,
            },
          })

          // Find or create vehicle
          let vehicle = await prisma.vehicle.findUnique({
            where: { plateNumber: r.vehiclePlate },
          })
          if (!vehicle) {
            await prisma.vehicle.create({
              data: {
                schoolId: school.id,
                routeId: createdRoute.id,
                plateNumber: r.vehiclePlate,
                type: r.vehicleModel,
                capacity: r.capacity,
                driverName: r.driverName,
                driverPhone: r.driverPhone,
              },
            })
          }

          // Create stops
          for (let idx = 0; idx < r.stops.length; idx++) {
            await prisma.routeStop.create({
              data: {
                routeId: createdRoute.id,
                name: r.stops[idx],
                order: idx + 1,
              },
            })
          }
        }

        routes = await prisma.transportRoute.findMany({
          include: {
            vehicles: true,
            routeStops: { orderBy: { order: 'asc' } },
            studentTransports: {
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
          orderBy: { name: 'asc' },
        })
      }
    }

    const formatted = routes.map((rt) => {
      const v = rt.vehicles[0]
      const capacity = v?.capacity || 30
      const assignedCount = rt.studentTransports.length

      return {
        id: rt.id,
        name: rt.name,
        vehicle: v ? `${v.type} (${v.plateNumber})` : 'School Bus Shuttle',
        driver: v?.driverName || 'Designated Driver',
        phone: v?.driverPhone || '+234 800 000 0000',
        capacity: `${assignedCount} / ${capacity} Seats${assignedCount >= capacity ? ' (Full)' : ''}`,
        assignedCount,
        maxCapacity: capacity,
        termFee: rt.fee || 65000,
        stops: rt.routeStops.map((s) => s.name),
        students: rt.studentTransports,
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formatted,
    })
  } catch (error: any) {
    console.error('GET /api/transport error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/transport — create route OR assign student to transport
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = ((session.user as any).roles || []) as string[]
    const allowed = ['SUPER_ADMIN', 'ADMIN', 'TRANSPORT_STAFF']
    if (!allowed.some((role) => userRoles.includes(role))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { action, studentId, routeId, stopId, name, vehicleModel, numberPlate, driverName, driverPhone, capacity, fare, stops } = body

    // Action 1: Assign student to route
    if (action === 'assign' || (studentId && routeId)) {
      if (!studentId || !routeId) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'studentId and routeId are required' }, { status: 400 })
      }

      let student = await prisma.student.findUnique({ where: { id: studentId } })
      if (!student) {
        student = await prisma.student.findUnique({ where: { admissionNumber: studentId } })
      }
      if (!student) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Student not found' }, { status: 404 })
      }

      // Resolve stop
      let targetStopId = stopId
      if (!targetStopId) {
        const firstStop = await prisma.routeStop.findFirst({ where: { routeId } })
        targetStopId = firstStop?.id
      }
      if (!targetStopId) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Route stop required' }, { status: 400 })
      }

      const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } }) || await prisma.academicYear.findFirst()
      const term = await prisma.term.findFirst({ where: { isCurrent: true } }) || await prisma.term.findFirst()

      if (!year || !term) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Active term and year not configured' }, { status: 400 })
      }

      const assignment = await prisma.studentTransport.create({
        data: {
          studentId: student.id,
          routeId,
          stopId: targetStopId,
          termId: term.id,
          academicYearId: year.id,
          type: TransportType.BOTH,
        },
        include: {
          route: true,
          student: { select: { id: true, admissionNumber: true, user: { select: { name: true } } } },
        },
      })

      return NextResponse.json<ApiResponse>(
        { success: true, data: assignment, message: 'Student assigned to transport route successfully' },
        { status: 201 }
      )
    }

    // Action 2: Create new bus route
    if (!name || !fare) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Route name and term fare are required' }, { status: 400 })
    }

    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'School not configured' }, { status: 400 })
    }

    const route = await prisma.transportRoute.create({
      data: {
        schoolId: school.id,
        name: name.trim(),
        startPoint: 'Route Starting Depot',
        endPoint: 'Campus Victoria Island',
        fee: Number(fare),
      },
    })

    if (numberPlate) {
      let vehicle = await prisma.vehicle.findUnique({ where: { plateNumber: numberPlate } })
      if (!vehicle) {
        await prisma.vehicle.create({
          data: {
            schoolId: school.id,
            routeId: route.id,
            plateNumber: numberPlate,
            type: vehicleModel || 'School Bus',
            driverName: driverName || null,
            driverPhone: driverPhone || null,
            capacity: Number(capacity) || 30,
          },
        })
      }
    }

    // Add stops if provided
    if (Array.isArray(stops) && stops.length > 0) {
      for (let i = 0; i < stops.length; i++) {
        if (typeof stops[i] === 'string' && stops[i].trim()) {
          await prisma.routeStop.create({
            data: {
              routeId: route.id,
              name: stops[i].trim(),
              order: i + 1,
            },
          })
        }
      }
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: route, message: 'Transport route created successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/transport error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
