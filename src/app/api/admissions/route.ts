import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { z } from 'zod'
import { Gender, AdmissionStatus } from '@prisma/client'
import { notifyAdmissionSubmission } from '@/lib/notifications'
import type { ApiResponse } from '@/types'

const admissionSubmitSchema = z.object({
  applicantName: z.string().min(3, 'Applicant full name is required'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  appliedClassId: z.string().min(1, 'Please select the class applied for'),
  parentName: z.string().min(3, 'Parent or guardian full name is required'),
  parentEmail: z.string().email('A valid parent email address is required'),
  parentPhone: z.string().min(7, 'A valid telephone number is required'),
  address: z.string().min(5, 'Residential address is required'),
  previousSchool: z.string().optional(),
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        type: z.string().optional(),
      }),
    )
    .optional(),
})

// GET /api/admissions — admin lists applications
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const callerRoles: string[] = (session.user as any).roles ?? []
    const canAccess = callerRoles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))
    if (!canAccess) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') as AdmissionStatus | null
    const classId = searchParams.get('classId')
    const search = searchParams.get('search')

    const where: any = {}
    if (status && Object.values(AdmissionStatus).includes(status)) {
      where.status = status
    }
    if (classId) {
      where.appliedClassId = classId
    }
    if (search) {
      where.OR = [
        { applicantName: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
        { parentEmail: { contains: search, mode: 'insensitive' } },
        { parentPhone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const applications = await prisma.admissionApplication.findMany({
      where,
      include: {
        appliedClass: { select: { id: true, name: true, level: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { appliedAt: 'desc' },
      take: 100,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: applications,
    })
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/admissions — public endpoint for parents/students to submit admission application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = admissionSubmitSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string[]> = {}
      parsed.error.errors.forEach((e) => {
        const key = e.path.join('.')
        errors[key] = [...(errors[key] ?? []), e.message]
      })
      return NextResponse.json<ApiResponse>({ success: false, error: 'Validation failed', errors }, { status: 422 })
    }

    const data = parsed.data

    // Find school profile or fallback to first school
    const school = await prisma.school.findFirst()

    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'School profile not configured' }, { status: 500 })
    }

    const application = await prisma.admissionApplication.create({
      data: {
        schoolId: school.id,
        applicantName: data.applicantName.trim(),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender as Gender,
        appliedClassId: data.appliedClassId,
        parentName: data.parentName.trim(),
        parentEmail: data.parentEmail.toLowerCase().trim(),
        parentPhone: data.parentPhone.trim(),
        address: data.address.trim(),
        previousSchool: data.previousSchool?.trim() || null,
        documents: data.documents || [],
        status: AdmissionStatus.PENDING,
      },
      include: {
        appliedClass: { select: { id: true, name: true } },
      },
    })

    const applicationNumber = `ADM-${application.id.slice(-6).toUpperCase()}`

    // Multi-channel notification: SendGrid email to parent, Twilio SMS to parent, In-App to admins
    notifyAdmissionSubmission({
      applicationId: application.id,
      applicationNumber,
      applicantName: application.applicantName,
      appliedClassName: application.appliedClass?.name || 'Class',
      parentName: data.parentName.trim(),
      parentEmail: data.parentEmail.toLowerCase().trim(),
      parentPhone: data.parentPhone.trim(),
    }).catch((err) => console.error('[Admissions] Notification error:', err))

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Your admission application has been received successfully!',
        data: {
          applicationNumber,
          id: application.id,
          applicantName: application.applicantName,
          appliedClass: application.appliedClass?.name,
          status: application.status,
          appliedAt: application.appliedAt,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error submitting application:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 })
  }
}
