import {
  createInAppNotification,
  notifyAttendanceAbsence,
  notifyPaymentReceipt,
  notifyAdmissionSubmission,
} from '@/lib/notifications'
import prisma from '@/lib/db'
import * as emailService from '@/lib/email'
import * as smsService from '@/lib/sms'

// Mock prisma and email/sms services
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    notification: {
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: 'notif-1', ...data, createdAt: new Date() }),
      ),
      count: jest.fn().mockResolvedValue(2),
    },
    student: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
    },
  },
}))

jest.mock('@/lib/email', () => ({
  sendAttendanceAlert: jest.fn().mockResolvedValue(undefined),
  sendPaymentReceiptEmail: jest.fn().mockResolvedValue(undefined),
  sendAdmissionConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/sms', () => ({
  sendAttendanceSmsAlert: jest.fn().mockResolvedValue({ success: true }),
  sendPaymentReceiptSms: jest.fn().mockResolvedValue({ success: true }),
  sendAdmissionConfirmationSms: jest.fn().mockResolvedValue({ success: true }),
}))

describe('Multi-Channel Notification Coordinator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates in-app notifications in the database', async () => {
    const notif = await createInAppNotification({
      userId: 'user-123',
      title: 'Fee Payment Received',
      body: 'Your payment of ₦50,000 has been received.',
      type: 'PAYMENT' as any,
      link: '/parent/fees',
    })

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-123',
        title: 'Fee Payment Received',
        body: 'Your payment of ₦50,000 has been received.',
        type: 'PAYMENT',
        link: '/parent/fees',
      },
    })
    expect(notif?.id).toBe('notif-1')
  })

  it('dispatches attendance absence alert via in-app, SendGrid and Twilio', async () => {
    ;(prisma.student.findUnique as jest.Mock).mockResolvedValue({
      id: 'student-1',
      userId: 'student-user-1',
      user: { id: 'student-user-1', name: 'Daniel Johnson', email: 'daniel@school.com', phone: '+2348011111111' },
      currentClass: { name: 'Grade 10 Alpha' },
      studentGuardians: [
        {
          guardian: {
            user: { id: 'parent-1', name: 'Mr. Johnson', email: 'parent@home.com', phone: '+2348022222222' },
          },
        },
      ],
    })

    await notifyAttendanceAbsence({
      studentId: 'student-1',
      date: new Date('2026-02-15'),
      className: 'Grade 10 Alpha',
      remarks: 'Unexcused medical absence',
    })

    // In-app notifications: for student and parent
    expect(prisma.notification.create).toHaveBeenCalledTimes(2)

    // SendGrid email to parent
    expect(emailService.sendAttendanceAlert).toHaveBeenCalledWith(
      'parent@home.com',
      'Mr. Johnson',
      'Daniel Johnson',
      expect.any(String),
      'absent',
      'Grade 10 Alpha',
    )

    // Twilio SMS to parent
    expect(smsService.sendAttendanceSmsAlert).toHaveBeenCalledWith(
      '+2348022222222',
      'Mr. Johnson',
      'Daniel Johnson',
      'absent',
      expect.any(String),
    )
  })

  it('dispatches payment receipt via in-app, email and SMS upon bursary confirmation', async () => {
    ;(prisma.student.findUnique as jest.Mock).mockResolvedValue({
      id: 'student-1',
      userId: 'student-user-1',
      user: { id: 'student-user-1', name: 'Daniel Johnson' },
      studentGuardians: [],
    })

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'payer-1',
      name: 'Mrs. Johnson',
      email: 'mrs.johnson@example.com',
      phone: '+2348033333333',
    })

    await notifyPaymentReceipt({
      receiptNumber: 'REC-998877',
      amount: 150000,
      paymentMethod: 'Paystack Card',
      paymentDate: new Date('2026-02-15'),
      invoiceTitle: 'Term 2 Tuition Fees',
      balanceRemaining: 0,
      studentId: 'student-1',
      paidById: 'payer-1',
    })

    // In-app notifications to payer and student
    expect(prisma.notification.create).toHaveBeenCalledTimes(2)

    // Email receipt
    expect(emailService.sendPaymentReceiptEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'mrs.johnson@example.com',
        receiptNumber: 'REC-998877',
        amount: 150000,
      }),
    )

    // SMS alert
    expect(smsService.sendPaymentReceiptSms).toHaveBeenCalledWith(
      '+2348033333333',
      'Mrs. Johnson',
      'Daniel Johnson',
      150000,
      'REC-998877',
      0,
    )
  })

  it('dispatches admission submission notifications to parent and admins', async () => {
    await notifyAdmissionSubmission({
      applicationId: 'adm-app-1',
      applicationNumber: 'ADM-202601',
      applicantName: 'Tunde Adeleke',
      appliedClassName: 'Basic 1',
      parentName: 'Engr. Adeleke',
      parentEmail: 'adeleke@example.com',
      parentPhone: '+2348044444444',
    })

    // Email to parent
    expect(emailService.sendAdmissionConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'adeleke@example.com',
        applicationNumber: 'ADM-202601',
        applicantName: 'Tunde Adeleke',
      }),
    )

    // SMS to parent
    expect(smsService.sendAdmissionConfirmationSms).toHaveBeenCalledWith(
      '+2348044444444',
      'Engr. Adeleke',
      'Tunde Adeleke',
      'ADM-202601',
    )

    // In-app notification to admins
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'admin-1',
        type: 'ADMISSION',
      }),
    })
  })
})
