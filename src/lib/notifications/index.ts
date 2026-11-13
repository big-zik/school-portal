/**
 * Notification Service Coordinator - src/lib/notifications/index.ts
 *
 * Coordinates multi-channel notifications:
 * 1. In-App Notifications (Persisted via Prisma Notification model)
 * 2. SendGrid / SMTP Emails
 * 3. Twilio SMS Alerts
 */

import prisma from '@/lib/db'
import { NotificationType } from '@prisma/client'
import {
  sendAttendanceAlert,
  sendPaymentReceiptEmail,
  sendAdmissionConfirmationEmail,
} from '@/lib/email'
import {
  sendAttendanceSmsAlert,
  sendPaymentReceiptSms,
  sendAdmissionConfirmationSms,
} from '@/lib/sms'

export interface CreateInAppNotificationParams {
  userId: string
  title: string
  body: string
  type: NotificationType
  link?: string
}

/**
 * Creates an in-app database notification for a given user.
 */
export async function createInAppNotification(params: CreateInAppNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        body: params.body,
        type: params.type,
        link: params.link ?? null,
      },
    })
  } catch (error) {
    console.error('[Notification] Failed to create in-app notification:', error)
    return null
  }
}

/**
 * Dispatches attendance absence alerts across all channels:
 * - In-app notification to Parent and Student
 * - SendGrid email to Parent
 * - Twilio SMS to Parent
 */
export async function notifyAttendanceAbsence(params: {
  studentId: string
  date: Date
  className?: string
  remarks?: string
}) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.studentId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        currentClass: { select: { name: true } },
        studentGuardians: {
          include: {
            guardian: {
              include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
              },
            },
          },
        },
      },
    })

    if (!student) return

    const studentName = student.user.name
    const className = params.className || student.currentClass?.name || 'Class'
    const dateStr = params.date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    // 1. In-App Notification to Student
    await createInAppNotification({
      userId: student.userId,
      title: 'Absence Recorded',
      body: `You were marked ABSENT for ${className} on ${dateStr}.`,
      type: NotificationType.ATTENDANCE,
      link: '/student/attendance',
    })

    // 2. Notify each primary guardian/parent
    for (const sg of student.studentGuardians) {
      const parentUser = sg.guardian.user
      if (!parentUser) continue

      // In-app notification to parent
      await createInAppNotification({
        userId: parentUser.id,
        title: `Absence Notice: ${studentName}`,
        body: `${studentName} was marked ABSENT for ${className} on ${dateStr}.${params.remarks ? ` Reason: ${params.remarks}` : ''}`,
        type: NotificationType.ATTENDANCE,
        link: '/parent/attendance',
      })

      // SendGrid Email to parent
      if (parentUser.email) {
        try {
          await sendAttendanceAlert(
            parentUser.email,
            parentUser.name || 'Parent / Guardian',
            studentName,
            dateStr,
            'absent',
            className,
          )
        } catch (err) {
          console.warn('[Notification] Failed sending parent attendance email:', err)
        }
      }

      // Twilio SMS to parent
      if (parentUser.phone) {
        try {
          await sendAttendanceSmsAlert(
            parentUser.phone,
            parentUser.name || 'Parent',
            studentName,
            'absent',
            dateStr,
          )
        } catch (err) {
          console.warn('[Notification] Failed sending parent attendance SMS:', err)
        }
      }
    }
  } catch (err) {
    console.error('[Notification] Error in notifyAttendanceAbsence:', err)
  }
}

/**
 * Dispatches payment receipt notifications across all channels:
 * - In-app notification to Payer and Student
 * - SendGrid email with official itemized receipt
 * - Twilio SMS alert with receipt reference and remaining balance
 */
