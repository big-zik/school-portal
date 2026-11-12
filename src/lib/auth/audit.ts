// src/lib/audit.ts
import prisma from '@/lib/db'

// ---------------------------------------------------------------------------
// Audit action enum
// ---------------------------------------------------------------------------

export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  VIEW: 'VIEW',
  DOWNLOAD: 'DOWNLOAD',
  PAYMENT: 'PAYMENT',
  GRADE_CHANGE: 'GRADE_CHANGE',
  SETTINGS_CHANGE: 'SETTINGS_CHANGE',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
} as const

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction]

// ---------------------------------------------------------------------------
// Params type
// ---------------------------------------------------------------------------

export interface LogAuditParams {
  /** ID of the user performing the action */
  userId: string
  /** High-level action being performed (use AuditAction constants) */
  action: AuditActionType | string
  /** Business module this action belongs to (e.g., "Finance", "Grades") */
  module: string
  /** The type of entity being acted on (e.g., "Invoice", "Student") */
  entityType: string
  /** Primary key / ID of the specific entity, if applicable */
  entityId?: string
  /** Serialisable snapshot of the entity before the change */
  oldValue?: unknown
  /** Serialisable snapshot of the entity after the change */
  newValue?: unknown
  /** Client IP address extracted from request headers */
  ipAddress?: string
  /** Raw User-Agent header value */
  userAgent?: string
}

// ---------------------------------------------------------------------------
// logAudit
// ---------------------------------------------------------------------------

/**
 * Write an audit log entry to the AuditLog table.
 *
 * This function is intentionally fire-and-forget-safe: it catches and logs
 * any database errors without throwing, so a failed audit write never
 * disrupts the primary business operation.
 *
 * @example
 * await logAudit({
 *   userId: session.user.id,
 *   action: AuditAction.LOGIN,
 *   module: 'Auth',
 *   entityType: 'User',
 *   entityId: session.user.id,
 *   ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
 *   userAgent: request.headers.get('user-agent') ?? undefined,
 * })
 */
export async function logAudit(params: LogAuditParams): Promise<any> {
  const {
    userId,
    action,
    module,
    entityType,
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
  } = params

  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        module,
        entityType,
        entityId: entityId ?? undefined,
        oldValue: oldValue !== undefined ? (oldValue as any) : undefined,
        newValue: newValue !== undefined ? (newValue as any) : undefined,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
        createdAt: new Date(),
      },
    })
  } catch (error) {
    // Audit failures must never break the application — log to stderr only.
    console.error('[Audit] Failed to write audit log entry:', {
      action,
      module,
      entityType,
      entityId,
      userId,
      error,
    })
    return null
  }
}
