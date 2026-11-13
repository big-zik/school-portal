import { NextRequest } from 'next/server'

const mockPrisma: any = {
  school: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  book: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  bookLoan: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  timetable: { findMany: jest.fn(), create: jest.fn() },
  academicYear: { findFirst: jest.fn(), create: jest.fn() },
  term: { findFirst: jest.fn(), create: jest.fn() },
  hostel: { findMany: jest.fn(), create: jest.fn() },
  room: { findUnique: jest.fn(), create: jest.fn() },
  hostelAllocation: { create: jest.fn() },
  transportRoute: { findMany: jest.fn(), create: jest.fn() },
  vehicle: { findUnique: jest.fn(), create: jest.fn() },
  routeStop: { findFirst: jest.fn(), create: jest.fn() },
  studentTransport: { create: jest.fn() },
  student: { count: jest.fn(), findUnique: jest.fn(), groupBy: jest.fn() },
  attendance: { groupBy: jest.fn() },
  invoice: { aggregate: jest.fn() },
  reportCard: { findMany: jest.fn() },
  class: { findMany: jest.fn() },
  event: { findMany: jest.fn(), create: jest.fn() },
  supportTicket: { create: jest.fn() },
  user: { findFirst: jest.fn() },
  $transaction: jest.fn((callback) => callback(mockPrisma)),
}

jest.mock('@/lib/db', () => ({ __esModule: true, default: mockPrisma }))
jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('@/lib/email', () => ({ sendEmail: jest.fn().mockResolvedValue(undefined) }))

import { auth } from '@/auth'
import { POST as contactPOST } from '@/app/api/contact/route'
import { GET as settingsGET, PATCH as settingsPATCH } from '@/app/api/settings/route'
import { POST as booksPOST } from '@/app/api/library/books/route'
import { POST as loansPOST } from '@/app/api/library/loans/route'
import { POST as timetablePOST } from '@/app/api/timetable/route'
import { GET as hostelGET, POST as hostelPOST } from '@/app/api/hostel/route'
import { GET as transportGET, POST as transportPOST } from '@/app/api/transport/route'
import { GET as meetingsGET, POST as meetingsPOST } from '@/app/api/meetings/route'
import { GET as reportsGET } from '@/app/api/reports/route'

const mockAuth = auth as unknown as jest.Mock

const req = (path: string, init?: { method?: string; body?: unknown }) =>
  new NextRequest(`http://localhost:3000${path}`, {
    method: init?.method ?? 'GET',
    headers: { 'content-type': 'application/json' },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  })

const signedIn = (roles: string[], id = 'user-1') =>
  mockAuth.mockResolvedValue({ user: { id, roles } })

beforeEach(() => {
  jest.clearAllMocks()
  mockPrisma.school.findFirst.mockResolvedValue({ id: 'school-1', name: 'CHOSEN GENERATION SCHOOL' })
})