export async function notifyPaymentReceipt(params: {
  receiptNumber: string
  amount: number
  paymentMethod: string
  paymentDate: Date
  invoiceTitle?: string
  balanceRemaining?: number
  studentId: string
  paidById?: string
}) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.studentId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        studentGuardians: {
          include: {
            guardian: {
              include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
              },
            },
          },
        },
      },
    })

    let payerUser = null
    if (params.paidById) {
      payerUser = await prisma.user.findUnique({
        where: { id: params.paidById },
        select: { id: true, name: true, email: true, phone: true },
      })
    }

    const studentName = student?.user.name || 'Student'
    const payerName = payerUser?.name || 'Parent / Guardian'
    const formattedAmount = `₦${params.amount.toLocaleString()}`
    const dateStr = params.paymentDate.toLocaleString('en-GB')

    // 1. In-App Notification to Payer
    if (payerUser) {
      await createInAppNotification({
        userId: payerUser.id,
        title: `Payment Receipt: ${params.receiptNumber}`,
        body: `Payment of ${formattedAmount} received for ${studentName}. Receipt #${params.receiptNumber}.`,
        type: NotificationType.PAYMENT,
        link: '/parent/fees',
      })
    }

    // 2. In-App Notification to Student
    if (student) {
      await createInAppNotification({
        userId: student.userId,
        title: `Fee Payment Credited: ${formattedAmount}`,
        body: `Receipt #${params.receiptNumber} generated for ${params.invoiceTitle || 'School Fees'}.`,
        type: NotificationType.PAYMENT,
        link: '/student/fees',
      })
    }

    // 3. Email to Payer or Parent
    const targetEmail = payerUser?.email || student?.studentGuardians?.[0]?.guardian?.user?.email
    if (targetEmail) {
      try {
        await sendPaymentReceiptEmail({
          to: targetEmail,
          payerName,
          studentName,
          receiptNumber: params.receiptNumber,
          amount: params.amount,
          paymentMethod: params.paymentMethod,
          paymentDate: dateStr,
          invoiceTitle: params.invoiceTitle,
          balanceRemaining: params.balanceRemaining,
        })
      } catch (err) {
        console.warn('[Notification] Failed sending payment receipt email:', err)
      }
    }

    // 4. SMS to Payer or Parent
    const targetPhone = payerUser?.phone || student?.studentGuardians?.[0]?.guardian?.user?.phone
    if (targetPhone) {
      try {
        await sendPaymentReceiptSms(
          targetPhone,
          payerName,
          studentName,
          params.amount,
          params.receiptNumber,
          params.balanceRemaining || 0,
        )
      } catch (err) {
        console.warn('[Notification] Failed sending payment receipt SMS:', err)
      }
    }
  } catch (err) {
    console.error('[Notification] Error in notifyPaymentReceipt:', err)
  }
}

/**
 * Dispatches admission submission notifications across all channels:
 * - SendGrid email to Parent with application reference and next steps
 * - Twilio SMS to Parent
 * - In-app notification to all school Admins and Registrars
 */
export async function notifyAdmissionSubmission(params: {
  applicationId: string
  applicationNumber: string
  applicantName: string
  appliedClassName: string
  parentName: string
  parentEmail: string
  parentPhone: string
}) {
  try {
    const appliedDateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    // 1. SendGrid Email to Parent
    try {
      await sendAdmissionConfirmationEmail({
        to: params.parentEmail,
        parentName: params.parentName,
        applicantName: params.applicantName,
        applicationNumber: params.applicationNumber,
        className: params.appliedClassName,
        appliedDate: appliedDateStr,
      })
    } catch (err) {
      console.warn('[Notification] Failed sending admission confirmation email:', err)
    }

    // 2. Twilio SMS to Parent
    if (params.parentPhone) {
      try {
        await sendAdmissionConfirmationSms(
          params.parentPhone,
          params.parentName,
          params.applicantName,
          params.applicationNumber,
        )
      } catch (err) {
        console.warn('[Notification] Failed sending admission confirmation SMS:', err)
      }
    }

    // 3. In-App Notification to Admins / Admissions Officers
    const admins = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: { in: ['ADMIN', 'SUPER_ADMIN'] },
            },
          },
        },
      },
      select: { id: true },
    })

    for (const admin of admins) {
      await createInAppNotification({
        userId: admin.id,
        title: `New Admission: ${params.applicantName}`,
        body: `${params.applicantName} submitted an application for ${params.appliedClassName} (Ref: ${params.applicationNumber}).`,
        type: NotificationType.ADMISSION,
        link: '/admin/admissions',
      })
    }
  } catch (err) {
    console.error('[Notification] Error in notifyAdmissionSubmission:', err)
  }
}
