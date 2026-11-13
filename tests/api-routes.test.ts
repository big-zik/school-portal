const mockPrisma = {
  student: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  submission: { findUnique: jest.fn() },
  teacher: { findUnique: jest.fn(), findFirst: jest.fn() },
  grade: { findMany: jest.fn(), upsert: jest.fn() },
  role: { findUnique: jest.fn() },
  $transaction: jest.fn(),
}

jest.mock('@/lib/db', () => ({ __esModule: true, default: mockPrisma }))
jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('@/lib/auth/audit', () => ({ logAudit: jest.fn() }))

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { GET as studentsGET, POST as studentsPOST } from '@/app/api/students/route'
import { GET as gradesGET, POST as gradesPOST } from '@/app/api/grades/route'

const mockAuth = auth as unknown as jest.Mock

const UUID = '3f2b8c1e-5a4d-4b7e-9c1a-2d3e4f5a6b7c'

const req = (path: string, init?: { method?: string; body?: unknown }) =>
  new NextRequest(`http://localhost:3000${path}`, {
    method: init?.method ?? 'GET',
    headers: { 'content-type': 'application/json' },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  })

const signedIn = (roles: string[], id = 'user-1') => mockAuth.mockResolvedValue({ user: { id, roles } })

beforeEach(() => {
  jest.resetAllMocks()
  mockPrisma.$transaction.mockImplementation(async (cb: (t: unknown) => unknown) =>
    cb({
      submission: { update: jest.fn() },
      grade: { upsert: mockPrisma.grade.upsert },
    }),
  )
})

// ---------------------------------------------------------------------------
// /api/students
// ---------------------------------------------------------------------------

describe('GET /api/students', () => {
  beforeEach(() => {
    mockPrisma.student.count.mockResolvedValue(45)
    mockPrisma.student.findMany.mockResolvedValue([])
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await studentsGET(req('/api/students'))
    expect(res.status).toBe(401)
    expect(mockPrisma.student.findMany).not.toHaveBeenCalled()
  })

  it('defaults to page 1, 20 per page and excludes soft-deleted students', async () => {
    signedIn(['ADMIN'])
    await studentsGET(req('/api/students'))
    const args = mockPrisma.student.findMany.mock.calls[0][0]
    expect(args.skip).toBe(0)
    expect(args.take).toBe(20)
    expect(args.where).toEqual({ deletedAt: null })
  })

  it('returns pagination metadata', async () => {
    signedIn(['ADMIN'])
    const res = await studentsGET(req('/api/students?page=2&limit=20'))
    const body = await res.json()
    expect(body.pagination).toEqual({ page: 2, limit: 20, total: 45, totalPages: 3, hasNext: true, hasPrev: true })
  })

  it('flags the last page as having no next page', async () => {
    signedIn(['ADMIN'])
    const res = await studentsGET(req('/api/students?page=3&limit=20'))
    const { pagination } = await res.json()
    expect(pagination.hasNext).toBe(false)
    expect(pagination.hasPrev).toBe(true)
  })

  it('caps limit at 100', async () => {
    signedIn(['ADMIN'])
    await studentsGET(req('/api/students?limit=5000'))
    expect(mockPrisma.student.findMany.mock.calls[0][0].take).toBe(100)
  })

  it('floors page at 1 and limit at 1', async () => {
    signedIn(['ADMIN'])
    await studentsGET(req('/api/students?page=-4&limit=0'))
    const args = mockPrisma.student.findMany.mock.calls[0][0]
    expect(args.skip).toBe(0)
    expect(args.take).toBe(1)
  })

  it('applies class, status and search filters', async () => {
    signedIn(['TEACHER'])
    await studentsGET(req('/api/students?classId=c1&status=ACTIVE&search=ada'))
    const where = mockPrisma.student.findMany.mock.calls[0][0].where
    expect(where.currentClassId).toBe('c1')
    expect(where.status).toBe('ACTIVE')
    expect(where.OR).toEqual([
      { user: { name: { contains: 'ada', mode: 'insensitive' } } },
      { studentId: { contains: 'ada', mode: 'insensitive' } },
    ])
  })

  it('returns 500 with the error message when the database fails', async () => {
    signedIn(['ADMIN'])
    mockPrisma.student.count.mockRejectedValue(new Error('db down'))
    const res = await studentsGET(req('/api/students'))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe('db down')
  })
})

