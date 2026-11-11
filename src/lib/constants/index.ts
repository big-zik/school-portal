import {
  Users,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users2,
  Calculator,
  Library,
  Home,
  Bus,
  Headphones,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  Bell,
  FileText,
  Settings,
  School,
  BookMarked,
  Wallet,
  ClipboardCheck,
  BookCopy,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'

// ─────────────────────────────────────────────
// Role metadata
// ─────────────────────────────────────────────

export const ROLES: Record<
  UserRole,
  { label: string; icon: LucideIcon; color: string }
> = {
  SUPER_ADMIN: { label: 'Super Admin', icon: ShieldCheck, color: 'text-purple-600' },
  ADMIN: { label: 'Admin', icon: Users, color: 'text-blue-600' },
  TEACHER: { label: 'Teacher', icon: BookOpen, color: 'text-green-600' },
  STUDENT: { label: 'Student', icon: GraduationCap, color: 'text-sky-600' },
  PARENT: { label: 'Parent / Guardian', icon: Users2, color: 'text-orange-500' },
  ACCOUNTANT: { label: 'Accountant', icon: Calculator, color: 'text-yellow-600' },
  LIBRARIAN: { label: 'Librarian', icon: Library, color: 'text-indigo-600' },
  HOSTEL_STAFF: { label: 'Hostel Staff', icon: Home, color: 'text-pink-600' },
  TRANSPORT_STAFF: { label: 'Transport Staff', icon: Bus, color: 'text-teal-600' },
  SUPPORT_STAFF: { label: 'Support Staff', icon: Headphones, color: 'text-slate-600' },
}

// ─────────────────────────────────────────────
// Days of week
// ─────────────────────────────────────────────

export const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Monday', short: 'Mon' },
  { value: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { value: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { value: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { value: 'SATURDAY', label: 'Saturday', short: 'Sat' },
] as const

// ─────────────────────────────────────────────
// Attendance status options
// ─────────────────────────────────────────────

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', color: 'text-green-600', bg: 'bg-green-100', badge: 'default' },
  { value: 'ABSENT', label: 'Absent', color: 'text-red-600', bg: 'bg-red-100', badge: 'destructive' },
  { value: 'LATE', label: 'Late', color: 'text-yellow-600', bg: 'bg-yellow-100', badge: 'secondary' },
  { value: 'EXCUSED', label: 'Excused', color: 'text-blue-600', bg: 'bg-blue-100', badge: 'outline' },
  { value: 'SICK', label: 'Sick Leave', color: 'text-orange-500', bg: 'bg-orange-100', badge: 'secondary' },
] as const

// ─────────────────────────────────────────────
// Assignment status options
// ─────────────────────────────────────────────

export const ASSIGNMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100' },
  { value: 'SUBMITTED', label: 'Submitted', color: 'text-blue-600', bg: 'bg-blue-100' },
  { value: 'GRADED', label: 'Graded', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'RETURNED', label: 'Returned', color: 'text-purple-600', bg: 'bg-purple-100' },
] as const

// ─────────────────────────────────────────────
// Payment method options
// ─────────────────────────────────────────────

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Debit / Credit Card' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'ONLINE', label: 'Online Payment' },
  { value: 'POS', label: 'POS Terminal' },
] as const

// ─────────────────────────────────────────────
// Invoice status options
// ─────────────────────────────────────────────

export const INVOICE_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100' },
  { value: 'PARTIAL', label: 'Partially Paid', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { value: 'PAID', label: 'Paid', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'OVERDUE', label: 'Overdue', color: 'text-red-600', bg: 'bg-red-100' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-slate-400', bg: 'bg-slate-50' },
] as const

// ─────────────────────────────────────────────
// Personal info options
// ─────────────────────────────────────────────

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const

export const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A−' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B−' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB−' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O−' },
  { value: 'UNKNOWN', label: 'Unknown' },
] as const

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full-Time' },
  { value: 'PART_TIME', label: 'Part-Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern / NYSC' },
  { value: 'VOLUNTEER', label: 'Volunteer' },
] as const

export const GUARDIAN_RELATIONSHIP_OPTIONS = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'UNCLE', label: 'Uncle' },
  { value: 'AUNT', label: 'Aunt' },
  { value: 'GRANDFATHER', label: 'Grandfather' },
  { value: 'GRANDMOTHER', label: 'Grandmother' },
  { value: 'OLDER_SIBLING', label: 'Older Sibling' },
  { value: 'LEGAL_GUARDIAN', label: 'Legal Guardian' },
  { value: 'SPONSOR', label: 'Sponsor' },
  { value: 'OTHER', label: 'Other' },
] as const

// ─────────────────────────────────────────────
// Grading scale (default)
// ─────────────────────────────────────────────

export const GRADE_SCALE = [
  { minScore: 90, maxScore: 100, letterGrade: 'A+', label: 'Distinction', color: 'text-green-700' },
  { minScore: 80, maxScore: 89, letterGrade: 'A', label: 'Excellent', color: 'text-green-600' },
  { minScore: 70, maxScore: 79, letterGrade: 'B', label: 'Very Good', color: 'text-blue-600' },
  { minScore: 60, maxScore: 69, letterGrade: 'C', label: 'Good', color: 'text-yellow-600' },
  { minScore: 50, maxScore: 59, letterGrade: 'D', label: 'Pass', color: 'text-orange-500' },
  { minScore: 0, maxScore: 49, letterGrade: 'F', label: 'Fail', color: 'text-red-600' },
] as const

// ─────────────────────────────────────────────
// Limits & timeouts
// ─────────────────────────────────────────────

