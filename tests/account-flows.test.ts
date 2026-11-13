const mockPrisma = {
  user: { findUnique: jest.fn(), update: jest.fn() },
}

jest.mock('@/lib/db', () => ({ __esModule: true, default: mockPrisma }))
jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('@/lib/auth/audit', () => ({ logAudit: jest.fn() }))
jest.mock('@/lib/email', () => ({
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerificationEmail: jest.fn(),
}))

import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'
import { sendPasswordResetEmail, sendEmailVerificationEmail } from '@/lib/email'
import { createToken } from '@/lib/auth/tokens'
import { POST as forgotPOST } from '@/app/api/auth/forgot-password/route'
import { POST as resetPOST } from '@/app/api/auth/reset-password/route'
import { POST as verifyPOST } from '@/app/api/auth/verify-email/route'
import { POST as changePOST } from '@/app/api/account/change-password/route'
import { POST as resendPOST } from '@/app/api/account/resend-verification/route'

const mockAuth = auth as unknown as jest.Mock
const sendReset = sendPasswordResetEmail as jest.Mock
const sendVerify = sendEmailVerificationEmail as jest.Mock
const audit = logAudit as jest.Mock

const STRONG = 'Str0ng!Pass'
const OLD_HASH = '$2a$12$old.hash.value.for.fingerprinting.only'

const post = (path: string, body: unknown) =>
  new NextRequest(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

const baseUser = {
  id: 'user-1',
  email: 'ada@school.com',
  name: 'Ada Obi',
  password: OLD_HASH,
  isActive: true,
  isSuspended: false,
  deletedAt: null,
  emailVerified: false,
}

beforeAll(() => {
  ;(process.env as Record<string, string>).AUTH_SECRET = 'test-secret-that-is-long-enough'
  ;(process.env as Record<string, string>).NEXT_PUBLIC_APP_URL = 'https://portal.test'
})

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'info').mockImplementation(() => {})
})

// ---------------------------------------------------------------------------

describe('POST /api/auth/forgot-password', () => {
  const call = (body: unknown) => forgotPOST(post('/api/auth/forgot-password', body))

  it('emails a reset link containing a signed token for an active account', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)

    const res = await call({ email: 'ADA@school.com' })

    expect(res.status).toBe(200)
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'ada@school.com' } })
    expect(sendReset).toHaveBeenCalledTimes(1)
    const [to, name, url, expires] = sendReset.mock.calls[0]
    expect(to).toBe('ada@school.com')
    expect(name).toBe('Ada Obi')
    expect(url).toMatch(/^https:\/\/portal\.test\/reset-password\?token=/)
    expect(expires).toBe('15 minutes')
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'PASSWORD_RESET_REQUESTED', userId: 'user-1' }))
  })

  it('returns the same response for an unknown email and sends nothing', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    const unknown = await call({ email: 'nobody@school.com' })

    mockPrisma.user.findUnique.mockResolvedValue(baseUser)
    const known = await call({ email: 'ada@school.com' })

    expect(unknown.status).toBe(known.status)
    expect(await unknown.json()).toEqual(await known.json())
    expect(sendReset).toHaveBeenCalledTimes(1) // only for the known account
  })

  it.each([
    ['inactive', { isActive: false }],
    ['suspended', { isSuspended: true }],
    ['deleted', { deletedAt: new Date() }],
  ])('sends nothing for a %s account but still answers 200', async (_label, patch) => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, ...patch })
    const res = await call({ email: 'ada@school.com' })
    expect(res.status).toBe(200)
    expect(sendReset).not.toHaveBeenCalled()
  })

  it('still answers 200 when the email provider fails', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)
    sendReset.mockRejectedValue(new Error('SMTP down'))
    const res = await call({ email: 'ada@school.com' })
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })

  it('returns 422 for an invalid email', async () => {
    expect((await call({ email: 'nope' })).status).toBe(422)
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('returns 400 for a body that is not JSON', async () => {
    expect((await call('{broken')).status).toBe(400)
  })

  it('returns 500 on a database failure', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('db down'))
    expect((await call({ email: 'ada@school.com' })).status).toBe(500)
  })
})

