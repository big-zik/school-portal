import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import type { ApiResponse } from '@/types'

// GET /api/health — query sick bay clinic logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const studentId = searchParams.get('studentId')

    const logs = await prisma.auditLog.findMany({
      where: { module: 'HEALTH' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const visits = logs.map((l) => {
      const data = (l.newValue as any) || {}
      return {
        id: l.id,
        studentId: l.entityId,
        studentName: data.studentName || 'Student',
        admissionNo: data.admissionNo || 'N/A',
        className: data.className || 'General',
        symptoms: data.symptoms || '',
        temperature: data.temperature || '36.8°C',
        bloodPressure: data.bloodPressure || '110/70',
        diagnosis: data.diagnosis || 'General Observation',
        treatment: data.treatment || 'Oral Rehydration & Rest',
        admittedToBed: data.admittedToBed || false,
        parentNotified: data.parentNotified || false,
        attendingNurse: data.attendingNurse || 'School Nurse',
        date: data.date || l.createdAt,
      }
    })

    const filtered = studentId ? visits.filter((v) => v.studentId === studentId) : visits
    return NextResponse.json<ApiResponse>({ success: true, data: filtered })
  } catch (error: any) {
    console.error('GET /api/health error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/health — log sick bay clinic visit
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, symptoms, temperature, bloodPressure, diagnosis, treatment, admittedToBed, parentNotified } = body

    if (!studentId || !symptoms) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'studentId and symptoms are required' },
        { status: 400 },
      )
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true } },
        currentClass: { select: { name: true } },
      },
    })

    const payload = {
      studentId,
      studentName: student?.user?.name || 'Student',
      admissionNo: student?.admissionNumber || student?.studentId || 'N/A',
      className: student?.currentClass?.name || 'General',
      symptoms,
      temperature: temperature || '36.8°C',
      bloodPressure: bloodPressure || '115/75',
      diagnosis: diagnosis || 'Clinical Observation',
      treatment: treatment || 'Administered First Aid / Rest',
      admittedToBed: Boolean(admittedToBed),
      parentNotified: Boolean(parentNotified),
      attendingNurse: session.user.name || 'School Medical Officer',
      date: new Date().toISOString(),
    }

    const log = await logAudit({
      userId: session.user.id,
      action: 'LOG_SICK_BAY_VISIT',
      module: 'HEALTH',
      entityType: 'SickBayEncounter',
      entityId: studentId,
      newValue: payload,
    })

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Sick bay clinical encounter recorded', data: { id: log?.id || `hlt_${Date.now()}`, ...payload } },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('POST /api/health error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
