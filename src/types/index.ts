// All types needed for the portal

// ─────────────────────────────────────────────
// User / Auth
// ─────────────────────────────────────────────

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'ACCOUNTANT'
  | 'LIBRARIAN'
  | 'HOSTEL_STAFF'
  | 'TRANSPORT_STAFF'
  | 'SUPPORT_STAFF'

export interface SessionUser {
  id: string
  email: string
  name: string
  roles: UserRole[]
  avatar?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─────────────────────────────────────────────
// Student types
// ─────────────────────────────────────────────

export interface StudentProfile {
  id: string
  userId: string
  studentId: string
  fullName: string
  email: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  religion?: string
  nationality?: string
  address?: string
  city?: string
  state?: string
  country?: string
  medicalInfo?: Record<string, unknown>
  emergencyContact?: Record<string, unknown>
  admissionDate?: string
  admissionNumber?: string
  currentClass?: { id: string; name: string; level: string }
  currentSection?: { id: string; name: string }
  currentAcademicYear?: { id: string; name: string }
  status: 'ACTIVE' | 'SUSPENDED' | 'TRANSFERRED' | 'GRADUATED' | 'WITHDRAWN'
  guardians?: GuardianProfile[]
}

export interface GuardianProfile {
  id: string
  userId: string
  fullName: string
  email: string
  phone?: string
  relationship: string
  occupation?: string
  isPrimary: boolean
}

// ─────────────────────────────────────────────
// Teacher
// ─────────────────────────────────────────────

export interface TeacherProfile {
  id: string
  userId: string
  employeeId: string
  fullName: string
  email: string
  phone?: string
  avatar?: string
  qualification?: string
  specialization?: string
  employmentType: string
  joiningDate?: string
  subjects?: SubjectSummary[]
  classes?: ClassSummary[]
}

// ─────────────────────────────────────────────
// Class / Subject
// ─────────────────────────────────────────────

export interface ClassSummary {
  id: string
  name: string
  level: string
  capacity?: number
  studentCount?: number
  sections?: SectionSummary[]
}

export interface SectionSummary {
  id: string
  name: string
  classId: string
  capacity?: number
  studentCount?: number
}

export interface SubjectSummary {
  id: string
  name: string
  code: string
  creditHours?: number
  isElective?: boolean
  teacher?: { id: string; name: string }
}

// ─────────────────────────────────────────────
// Timetable
// ─────────────────────────────────────────────

export interface TimetableEntry {
  id: string
  dayOfWeek:
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
  startTime: string
  endTime: string
  subject: SubjectSummary
  teacher: { id: string; name: string }
  class: ClassSummary
  section?: SectionSummary
  room?: string
}

// ─────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EXCUSED'
  | 'SICK'

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName?: string
  date: string
  status: AttendanceStatus
  remarks?: string
  markedBy?: string
  subject?: string
  class?: string
}

export interface AttendanceSummary {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number
  percentage: number
}

// ─────────────────────────────────────────────
// Assignments
// ─────────────────────────────────────────────

export interface Assignment {
  id: string
  title: string
  description?: string
  instructions?: string
  subject: SubjectSummary
  class: ClassSummary
  teacher: { id: string; name: string }
  dueDate: string
  totalMarks: number
  allowLateSubmission: boolean
  isPublished: boolean
  attachments?: FileAttachment[]
  mySubmission?: Submission
  createdAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  submittedAt?: string
  files?: FileAttachment[]
  remarks?: string
  isLate: boolean
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'RETURNED'
  grade?: Grade
}

export interface Grade {
  id: string
  marksObtained: number
  percentage: number
  letterGrade?: string
  feedback?: string
  gradedAt?: string
}

export interface FileAttachment {
  name: string
  url: string
  size?: number
  type?: string
}

// ─────────────────────────────────────────────
// Fees
// ─────────────────────────────────────────────

export interface Invoice {
  id: string
  invoiceNumber: string
  studentId: string
  studentName?: string
  totalAmount: number
  discountAmount: number
  paidAmount: number
  balanceAmount: number
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate: string
  items: InvoiceItem[]
  payments?: Payment[]
  term?: string
  academicYear?: string
}

export interface InvoiceItem {
  id: string
  description: string
  amount: number
  category?: string
}

export interface Payment {
  id: string
  amount: number
  paymentMethod: string
  paymentDate: string
  referenceNumber?: string
  status: string
  receipt?: Receipt
}

export interface Receipt {
  id: string
  receiptNumber: string
  generatedAt: string
}

// ─────────────────────────────────────────────
// Announcements / Messages
// ─────────────────────────────────────────────

export interface Announcement {
  id: string
  title: string
  content: string
  author: { name: string; role: string }
  targetRoles?: string[]
  isPublished: boolean
  isPinned: boolean
  publishedAt?: string
  expiresAt?: string
  attachments?: FileAttachment[]
  createdAt: string
}

export interface Message {
  id: string
  sender: { id: string; name: string; avatar?: string; role: string }
  recipient: { id: string; name: string; avatar?: string }
  subject: string
  content: string
  isRead: boolean
  readAt?: string
  attachments?: FileAttachment[]
  parentMessageId?: string
  replies?: Message[]
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  body: string
  type: string
  link?: string
  isRead: boolean
  createdAt: string
}

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────

export interface SchoolEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  type:
    | 'ACADEMIC'
    | 'HOLIDAY'
    | 'SPORTS'
    | 'CULTURAL'
    | 'MEETING'
    | 'OTHER'
  targetRoles?: string[]
}

// ─────────────────────────────────────────────
// Library
// ─────────────────────────────────────────────

export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  publisher?: string
  category?: string
  totalCopies: number
  availableCopies: number
  coverImage?: string
  description?: string
  location?: string
}

export interface BookLoan {
  id: string
  book: Book
  studentId: string
  studentName?: string
  issuedAt: string
  dueDate: string
  returnedAt?: string
  fine?: number
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE'
}

// ─────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────

export interface ReportCard {
  id: string
  student: StudentProfile
  term: string
  academicYear: string
  class: string
  results: SubjectResult[]
  totalScore: number
  average: number
  percentage: number
  position: number
  outOf: number
  principalRemark?: string
  classTeacherRemark?: string
  promotionStatus: 'PROMOTED' | 'REPEATED' | 'PENDING'
  isPublished: boolean
  publishedAt?: string
}

export interface SubjectResult {
  subject: string
  caScore?: number
  examScore?: number
  totalScore: number
  percentage: number
  letterGrade: string
  position?: number
  teacherRemark?: string
}
