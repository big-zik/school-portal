import { NextRequest } from 'next/server'

const mockPrisma: any = {
  guardian: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findFirst: jest.fn(),
  },
  userRole: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  studentGuardian: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(async (cb) => cb(mockPrisma)),
}

jest.mock('@/lib/db', () => ({ __esModule: true, default: mockPrisma }))
jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('@/lib/auth/audit', () => ({ logAudit: jest.fn().mockResolvedValue(undefined) }))
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed_password') }))

import { auth } from '@/auth'
import { GET, POST } from '@/app/api/parents/route'

const mockAuth = auth as unknown as jest.Mock

const req = (path: string, init?: { method?: string; body?: unknown }) =>
  new NextRequest(`http://localhost:3000${path}`, {
    method: init?.method ?? 'GET',
    headers: { 'content-type': 'application/json' },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  })

const signedIn = (roles: string[], id = 'admin-user-1') =>
  mockAuth.mockResolvedValue({ user: { id, roles } })

describe('/api/parents API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/parents', () => {
    it('returns 401 when unauthenticated', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await GET(req('/api/parents'))
      expect(res.status).toBe(401)
    })

    it('returns list of guardians when authenticated', async () => {
      signedIn(['ADMIN'])
      mockPrisma.guardian.findMany.mockResolvedValue([
        {
          id: 'g-1',
          relationship: 'FATHER',
          user: { id: 'u-1', name: 'John Doe', email: 'john@example.com' },
          studentGuardians: [],
        },
      ])

      const res = await GET(req('/api/parents'))
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(1)
    })
  })

  describe('POST /api/parents', () => {
    it('returns 401 when unauthenticated', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await POST(req('/api/parents', { method: 'POST', body: {} }))
      expect(res.status).toBe(401)
    })

    it('returns 403 when user is not admin', async () => {
      signedIn(['TEACHER'])
      const res = await POST(
        req('/api/parents', {
          method: 'POST',
          body: { name: 'Parent', email: 'parent@example.com' },
        })
      )
      expect(res.status).toBe(403)
    })

    it('returns 400 when name or email is missing', async () => {
      signedIn(['ADMIN'])
      const res = await POST(
        req('/api/parents', {
          method: 'POST',
          body: { name: 'Parent Only' },
        })
      )
      expect(res.status).toBe(400)
    })

    it('creates parent user, guardian profile, and links students', async () => {
      signedIn(['ADMIN'])
      mockPrisma.role.findFirst.mockResolvedValue({ id: 'role-parent-1', name: 'PARENT' })
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-parent-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })
      mockPrisma.userRole.findUnique.mockResolvedValue(null)
      mockPrisma.guardian.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: 'g-1',
        userId: 'u-parent-1',
        relationship: 'MOTHER',
        user: { id: 'u-parent-1', name: 'Jane Doe', email: 'jane@example.com' },
        studentGuardians: [{ student: { id: 's-1', user: { name: 'Bobby' } } }],
      })
      mockPrisma.guardian.create.mockResolvedValue({ id: 'g-1', userId: 'u-parent-1' })
      mockPrisma.studentGuardian.findUnique.mockResolvedValue(null)

      const res = await POST(
        req('/api/parents', {
          method: 'POST',
          body: {
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+234 800 000 0000',
            relationship: 'MOTHER',
            occupation: 'Accountant',
            officeAddress: 'Lagos',
            studentIds: ['s-1'],
          },
        })
      )

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(mockPrisma.guardian.create).toHaveBeenCalled()
      expect(mockPrisma.studentGuardian.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            studentId: 's-1',
            guardianId: 'g-1',
          }),
        })
      )
    })
  })
})