// ---------------------------------------------------------------------------

describe('POST /api/auth/reset-password', () => {
  const call = (body: unknown) => resetPOST(post('/api/auth/reset-password', body))
  const goodBody = (token: string) => ({ token, password: STRONG, confirmPassword: STRONG })

  it('sets a bcrypt-hashed password and clears any lockout', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)
    const token = createToken('password-reset', baseUser.id, baseUser.password)

    const res = await call(goodBody(token))

    expect(res.status).toBe(200)
    const data = mockPrisma.user.update.mock.calls[0][0].data
    expect(data.password).not.toBe(STRONG)
    await expect(bcrypt.compare(STRONG, data.password)).resolves.toBe(true)
    expect(data.loginAttempts).toBe(0)
    expect(data.lockedUntil).toBeNull()
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'PASSWORD_RESET_COMPLETED' }))
  }, 20000)

  it('rejects a link that has already been used (password changed since)', async () => {
    const token = createToken('password-reset', baseUser.id, baseUser.password)
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, password: '$2a$12$a.brand.new.hash' })

    const res = await call(goodBody(token))

    expect(res.status).toBe(400)
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('rejects a garbage token', async () => {
    const res = await call(goodBody('not-a-real-token'))
    expect(res.status).toBe(400)
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('rejects an email-verification token used as a reset token', async () => {
    const token = createToken('email-verify', baseUser.id, baseUser.email)
    expect((await call(goodBody(token))).status).toBe(400)
  })

  it.each([
    ['inactive', { isActive: false }],
    ['suspended', { isSuspended: true }],
    ['deleted', { deletedAt: new Date() }],
  ])('rejects a valid token for a %s account', async (_label, patch) => {
    const token = createToken('password-reset', baseUser.id, baseUser.password)
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, ...patch })
    expect((await call(goodBody(token))).status).toBe(400)
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('rejects a user that no longer exists', async () => {
    const token = createToken('password-reset', baseUser.id, baseUser.password)
    mockPrisma.user.findUnique.mockResolvedValue(null)
    expect((await call(goodBody(token))).status).toBe(400)
  })

  it('returns 422 with field errors for a weak password', async () => {
    const token = createToken('password-reset', baseUser.id, baseUser.password)
    const res = await call({ token, password: 'weak', confirmPassword: 'weak' })
    expect(res.status).toBe(422)
    expect((await res.json()).errors.password).toBeDefined()
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('returns 422 when the passwords do not match', async () => {
    const token = createToken('password-reset', baseUser.id, baseUser.password)
    const res = await call({ token, password: STRONG, confirmPassword: 'Different1!' })
    expect(res.status).toBe(422)
    expect((await res.json()).errors.confirmPassword).toBeDefined()
  })

  it('returns 400 for a body that is not JSON', async () => {
    expect((await call('{broken')).status).toBe(400)
  })
})

// ---------------------------------------------------------------------------

describe('POST /api/auth/verify-email', () => {
  const call = (body: unknown) => verifyPOST(post('/api/auth/verify-email', body))

  it('marks the email verified', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)
    const token = createToken('email-verify', baseUser.id, baseUser.email)

    const res = await call({ token })

    expect(res.status).toBe(200)
    expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { emailVerified: true } })
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'EMAIL_VERIFIED' }))
  })

  it('is idempotent for an already-verified account', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, emailVerified: true })
    const token = createToken('email-verify', baseUser.id, baseUser.email)

    const res = await call({ token })

    expect(res.status).toBe(200)
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('rejects a link issued for a previous email address', async () => {
    const token = createToken('email-verify', baseUser.id, 'old-address@school.com')
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)
    expect((await call({ token })).status).toBe(400)
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('rejects a password-reset token', async () => {
    const token = createToken('password-reset', baseUser.id, baseUser.email)
    expect((await call({ token })).status).toBe(400)
  })

  it('rejects a missing or garbage token', async () => {
    expect((await call({})).status).toBe(400)
    expect((await call({ token: 'garbage' })).status).toBe(400)
  })

  it('rejects a deleted account', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, deletedAt: new Date() })
    const token = createToken('email-verify', baseUser.id, baseUser.email)
    expect((await call({ token })).status).toBe(400)
  })
})

