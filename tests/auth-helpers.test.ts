jest.mock('@/auth', () => ({ auth: jest.fn() }))

import { auth } from '@/auth'
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateOtp,
  getServerUser,
  requireRole,
  generateStudentId,
  generateEmployeeId,
  generateInvoiceNumber,
  generateReceiptNumber,
  generateAdmissionNumber,
} from '@/lib/auth/helpers'

const mockAuth = auth as unknown as jest.Mock

describe('password hashing', () => {
  it('produces a bcrypt hash that is not the plain text', async () => {
    const hashed = await hashPassword('Secret1!')
    expect(hashed).not.toBe('Secret1!')
    expect(hashed).toMatch(/^\$2[aby]\$12\$/)
  }, 15000)

  it('verifies the correct password', async () => {
    const hashed = await hashPassword('Secret1!')
    await expect(verifyPassword('Secret1!', hashed)).resolves.toBe(true)
  }, 15000)

  it('rejects a wrong password', async () => {
    const hashed = await hashPassword('Secret1!')
    await expect(verifyPassword('secret1!', hashed)).resolves.toBe(false)
  }, 15000)

  it('salts hashes so the same password hashes differently each time', async () => {
    const [a, b] = await Promise.all([hashPassword('Same1!pw'), hashPassword('Same1!pw')])
    expect(a).not.toBe(b)
  }, 15000)
})

describe('generateToken', () => {
  it('returns 64 hex characters by default (32 bytes)', () => {
    expect(generateToken()).toMatch(/^[0-9a-f]{64}$/)
  })

  it('returns 2x the requested byte length in hex characters', () => {
    expect(generateToken(8)).toMatch(/^[0-9a-f]{16}$/)
  })

  it('does not repeat across calls', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateToken()))
    expect(tokens.size).toBe(50)
  })
})

describe('generateOtp', () => {
  it('returns a 6-digit numeric string by default', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOtp()).toMatch(/^\d{6}$/)
    }
  })

  it('honours a custom length, preserving leading zeros', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOtp(4)).toMatch(/^\d{4}$/)
    }
  })
})

describe('getServerUser', () => {
  afterEach(() => mockAuth.mockReset())

  it('returns null when there is no session', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(getServerUser()).resolves.toBeNull()
  })

  it('returns null when the session has no user', async () => {
    mockAuth.mockResolvedValue({})
    await expect(getServerUser()).resolves.toBeNull()
  })

  it('returns the session user when signed in', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', roles: ['TEACHER'] } })
    await expect(getServerUser()).resolves.toEqual({ id: 'u1', roles: ['TEACHER'] })
  })
})

describe('requireRole', () => {
  afterEach(() => mockAuth.mockReset())

  it('throws Unauthorised when not signed in', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(requireRole(['ADMIN'])).rejects.toThrow(/Unauthorised/)
  })

  it('throws Forbidden when the user lacks every required role', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', roles: ['STUDENT'] } })
    await expect(requireRole(['ADMIN', 'SUPER_ADMIN'])).rejects.toThrow(/Forbidden.*ADMIN, SUPER_ADMIN/)
  })

  it('throws Forbidden when the user has no roles array', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } })
    await expect(requireRole(['ADMIN'])).rejects.toThrow(/Forbidden/)
  })

  it('returns the user when they hold one of the roles', async () => {
    const user = { id: 'u1', roles: ['TEACHER', 'ADMIN'] }
    mockAuth.mockResolvedValue({ user })
    await expect(requireRole(['ADMIN'])).resolves.toEqual(user)
  })
})

describe('ID and number generators', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-13T10:00:00Z'))
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  it('generateStudentId pads the sequence to 3 digits', () => {
    expect(generateStudentId('STU', 1)).toBe('STU2026001')
    expect(generateStudentId('STU', 42)).toBe('STU2026042')
  })

  it('generateStudentId does not truncate sequences over 3 digits', () => {
    expect(generateStudentId('STU', 1234)).toBe('STU20261234')
  })

  it('generateEmployeeId follows the same format', () => {
    expect(generateEmployeeId('TCH', 7)).toBe('TCH2026007')
  })

  it('generateInvoiceNumber pads to 5 digits', () => {
    expect(generateInvoiceNumber(1)).toBe('INV-2026-00001')
    expect(generateInvoiceNumber(12345)).toBe('INV-2026-12345')
  })

  it('generateReceiptNumber pads to 5 digits', () => {
    expect(generateReceiptNumber(9)).toBe('REC-2026-00009')
  })

  it('generateAdmissionNumber uses the supplied year, not the clock', () => {
    expect(generateAdmissionNumber(2024, 1)).toBe('ADM/2024/001')
    expect(generateAdmissionNumber(2030, 120)).toBe('ADM/2030/120')
  })
})