export const MAX_FILE_SIZE_MB = 50
export const ITEMS_PER_PAGE = 20
export const SESSION_TIMEOUT_MINUTES = 60
export const MAX_LOGIN_ATTEMPTS = 5
export const LOCKOUT_DURATION_MINUTES = 15

// ─────────────────────────────────────────────
// Notification types
// ─────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  ATTENDANCE_MARKED: { label: 'Attendance Marked', icon: ClipboardCheck },
  ASSIGNMENT_POSTED: { label: 'New Assignment', icon: ClipboardList },
  ASSIGNMENT_GRADED: { label: 'Assignment Graded', icon: BookMarked },
  ASSIGNMENT_DUE: { label: 'Assignment Due Soon', icon: CalendarDays },
  FEE_INVOICE: { label: 'Fee Invoice', icon: Wallet },
  FEE_PAYMENT: { label: 'Payment Received', icon: Wallet },
  FEE_OVERDUE: { label: 'Fee Overdue', icon: Wallet },
  NEW_MESSAGE: { label: 'New Message', icon: MessageSquare },
  NEW_ANNOUNCEMENT: { label: 'Announcement', icon: Bell },
  EVENT_REMINDER: { label: 'Event Reminder', icon: CalendarDays },
  REPORT_PUBLISHED: { label: 'Report Card Published', icon: FileText },
  ADMISSION_UPDATE: { label: 'Admission Update', icon: School },
  LIBRARY_DUE: { label: 'Library Book Due', icon: BookCopy },
  GENERAL: { label: 'General', icon: Bell },
} as const satisfies Record<string, { label: string; icon: LucideIcon }>

// ─────────────────────────────────────────────
// Navigation per role
// ─────────────────────────────────────────────

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'Timetable', href: '/student/timetable', icon: CalendarDays },
  { label: 'Attendance', href: '/student/attendance', icon: ClipboardCheck },
  { label: 'Assignments', href: '/student/assignments', icon: ClipboardList },
  { label: 'Fees', href: '/student/fees', icon: Wallet },
  { label: 'Library', href: '/student/library', icon: Library },
  { label: 'Reports', href: '/student/reports', icon: FileText },
  { label: 'Messages', href: '/student/messages', icon: MessageSquare },
  { label: 'Announcements', href: '/student/announcements', icon: Bell },
  { label: 'Settings', href: '/student/settings', icon: Settings },
]

export const TEACHER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { label: 'My Classes', href: '/teacher/classes', icon: School },
  { label: 'Timetable', href: '/teacher/timetable', icon: CalendarDays },
  { label: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'Assignments', href: '/teacher/assignments', icon: ClipboardList },
  { label: 'Grades', href: '/teacher/grades', icon: BookMarked },
  { label: 'Students', href: '/teacher/students', icon: GraduationCap },
  { label: 'Messages', href: '/teacher/messages', icon: MessageSquare },
  { label: 'Announcements', href: '/teacher/announcements', icon: Bell },
  { label: 'Settings', href: '/teacher/settings', icon: Settings },
]

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: GraduationCap },
  { label: 'Teachers', href: '/admin/teachers', icon: BookOpen },
  { label: 'Staff', href: '/admin/staff', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: School },
  { label: 'Subjects', href: '/admin/subjects', icon: BookCopy },
  { label: 'Timetable', href: '/admin/timetable', icon: CalendarDays },
  { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Fees', href: '/admin/fees', icon: Wallet },
  { label: 'Library', href: '/admin/library', icon: Library },
  { label: 'Events', href: '/admin/events', icon: MapPin },
  { label: 'Announcements', href: '/admin/announcements', icon: Bell },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export const PARENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/parent', icon: LayoutDashboard },
  { label: 'My Children', href: '/parent/children', icon: GraduationCap },
  { label: 'Attendance', href: '/parent/attendance', icon: ClipboardCheck },
  { label: 'Assignments', href: '/parent/assignments', icon: ClipboardList },
  { label: 'Fees', href: '/parent/fees', icon: Wallet },
  { label: 'Reports', href: '/parent/reports', icon: FileText },
  { label: 'Messages', href: '/parent/messages', icon: MessageSquare },
  { label: 'Announcements', href: '/parent/announcements', icon: Bell },
  { label: 'Settings', href: '/parent/settings', icon: Settings },
]

export const ACCOUNTANT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/accountant', icon: LayoutDashboard },
  { label: 'Invoices', href: '/accountant/invoices', icon: FileText },
  { label: 'Payments', href: '/accountant/payments', icon: Wallet },
  { label: 'Fee Structure', href: '/accountant/fee-structure', icon: Calculator },
  { label: 'Scholarships', href: '/accountant/scholarships', icon: BookMarked },
  { label: 'Reports', href: '/accountant/reports', icon: ClipboardList },
  { label: 'Settings', href: '/accountant/settings', icon: Settings },
]

export const LIBRARIAN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/librarian', icon: LayoutDashboard },
  { label: 'Catalog', href: '/librarian/catalog', icon: Library },
  { label: 'Loans', href: '/librarian/loans', icon: BookCopy },
  { label: 'Reservations', href: '/librarian/reservations', icon: CalendarDays },
  { label: 'Reports', href: '/librarian/reports', icon: FileText },
  { label: 'Settings', href: '/librarian/settings', icon: Settings },
]

export const ROLE_NAV_MAP: Partial<Record<UserRole, NavItem[]>> = {
  SUPER_ADMIN: ADMIN_NAV,
  ADMIN: ADMIN_NAV,
  TEACHER: TEACHER_NAV,
  STUDENT: STUDENT_NAV,
  PARENT: PARENT_NAV,
  ACCOUNTANT: ACCOUNTANT_NAV,
  LIBRARIAN: LIBRARIAN_NAV,
}
