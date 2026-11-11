// src/lib/auth-helpers.ts
import { hash, compare } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { auth } from '@/auth'
import { type Session } from 'next-auth'

// ---------------------------------------------------------------------------
// Password utilities
// ---------------------------------------------------------------------------

/**
 * Hash a plain-text password using bcryptjs (12 salt rounds).
 */
export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, 12)
}

/**
 * Compare a plain-text password against a bcrypt hash.
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed)
}

// ---------------------------------------------------------------------------
// Token / OTP generation
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically-secure random hex token.
 * @param length Number of bytes of randomness (output string is 2× longer).
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

/**
 * Generate a numeric OTP of the given digit length (default 6).
 */
export function generateOtp(length: number = 6): string {
  const max = Math.pow(10, length)
  const raw = randomBytes(4).readUInt32BE(0) % max
  return raw.toString().padStart(length, '0')
}

// ---------------------------------------------------------------------------
// Server-side session helpers
// ---------------------------------------------------------------------------

type SessionUser = Session['user'] & { roles?: string[] }

/**
 * Returns the authenticated session user on the server, or `null` if the
 * request is unauthenticated.
 */
export async function getServerUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user) return null
  return session.user as SessionUser
}

/**
 * Server-side role guard. Throws an error if the current session user does
 * not hold at least one of the specified roles. Use in Server Actions /
 * Route Handlers that require authorisation.
 *
 * @example
 * await requireRole(['ADMIN', 'SUPER_ADMIN'])
 */
export async function requireRole(roles: string[]): Promise<SessionUser> {
  const user = await getServerUser()

  if (!user) {
    throw new Error('Unauthorised: you must be signed in to perform this action.')
  }

  const userRoles: string[] = (user as any).roles ?? []
  const hasRole = roles.some((r) => userRoles.includes(r))

  if (!hasRole) {
    throw new Error(
      `Forbidden: this action requires one of the following roles: ${roles.join(', ')}.`,
    )
  }

  return user
}

// ---------------------------------------------------------------------------
// ID / number generation helpers
// ---------------------------------------------------------------------------

/**
 * Generate a student ID.
 * @example generateStudentId('STU', 1) → "STU2024001"
 */
export function generateStudentId(prefix: string, sequence: number): string {
  const year = new Date().getFullYear()
  const seq = sequence.toString().padStart(3, '0')
  return `${prefix}${year}${seq}`
}

/**
 * Generate an employee ID (teacher, staff, etc.).
 * @example generateEmployeeId('TCH', 1) → "TCH2024001"
 */
export function generateEmployeeId(prefix: string, sequence: number): string {
  const year = new Date().getFullYear()
  const seq = sequence.toString().padStart(3, '0')
  return `${prefix}${year}${seq}`
}

/**
 * Generate an invoice number.
 * @example generateInvoiceNumber(1) → "INV-2024-00001"
 */
export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear()
  const seq = sequence.toString().padStart(5, '0')
  return `INV-${year}-${seq}`
}

/**
 * Generate a receipt number.
 * @example generateReceiptNumber(1) → "REC-2024-00001"
 */
export function generateReceiptNumber(sequence: number): string {
  const year = new Date().getFullYear()
  const seq = sequence.toString().padStart(5, '0')
  return `REC-${year}-${seq}`
}

/**
 * Generate an admission number.
 * @example generateAdmissionNumber(2024, 1) → "ADM/2024/001"
 */
export function generateAdmissionNumber(year: number, sequence: number): string {
  const seq = sequence.toString().padStart(3, '0')
  return `ADM/${year}/${seq}`
}
