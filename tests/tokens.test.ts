import { createToken, readToken, matchesFingerprint, fingerprintOf, appUrl, TOKEN_TTL_SECONDS } from '@/lib/auth/tokens'

const SECRET = 'test-secret-that-is-long-enough'

describe('account tokens', () => {
  const env = process.env as Record<string, string | undefined>
  const originalAuth = env.AUTH_SECRET
  const originalNext = env.NEXTAUTH_SECRET

  beforeEach(() => {
    env.AUTH_SECRET = SECRET
    delete env.NEXTAUTH_SECRET
  })
  afterEach(() => {
    jest.useRealTimers()
    env.AUTH_SECRET = originalAuth
    env.NEXTAUTH_SECRET = originalNext
  })

  it('round-trips a valid token', () => {
    const token = createToken('password-reset', 'user-1', 'hash-A')
    const read = readToken(token, 'password-reset')
    expect(read?.userId).toBe('user-1')
    expect(matchesFingerprint(read!, 'hash-A')).toBe(true)
  })

  it('does not put the raw fingerprint source in the token', () => {
    const token = createToken('password-reset', 'user-1', 'super-secret-hash-value')
    const decoded = Buffer.from(token.split('.')[0], 'base64url').toString()
    expect(decoded).not.toContain('super-secret-hash-value')
  })

  it('binds the token to the state it was issued for', () => {
    const read = readToken(createToken('password-reset', 'user-1', 'old-hash'), 'password-reset')!
    expect(matchesFingerprint(read, 'old-hash')).toBe(true)
    expect(matchesFingerprint(read, 'new-hash')).toBe(false)
  })

  it('rejects a token used for a different purpose', () => {
    const token = createToken('email-verify', 'user-1', 'a@b.com')
    expect(readToken(token, 'password-reset')).toBeNull()
  })

  it('rejects a token whose payload was tampered with', () => {
    const [, sig] = createToken('password-reset', 'user-1', 'h').split('.')
    const forgedBody = Buffer.from(
      JSON.stringify({ p: 'password-reset', u: 'admin-1', e: 9999999999, f: fingerprintOf('h') }),
    ).toString('base64url')
    expect(readToken(`${forgedBody}.${sig}`, 'password-reset')).toBeNull()
  })

  it('rejects a token signed with a different secret', () => {
    const token = createToken('password-reset', 'user-1', 'h')
    env.AUTH_SECRET = 'a-completely-different-secret-value'
    expect(readToken(token, 'password-reset')).toBeNull()
  })

  it('rejects an expired token', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-13T10:00:00Z'))
    const token = createToken('password-reset', 'user-1', 'h')

    jest.setSystemTime(new Date('2026-11-13T10:00:00Z').getTime() + (TOKEN_TTL_SECONDS['password-reset'] - 1) * 1000)
    expect(readToken(token, 'password-reset')).not.toBeNull()

    jest.setSystemTime(new Date('2026-11-13T10:00:00Z').getTime() + (TOKEN_TTL_SECONDS['password-reset'] + 1) * 1000)
    expect(readToken(token, 'password-reset')).toBeNull()
  })

  it('gives reset links 15 minutes and verification links 24 hours', () => {
    expect(TOKEN_TTL_SECONDS['password-reset']).toBe(900)
    expect(TOKEN_TTL_SECONDS['email-verify']).toBe(86400)
  })

  it.each([undefined, null, 42, '', 'no-dot', 'a.b.c', '.', 'x'.repeat(3000)])(
    'rejects malformed input %p',
    (bad) => {
      expect(readToken(bad as unknown, 'password-reset')).toBeNull()
    },
  )

  it('rejects a correctly signed token whose body is not JSON', () => {
    const { createHmac } = require('crypto')
    const body = Buffer.from('not json').toString('base64url')
    const sig = createHmac('sha256', SECRET).update(body).digest('base64url')
    expect(readToken(`${body}.${sig}`, 'password-reset')).toBeNull()
  })

  it('falls back to NEXTAUTH_SECRET when AUTH_SECRET is unset', () => {
    delete env.AUTH_SECRET
    env.NEXTAUTH_SECRET = 'nextauth-secret-long-enough-xx'
    const token = createToken('password-reset', 'u', 'h')
    expect(readToken(token, 'password-reset')).not.toBeNull()
  })

  it('refuses to sign when no secret is configured', () => {
    delete env.AUTH_SECRET
    expect(() => createToken('password-reset', 'u', 'h')).toThrow(/AUTH_SECRET/)
  })

  it('refuses a weak (too short) secret', () => {
    env.AUTH_SECRET = 'short'
    expect(() => createToken('password-reset', 'u', 'h')).toThrow(/AUTH_SECRET/)
  })

  it('appUrl strips trailing slashes and defaults to localhost', () => {
    const original = env.NEXT_PUBLIC_APP_URL
    env.NEXT_PUBLIC_APP_URL = 'https://portal.example.com//'
    expect(appUrl()).toBe('https://portal.example.com')
    delete env.NEXT_PUBLIC_APP_URL
    expect(appUrl()).toBe('http://localhost:3000')
    env.NEXT_PUBLIC_APP_URL = original
  })
})
