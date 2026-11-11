import { z } from 'zod'
import { DAYS_OF_WEEK } from '@/lib/constants'

// ─────────────────────────────────────────────
// Reusable field helpers
// ─────────────────────────────────────────────

const passwordFields = {
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
}

const confirmPasswordRefine = (data: any) =>
  data.password === data.confirmPassword

const confirmPasswordIssue = {
  message: 'Passwords do not match',
  path: ['confirmPassword'] as (string | number)[],
}

const dateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date' },
)

const optionalDateString = z.string().optional().refine(
  (val) => !val || !isNaN(Date.parse(val)),
  { message: 'Invalid date' },
)

// ─────────────────────────────────────────────
// Auth schemas
// ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    ...passwordFields,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(confirmPasswordRefine, confirmPasswordIssue)
export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    ...passwordFields,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(confirmPasswordRefine, confirmPasswordIssue)
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    ...passwordFields,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    { message: 'Passwords do not match', path: ['confirmPassword'] },
  )
  .refine(
    (data) => data.currentPassword !== data.password,
    { message: 'New password must differ from current password', path: ['password'] },
  )
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ─────────────────────────────────────────────
// Student profile schema
// ─────────────────────────────────────────────

export const studentProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(150),
  email: z.string().email('Invalid email').toLowerCase(),
  phone: z.string().optional(),
  dateOfBirth: optionalDateString,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'])
    .optional(),
  religion: z.string().max(50).optional(),
  nationality: z.string().max(60).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  emergencyContact: z
    .object({
      name: z.string().min(1, 'Contact name is required'),
      phone: z.string().min(1, 'Contact phone is required'),
      relationship: z.string().min(1, 'Relationship is required'),
    })
    .optional(),
  medicalInfo: z
    .object({
      allergies: z.string().optional(),
      conditions: z.string().optional(),
      medications: z.string().optional(),
    })
    .optional(),
  admissionDate: optionalDateString,
  admissionNumber: z.string().max(50).optional(),
  currentClassId: z.string().uuid('Invalid class').optional(),
  currentSectionId: z.string().uuid('Invalid section').optional(),
})
export type StudentProfileInput = z.infer<typeof studentProfileSchema>

// ─────────────────────────────────────────────
// Teacher profile schema
// ─────────────────────────────────────────────

export const teacherProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(150),
  email: z.string().email('Invalid email').toLowerCase(),
  phone: z.string().optional(),
  qualification: z.string().max(255).optional(),
  specialization: z.string().max(255).optional(),
  employmentType: z.enum([
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERN',
    'VOLUNTEER',
  ]),
  joiningDate: optionalDateString,
  subjectIds: z.array(z.string().uuid()).optional(),
  classIds: z.array(z.string().uuid()).optional(),
})
export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>

// ─────────────────────────────────────────────
// Class & Subject schemas
// ─────────────────────────────────────────────

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100),
  level: z.string().min(1, 'Level is required').max(50),
  capacity: z
    .number({ invalid_type_error: 'Capacity must be a number' })
    .int()
    .min(1, 'Capacity must be at least 1')
    .max(1000)
    .optional(),
  description: z.string().max(500).optional(),
  classTeacherId: z.string().uuid('Invalid teacher').optional(),
})
export type ClassInput = z.infer<typeof classSchema>

export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(150),
  code: z
    .string()
    .min(2, 'Subject code is required')
    .max(20)
    .toUpperCase(),
  creditHours: z
    .number({ invalid_type_error: 'Credit hours must be a number' })
    .int()
    .min(1)
    .max(10)
    .optional(),
  isElective: z.boolean().default(false),
  description: z.string().max(500).optional(),
  classIds: z.array(z.string().uuid()).min(1, 'Select at least one class'),
  teacherId: z.string().uuid('Invalid teacher').optional(),
})
export type SubjectInput = z.infer<typeof subjectSchema>

// ─────────────────────────────────────────────
// Timetable schema
// ─────────────────────────────────────────────

const daysOfWeekValues = DAYS_OF_WEEK.map((d) => d.value) as [
  string,
  ...string[],
]

export const timetableSchema = z
  .object({
    classId: z.string().uuid('Invalid class'),
    sectionId: z.string().uuid('Invalid section').optional(),
    subjectId: z.string().uuid('Invalid subject'),
    teacherId: z.string().uuid('Invalid teacher'),
    dayOfWeek: z.enum(daysOfWeekValues as [string, ...string[]]),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    room: z.string().max(50).optional(),
    academicYearId: z.string().uuid('Invalid academic year').optional(),
  })
  .refine(
    (data) => data.startTime < data.endTime,
    { message: 'End time must be after start time', path: ['endTime'] },
  )
export type TimetableInput = z.infer<typeof timetableSchema>

// ─────────────────────────────────────────────
// Attendance schema
// ─────────────────────────────────────────────

const attendanceEntrySchema = z.object({
  studentId: z.string().uuid('Invalid student'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']),
  remarks: z.string().max(255).optional(),
})

export const attendanceSchema = z.object({
  date: dateString,
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section').optional(),
  subjectId: z.string().uuid('Invalid subject').optional(),
  entries: z
    .array(attendanceEntrySchema)
    .min(1, 'At least one attendance entry is required'),
})
export type AttendanceInput = z.infer<typeof attendanceSchema>

// ─────────────────────────────────────────────
// Assignment schema
// ─────────────────────────────────────────────

export const assignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().max(2000).optional(),
  instructions: z.string().max(5000).optional(),
  subjectId: z.string().uuid('Invalid subject'),
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section').optional(),
  dueDate: dateString,
  totalMarks: z
    .number({ invalid_type_error: 'Total marks must be a number' })
    .int()
    .min(1, 'Total marks must be at least 1')
    .max(1000),
  allowLateSubmission: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  attachmentUrls: z.array(z.string().url()).optional(),
})
export type AssignmentInput = z.infer<typeof assignmentSchema>