// ---------------------------------------------------------------------------

describe('POST /api/account/change-password', () => {
  const call = (body: unknown) => changePOST(post('/api/account/change-password', body))
  let currentHash: string

  beforeAll(async () => {
    currentHash = await bcrypt.hash('OldPass1!', 4)
  })

  const body = { currentPassword: 'OldPass1!', password: STRONG, confirmPassword: STRONG }

  it('returns 401 when signed out', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await call(body)).status).toBe(401)
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('changes the password when the current one is correct', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, password: currentHash })

    const res = await call(body)

    expect(res.status).toBe(200)
    const data = mockPrisma.user.update.mock.calls[0][0].data
    await expect(bcrypt.compare(STRONG, data.password)).resolves.toBe(true)
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'PASSWORD_CHANGED', userId: 'user-1' }))
  }, 20000)

  it('rejects a wrong current password with a field error and changes nothing', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, password: currentHash })

    const res = await call({ ...body, currentPassword: 'WrongPass1!' })

    expect(res.status).toBe(400)
    expect((await res.json()).errors.currentPassword).toBeDefined()
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('only ever changes the signed-in user, ignoring any userId in the body', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, password: currentHash })

    await call({ ...body, userId: 'someone-else', id: 'someone-else' })

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    expect(mockPrisma.user.update.mock.calls[0][0].where).toEqual({ id: 'user-1' })
  }, 20000)

  it('returns 422 when the new password equals the current one', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    const res = await call({ currentPassword: STRONG, password: STRONG, confirmPassword: STRONG })
    expect(res.status).toBe(422)
  })

  it('returns 422 for a weak new password', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    expect((await call({ ...body, password: 'weak', confirmPassword: 'weak' })).status).toBe(422)
  })

  it('returns 404 when the account is gone', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.user.findUnique.mockResolvedValue(null)
    expect((await call(body)).status).toBe(404)
  })
})

// ---------------------------------------------------------------------------

describe('POST /api/account/resend-verification', () => {
  it('returns 401 when signed out', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await resendPOST()).status).toBe(401)
    expect(sendVerify).not.toHaveBeenCalled()
  })

  it('emails a verification link to the signed-in user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)

    const res = await resendPOST()

    expect(res.status).toBe(200)
    const [to, name, url] = sendVerify.mock.calls[0]
    expect(to).toBe('ada@school.com')
    expect(name).toBe('Ada Obi')
    expect(url).toMatch(/^https:\/\/portal\.test\/verify-email\?token=/)
  })

  it('does not send anything when already verified', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, emailVerified: true })
    const res = await resendPOST()
    expect(res.status).toBe(200)
    expect(sendVerify).not.toHaveBeenCalled()
  })

  it('returns 502 when the email provider fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.user.findUnique.mockResolvedValue(baseUser)
    sendVerify.mockRejectedValue(new Error('SMTP down'))
    expect((await resendPOST()).status).toBe(502)
  })
})

// ---------------------------------------------------------------------------

describe('end to end: emailed link produces a working reset', () => {
  it('the token in the emailed URL is accepted by reset-password exactly once', async () => {
    let currentUser = { ...baseUser }
    mockPrisma.user.findUnique.mockImplementation(async () => currentUser)
    mockPrisma.user.update.mockImplementation(async ({ data }: { data: { password: string } }) => {
      currentUser = { ...currentUser, password: data.password }
      return currentUser
    })

    await forgotPOST(post('/api/auth/forgot-password', { email: 'ada@school.com' }))
    const url = new URL(sendReset.mock.calls[0][2])
    const token = url.searchParams.get('token')!

    const first = await resetPOST(post('/api/auth/reset-password', { token, password: STRONG, confirmPassword: STRONG }))
    const second = await resetPOST(post('/api/auth/reset-password', { token, password: 'An0ther!Pass', confirmPassword: 'An0ther!Pass' }))

    expect(first.status).toBe(200)
    expect(second.status).toBe(400)
  }, 20000)
})