describe('POST /api/students', () => {
  const body = { fullName: 'Chidi Okafor', email: 'chidi@school.com' }

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await studentsPOST(req('/api/students', { method: 'POST', body }))
    expect(res.status).toBe(401)
  })

  it.each([['STUDENT'], ['PARENT'], ['TEACHER']])('returns 403 for role %s', async (role) => {
    signedIn([role])
    const res = await studentsPOST(req('/api/students', { method: 'POST', body }))
    expect(res.status).toBe(403)
    expect(mockPrisma.role.findUnique).not.toHaveBeenCalled()
  })

  it('returns 422 with field errors for an invalid payload', async () => {
    signedIn(['ADMIN'])
    const res = await studentsPOST(
      req('/api/students', { method: 'POST', body: { fullName: 'C', email: 'bad', gender: 'X' } }),
    )
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error).toBe('Validation failed')
    expect(Object.keys(json.errors)).toEqual(expect.arrayContaining(['fullName', 'email', 'gender']))
  })

  it('returns 500 when the STUDENT role is not configured', async () => {
    signedIn(['SUPER_ADMIN'])
    mockPrisma.role.findUnique.mockResolvedValue(null)
    const res = await studentsPOST(req('/api/students', { method: 'POST', body }))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/STUDENT role not configured/)
  })
})

// ---------------------------------------------------------------------------
// /api/grades
// ---------------------------------------------------------------------------

describe('GET /api/grades', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await gradesGET(req('/api/grades'))).status).toBe(401)
  })

  it('forces a student to see only their own grades, ignoring ?studentId', async () => {
    signedIn(['STUDENT'], 'user-stu')
    mockPrisma.student.findUnique.mockResolvedValue({ id: 'stu-own' })
    mockPrisma.grade.findMany.mockResolvedValue([])

    await gradesGET(req('/api/grades?studentId=someone-else'))

    expect(mockPrisma.student.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-stu' } })
    expect(mockPrisma.grade.findMany.mock.calls[0][0].where.studentId).toBe('stu-own')
  })

  it('returns 404 when a student has no profile', async () => {
    signedIn(['STUDENT'])
    mockPrisma.student.findUnique.mockResolvedValue(null)
    expect((await gradesGET(req('/api/grades'))).status).toBe(404)
  })

  it('lets a teacher filter by an arbitrary studentId', async () => {
    signedIn(['TEACHER'])
    mockPrisma.grade.findMany.mockResolvedValue([])
    await gradesGET(req('/api/grades?studentId=stu-9'))
    expect(mockPrisma.student.findUnique).not.toHaveBeenCalled()
    expect(mockPrisma.grade.findMany.mock.calls[0][0].where.studentId).toBe('stu-9')
  })

  it('does not restrict a user who is both STUDENT and TEACHER', async () => {
    signedIn(['STUDENT', 'TEACHER'])
    mockPrisma.grade.findMany.mockResolvedValue([])
    await gradesGET(req('/api/grades?studentId=stu-9'))
    expect(mockPrisma.student.findUnique).not.toHaveBeenCalled()
  })

  it('nests subject and term filters under assignment and caps results at 100', async () => {
    signedIn(['ADMIN'])
    mockPrisma.grade.findMany.mockResolvedValue([])
    await gradesGET(req('/api/grades?subjectId=sub-1&termId=term-1'))
    const args = mockPrisma.grade.findMany.mock.calls[0][0]
    expect(args.where.assignment).toEqual({ subjectId: 'sub-1', termId: 'term-1' })
    expect(args.take).toBe(100)
  })
})