// ─────────────────────────────────────────────
// Submission & Grade schemas
// ─────────────────────────────────────────────

export const submissionSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment'),
  remarks: z.string().max(1000).optional(),
  fileUrls: z.array(z.string().url()).optional(),
})
export type SubmissionInput = z.infer<typeof submissionSchema>

export const gradeSchema = z.object({
  submissionId: z.string().uuid('Invalid submission'),
  marksObtained: z
    .number({ invalid_type_error: 'Marks must be a number' })
    .min(0, 'Marks cannot be negative'),
  feedback: z.string().max(2000).optional(),
})
export type GradeInput = z.infer<typeof gradeSchema>

// ─────────────────────────────────────────────
// Announcement & Message schemas
// ─────────────────────────────────────────────

export const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required').max(255),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000),
  targetRoles: z
    .array(
      z.enum([
        'SUPER_ADMIN',
        'ADMIN',
        'TEACHER',
        'STUDENT',
        'PARENT',
        'ACCOUNTANT',
        'LIBRARIAN',
        'HOSTEL_STAFF',
        'TRANSPORT_STAFF',
        'SUPPORT_STAFF',
      ]),
    )
    .optional(),
  isPinned: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  publishedAt: optionalDateString,
  expiresAt: optionalDateString,
  attachmentUrls: z.array(z.string().url()).optional(),
})
export type AnnouncementInput = z.infer<typeof announcementSchema>

export const messageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient'),
  subject: z.string().min(1, 'Subject is required').max(255),
  content: z.string().min(1, 'Message cannot be empty').max(10000),
  parentMessageId: z.string().uuid().optional(),
  attachmentUrls: z.array(z.string().url()).optional(),
})
export type MessageInput = z.infer<typeof messageSchema>

// ─────────────────────────────────────────────
// Fee schemas
// ─────────────────────────────────────────────

export const feeStructureSchema = z.object({
  feeCategoryId: z.string().uuid('Invalid fee category'),
  classId: z.string().uuid('Invalid class'),
  termId: z.string().uuid('Invalid term').optional(),
  academicYearId: z.string().uuid('Invalid academic year').optional(),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, 'Amount cannot be negative'),
  dueDate: dateString,
  isMandatory: z.boolean().default(true),
  description: z.string().max(500).optional(),
})
export type FeeStructureInput = z.infer<typeof feeStructureSchema>

export const paymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum([
    'CASH',
    'BANK_TRANSFER',
    'CARD',
    'CHEQUE',
    'MOBILE_MONEY',
    'ONLINE',
    'POS',
  ]),
  referenceNumber: z.string().max(100).optional(),
  paymentDate: dateString,
  notes: z.string().max(500).optional(),
})
export type PaymentInput = z.infer<typeof paymentSchema>

// ─────────────────────────────────────────────
// Library schemas
// ─────────────────────────────────────────────

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  isbn: z
    .string()
    .regex(/^(97[89])?\d{9}(\d|X)$/, 'Invalid ISBN')
    .optional()
    .or(z.literal('')),
  publisher: z.string().max(150).optional(),
  publishedYear: z
    .number()
    .int()
    .min(1000)
    .max(new Date().getFullYear() + 1)
    .optional(),
  category: z.string().max(100).optional(),
  totalCopies: z
    .number({ invalid_type_error: 'Copies must be a number' })
    .int()
    .min(1, 'Must have at least one copy'),
  location: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
})
export type BookInput = z.infer<typeof bookSchema>

// ─────────────────────────────────────────────
// Event schema
// ─────────────────────────────────────────────

export const eventSchema = z
  .object({
    title: z.string().min(3, 'Title is required').max(255),
    description: z.string().max(5000).optional(),
    startDate: dateString,
    endDate: dateString,
    location: z.string().max(255).optional(),
    type: z.enum([
      'ACADEMIC',
      'HOLIDAY',
      'SPORTS',
      'CULTURAL',
      'MEETING',
      'OTHER',
    ]),
    targetRoles: z
      .array(
        z.enum([
          'SUPER_ADMIN',
          'ADMIN',
          'TEACHER',
          'STUDENT',
          'PARENT',
          'ACCOUNTANT',
          'LIBRARIAN',
          'HOSTEL_STAFF',
          'TRANSPORT_STAFF',
          'SUPPORT_STAFF',
        ]),
      )
      .optional(),
    isPublished: z.boolean().default(false),
  })
  .refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    { message: 'End date must be on or after start date', path: ['endDate'] },
  )
export type EventInput = z.infer<typeof eventSchema>

// ─────────────────────────────────────────────
// Admission application schema
// ─────────────────────────────────────────────

export const admissionApplicationSchema = z.object({
  applicantName: z.string().min(2, 'Applicant name is required').max(150),
  dateOfBirth: dateString,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  appliedClassId: z.string().uuid('Invalid class selection'),
  parentName: z.string().min(2, 'Parent/guardian name is required').max(150),
  parentEmail: z.string().email('Invalid parent email').toLowerCase(),
  parentPhone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(20),
  address: z.string().min(5, 'Address is required').max(255),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  previousSchool: z.string().max(255).optional(),
  previousClass: z.string().max(50).optional(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'])
    .optional(),
  religion: z.string().max(50).optional(),
  nationality: z.string().max(60).optional(),
  medicalConditions: z.string().max(1000).optional(),
  additionalNotes: z.string().max(2000).optional(),
})
export type AdmissionApplicationInput = z.infer<typeof admissionApplicationSchema>
