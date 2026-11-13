import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  parseISO,
  isValid,
} from 'date-fns'

// ─────────────────────────────────────────────
// Tailwind class merger
// ─────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ─────────────────────────────────────────────
// Date formatting
// ─────────────────────────────────────────────

function toDate(date: string | Date): Date {
  if (date instanceof Date) return date
  return parseISO(date)
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  try {
    return format(toDate(date), fmt)
  } catch {
    return String(date)
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    return format(toDate(date), 'MMM d, yyyy h:mm a')
  } catch {
    return String(date)
  }
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const d = toDate(date)
    if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true })
    if (isTomorrow(d)) return 'Tomorrow'
    return format(d, 'MMM d, yyyy')
  } catch {
    return String(date)
  }
}

export function formatDateForInput(date: string | Date): string {
  try {
    return format(toDate(date), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

// ─────────────────────────────────────────────
// Number formatting
// ─────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency = 'NGN',
  locale = 'en-NG',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exp = Math.floor(Math.log(bytes) / Math.log(1024))
  const clamped = Math.min(exp, units.length - 1)
  const val = bytes / Math.pow(1024, clamped)
  return `${val.toFixed(clamped === 0 ? 0 : 1)} ${units[clamped]}`
}

// ─────────────────────────────────────────────
// Grade helpers
// ─────────────────────────────────────────────

interface GradeScaleEntry {
  minScore: number
  maxScore: number
  letterGrade: string
}

const DEFAULT_GRADE_SCALE: GradeScaleEntry[] = [
  { minScore: 90, maxScore: 100, letterGrade: 'A+' },
  { minScore: 80, maxScore: 89, letterGrade: 'A' },
  { minScore: 70, maxScore: 79, letterGrade: 'B' },
  { minScore: 60, maxScore: 69, letterGrade: 'C' },
  { minScore: 50, maxScore: 59, letterGrade: 'D' },
  { minScore: 0, maxScore: 49, letterGrade: 'F' },
]

export function getLetterGrade(
  percentage: number,
  gradingScale: GradeScaleEntry[] = DEFAULT_GRADE_SCALE,
): string {
  const entry = gradingScale.find(
    (g) => percentage >= g.minScore && percentage <= g.maxScore,
  )
  return entry?.letterGrade ?? 'F'
}

export function getGradeColor(letterGrade: string): string {
  const grade = letterGrade.toUpperCase()
  if (grade === 'A+' || grade === 'A') return 'text-green-600'
  if (grade === 'B') return 'text-blue-600'
  if (grade === 'C') return 'text-yellow-600'
  if (grade === 'D') return 'text-orange-500'
  return 'text-red-600'
}

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 85) return 'text-green-600'
  if (percentage >= 70) return 'text-yellow-500'
  return 'text-red-600'
}

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────

export function getStatusBadgeVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status.toUpperCase()
  if (['ACTIVE', 'PAID', 'PRESENT', 'SUBMITTED', 'GRADED', 'RETURNED', 'PROMOTED'].includes(s))
    return 'default'
  if (['PENDING', 'PARTIAL', 'LATE', 'EXCUSED', 'SICK', 'REPEATED'].includes(s))
    return 'secondary'
  if (['OVERDUE', 'ABSENT', 'SUSPENDED', 'CANCELLED', 'REJECTED'].includes(s))
    return 'destructive'
  return 'outline'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    TRANSFERRED: 'Transferred',
    GRADUATED: 'Graduated',
    WITHDRAWN: 'Withdrawn',
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LATE: 'Late',
    EXCUSED: 'Excused',
    SICK: 'Sick Leave',
    PENDING: 'Pending',
    SUBMITTED: 'Submitted',
    GRADED: 'Graded',
    RETURNED: 'Returned',
    PAID: 'Paid',
    PARTIAL: 'Partially Paid',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
    PROMOTED: 'Promoted',
    REPEATED: 'Repeated',
    ACTIVE_LOAN: 'Active',
    RETURNED_LOAN: 'Returned',
    OVERDUE_LOAN: 'Overdue',
    PUBLISHED: 'Published',
    DRAFT: 'Draft',
  }
  return labels[status.toUpperCase()] ?? capitalize(status.toLowerCase().replace(/_/g, ' '))
}

// ─────────────────────────────────────────────
// String helpers
// ─────────────────────────────────────────────

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return `${str.slice(0, maxLen - 3)}...`
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getInitials(name: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Nigerian format: 080 1234 5678
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  // International +234 format
  if (digits.length === 13 && digits.startsWith('234')) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }
  return phone
}

// ─────────────────────────────────────────────
// URL helpers
// ─────────────────────────────────────────────

export function getRoleDashboardUrl(roles: string[]): string {
  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) return '/admin'
  if (roles.includes('TEACHER')) return '/teacher'
  if (roles.includes('STUDENT')) return '/student'
  if (roles.includes('PARENT')) return '/parent'
  if (roles.includes('ACCOUNTANT')) return '/accountant'
  if (roles.includes('LIBRARIAN')) return '/librarian'
  if (roles.includes('HOSTEL_STAFF')) return '/hostel'
  if (roles.includes('TRANSPORT_STAFF')) return '/transport'
  return '/portal'
}

export function getAvatarFallback(name: string): string {
  return getInitials(name)
}

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function isValidDate(date: string): boolean {
  try {
    const d = parseISO(date)
    return isValid(d)
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────
// Array helpers
// ─────────────────────────────────────────────

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key])
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(item)
    return acc
  }, {})
}

export function sortBy<T>(
  arr: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc',
): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal === bVal) return 0
    const cmp = aVal < bVal ? -1 : 1
    return order === 'asc' ? cmp : -cmp
  })
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new RangeError('Chunk size must be greater than 0')
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

// ─────────────────────────────────────────────
// Nigerian PAYE Tax Calculator
// ─────────────────────────────────────────────
export { calculateNigerianPAYE } from './payroll'
export type { NigerianPAYEResult, NigerianTaxBracket } from './payroll'