describe('POST /api/grades', () => {
  const post = (body: unknown) => gradesPOST(req('/api/grades', { method: 'POST', body }))
  const validBody = { submissionId: 'sub-1', marksObtained: 18 }

  const arrangeSubmission = (totalMarks: number) => {
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: 'sub-1',
      studentId: 'stu-1',
      assignmentId: 'asg-1',
      assignment: { teacherId: 't-1', totalMarks },
      student: {},
    })
    mockPrisma.teacher.findUnique.mockResolvedValue({ id: 't-1' })
    mockPrisma.grade.upsert.mockImplementation(async (args: { create: Record<string, unknown> }) => ({
      id: 'grade-1',
      ...args.create,
    }))
  }

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await post(validBody)).status).toBe(401)
  })

  it.each([['STUDENT'], ['PARENT']])('returns 403 for role %s', async (role) => {
    signedIn([role])
    expect((await post(validBody)).status).toBe(403)
    expect(mockPrisma.submission.findUnique).not.toHaveBeenCalled()
  })

  it('returns 422 for negative marks', async () => {
    signedIn(['TEACHER'])
    const res = await post({ submissionId: 'sub-1', marksObtained: -3 })
    expect(res.status).toBe(422)
    expect((await res.json()).errors.marksObtained).toBeDefined()
  })

  it('returns 422 when submissionId is missing', async () => {
    signedIn(['TEACHER'])
    expect((await post({ marksObtained: 5 })).status).toBe(422)
  })

  it('returns 404 when the submission does not exist', async () => {
    signedIn(['TEACHER'])
    mockPrisma.submission.findUnique.mockResolvedValue(null)
    expect((await post(validBody)).status).toBe(404)
  })

  it('returns 400 when no teacher profile can be resolved', async () => {
    signedIn(['ADMIN'])
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: 'sub-1',
      studentId: 'stu-1',
      assignmentId: 'asg-1',
      assignment: { teacherId: 't-1', totalMarks: 20 },
    })
    mockPrisma.teacher.findUnique.mockResolvedValue(null)
    mockPrisma.teacher.findFirst.mockResolvedValue(null)
    expect((await post(validBody)).status).toBe(400)
  })

  it('computes percentage and letter grade and returns 201', async () => {
    signedIn(['TEACHER'])
    arrangeSubmission(20)

    const res = await post({ submissionId: 'sub-1', marksObtained: 18 })

    expect(res.status).toBe(201)
    const { data } = await res.json()
    expect(data.percentage).toBe(90)
    expect(data.letterGrade).toBe('A+')
    expect(data.gradedById).toBe('t-1')
  })

  it.each([
    [20, 20, 100, 'A+'],
    [16, 20, 80, 'A'],
    [14, 20, 70, 'B'],
    [12, 20, 60, 'C'],
    [10, 20, 50, 'D'],
    [9, 20, 45, 'F'],
    [0, 20, 0, 'F'],
    [1, 3, 33.3, 'F'],
  ])('%d/%d -> %d%% (%s)', async (marks, total, pct, letter) => {
    signedIn(['TEACHER'])
    arrangeSubmission(total)
    const { data } = await (await post({ submissionId: 'sub-1', marksObtained: marks })).json()
    expect(data.percentage).toBe(pct)
    expect(data.letterGrade).toBe(letter)
  })

  it('treats an assignment with 0 total marks as out of 100', async () => {
    signedIn(['TEACHER'])
    arrangeSubmission(0)
    const { data } = await (await post({ submissionId: 'sub-1', marksObtained: 75 })).json()
    expect(data.percentage).toBe(75)
  })

  it('falls back to the assignment teacher when an admin grades', async () => {
    signedIn(['ADMIN'], 'admin-1')
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: 'sub-1',
      studentId: 'stu-1',
      assignmentId: 'asg-1',
      assignment: { teacherId: 't-assigned', totalMarks: 20 },
    })
    mockPrisma.teacher.findUnique
      .mockResolvedValueOnce(null) // lookup by admin's userId
      .mockResolvedValueOnce({ id: 't-assigned' }) // lookup by assignment.teacherId
    mockPrisma.grade.upsert.mockImplementation(async (a: { create: Record<string, unknown> }) => ({ id: 'g', ...a.create }))

    const { data } = await (await post(validBody)).json()
    expect(data.gradedById).toBe('t-assigned')
  })

  it('caps percentage at 100 when marks exceed the total', async () => {
    signedIn(['TEACHER'])
    arrangeSubmission(20)
    const { data } = await (await post({ submissionId: 'sub-1', marksObtained: 30 })).json()
    expect(data.percentage).toBe(100)
  })

  // KNOWN DEFECT: marks above the assignment's total are stored as-is (only the
  // percentage is capped), so a 30/20 grade is persisted. The route should reject
  // it. `it.failing` passes while the bug exists; flip to `it` once fixed.
  it.failing('rejects marks that exceed the assignment total marks', async () => {
    signedIn(['TEACHER'])
    arrangeSubmission(20)
    const res = await post({ submissionId: 'sub-1', marksObtained: 30 })
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).toBeLessThan(500)
  })
})