describe('POST /api/contact', () => {
  it('validates required fields', async () => {
    const res = await contactPOST(req('/api/contact', { method: 'POST', body: { name: '' } }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('successfully creates ticket and sends notifications', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'admin-1' })
    mockPrisma.supportTicket.create.mockResolvedValue({ id: 'ticket-1' })

    const res = await contactPOST(
      req('/api/contact', {
        method: 'POST',
        body: {
          name: 'Mrs. Ngozi',
          email: 'ngozi@example.com',
          phone: '+2348000000000',
          topic: 'Admissions Inquiry',
          message: 'I want to inquire about JSS 1 admission.',
        },
      })
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockPrisma.supportTicket.create).toHaveBeenCalled()
  })
})

describe('GET & PATCH /api/settings', () => {
  it('GET /api/settings returns institution settings', async () => {
    signedIn(['ADMIN'])
    const res = await settingsGET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.name).toBe('CHOSEN GENERATION SCHOOL')
  })

  it('PATCH /api/settings updates school settings', async () => {
    signedIn(['ADMIN'])
    mockPrisma.school.update.mockResolvedValue({ id: 'school-1', name: 'CHOSEN GENERATION HIGH' })

    const res = await settingsPATCH(
      req('/api/settings', {
        method: 'PATCH',
        body: { name: 'CHOSEN GENERATION HIGH' },
      })
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})

describe('POST /api/library/books', () => {
  it('creates a new book in catalog', async () => {
    signedIn(['LIBRARIAN'])
    mockPrisma.book.create.mockResolvedValue({ id: 'b-1', title: 'New General Maths' })

    const res = await booksPOST(
      req('/api/library/books', {
        method: 'POST',
        body: {
          title: 'New General Maths',
          author: 'M.F. Macrae',
          isbn: '978-001',
          totalCopies: 5,
        },
      })
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})

describe('POST /api/library/loans', () => {
  it('issues a loan when book is available', async () => {
    signedIn(['LIBRARIAN'])
    mockPrisma.book.findUnique.mockResolvedValue({ id: 'b-1', availableCopies: 5 })
    mockPrisma.student.findUnique.mockResolvedValue({ id: 'stu-1' })
    mockPrisma.bookLoan.create.mockResolvedValue({ id: 'loan-1' })

    const res = await loansPOST(
      req('/api/library/loans', {
        method: 'POST',
        body: {
          action: 'issue',
          bookId: 'b-1',
          studentId: 'stu-1',
        },
      })
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns a book and updates inventory', async () => {
    signedIn(['LIBRARIAN'])
    mockPrisma.bookLoan.findUnique.mockResolvedValue({ id: 'loan-1', bookId: 'b-1', status: 'ACTIVE' })
    mockPrisma.bookLoan.update.mockResolvedValue({ id: 'loan-1', status: 'RETURNED' })

    const res = await loansPOST(
      req('/api/library/loans', {
        method: 'POST',
        body: {
          action: 'return',
          loanId: 'loan-1',
        },
      })
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})

describe('POST /api/timetable', () => {
  it('creates timetable slot with resolved academic year and term', async () => {
    signedIn(['ADMIN'])
    mockPrisma.academicYear.findFirst.mockResolvedValue({ id: 'year-1' })
    mockPrisma.term.findFirst.mockResolvedValue({ id: 'term-1' })
    mockPrisma.timetable.create.mockResolvedValue({ id: 'slot-1' })

    const res = await timetablePOST(
      req('/api/timetable', {
        method: 'POST',
        body: {
          classId: 'class-1',
          subjectId: 'sub-1',
          teacherId: 'teacher-1',
          dayOfWeek: 'MONDAY',
          startTime: '08:00',
          endTime: '08:45',
          room: 'Room 101',
        },
      })
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})

describe('GET & POST /api/hostel and /api/transport', () => {
  it('GET /api/hostel returns hostels', async () => {
    signedIn(['ADMIN'])
    mockPrisma.hostel.findMany.mockResolvedValue([
      { id: 'h-1', name: 'Nelson Mandela Hall', type: 'MALE', capacity: 100, rooms: [] },
    ])

    const res = await hostelGET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.length).toBe(1)
  })

  it('GET /api/transport returns routes', async () => {
    signedIn(['ADMIN'])
    mockPrisma.transportRoute.findMany.mockResolvedValue([
      { id: 'r-1', name: 'Lekki Route', vehicles: [], routeStops: [], studentTransports: [] },
    ])

    const res = await transportGET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.length).toBe(1)
  })
})

describe('GET & POST /api/meetings', () => {
  it('GET /api/meetings returns scheduled meetings', async () => {
    signedIn(['PARENT'])
    mockPrisma.event.findMany.mockResolvedValue([])

    const res = await meetingsGET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.length).toBeGreaterThan(0)
  })

  it('POST /api/meetings schedules parent-teacher meeting', async () => {
    signedIn(['PARENT'])
    mockPrisma.event.create.mockResolvedValue({ id: 'ev-1', title: 'Maths Progress' })

    const res = await meetingsPOST(
      req('/api/meetings', {
        method: 'POST',
        body: {
          title: 'Maths Progress',
          teacherName: 'Dr. Smith',
          childName: 'Daniel',
        },
      })
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})

describe('GET /api/reports', () => {
  it('aggregates live metrics across enrolment, attendance, fees, broadsheet', async () => {
    signedIn(['ADMIN'])
    mockPrisma.student.count.mockResolvedValue(412)
    mockPrisma.student.groupBy.mockResolvedValue([])
    mockPrisma.attendance.groupBy.mockResolvedValue([])
    mockPrisma.invoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000000, paidAmount: 800000 } })
    mockPrisma.reportCard.findMany.mockResolvedValue([])
    mockPrisma.class.findMany.mockResolvedValue([])

    const res = await reportsGET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.enrolment).toBeDefined()
    expect(json.data.attendance).toBeDefined()
    expect(json.data.fees).toBeDefined()
    expect(json.data.broadsheet).toBeDefined()
  })
})
