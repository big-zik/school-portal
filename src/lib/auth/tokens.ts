// src/lib/auth/tokens.ts
//
// Stateless, signed, expiring tokens for emailed links (password reset, email
// verification). No database table is needed: the token carries its own expiry
// and an HMAC signature, and is bound to a "fingerprint" of the state it is
// meant to change. Once that state changes (the password is reset, the email is
// verified or changed) the fingerprint no longer matches, so the link is
// single-use by construction.

import { createHash, createHmac, timingSafeEqual } from 'crypto'

export type TokenPurpose = 'password-reset' | 'email-verify'

export const TOKEN_TTL_SECONDS: Record<TokenPurpose, number> = {
  'password-reset': 15 * 60,
  'email-verify': 24 * 60 * 60,
}

interface TokenPayload {
  /** purpose */
  p: TokenPurpose
  /** user id */
  u: string
  /** expiry, unix seconds */
  e: number
  /** fingerprint of the state this token is allowed to change */
  f: string
}

export interface VerifiedToken {
  userId: string
  fingerprint: string
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET (or NEXTAUTH_SECRET) must be set to sign account tokens')
  }
  return secret
}

const b64url = (input: Buffer | string) => Buffer.from(input).toString('base64url')

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url')
}

/**
 * Short hash of a value (a password hash, an email address). Never put the raw
 * value in a token; the fingerprint is only ever compared, not decoded.
 */
export function fingerprintOf(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 24)
}

export function createToken(
  purpose: TokenPurpose,
  userId: string,
  fingerprintSource: string,
  ttlSeconds: number = TOKEN_TTL_SECONDS[purpose],
): string {
  const payload: TokenPayload = {
    p: purpose,
    u: userId,
    e: Math.floor(Date.now() / 1000) + ttlSeconds,
    f: fingerprintOf(fingerprintSource),
  }
  const body = b64url(JSON.stringify(payload))
  return `${body}.${sign(body)}`
}

/**
 * Returns the token contents if it is well-formed, correctly signed, for the
 * expected purpose and not expired. Otherwise null. The caller must still check
 * the fingerprint against the user's current state.
 */
export function readToken(token: unknown, purpose: TokenPurpose): VerifiedToken | null {
  if (typeof token !== 'string' || token.length > 2048) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, signature] = parts

  const expected = Buffer.from(sign(body))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

  let payload: TokenPayload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (
    payload.p !== purpose ||
    typeof payload.u !== 'string' ||
    typeof payload.f !== 'string' ||
    typeof payload.e !== 'number' ||
    payload.e < Math.floor(Date.now() / 1000)
  ) {
    return null
  }

  return { userId: payload.u, fingerprint: payload.f }
}

/** True when `fingerprintSource` is the state the token was issued for. */
export function matchesFingerprint(token: VerifiedToken, fingerprintSource: string): boolean {
  const a = Buffer.from(token.fingerprint)
  const b = Buffer.from(fingerprintOf(fingerprintSource))
  return a.length === b.length && timingSafeEqual(a, b)
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
}
