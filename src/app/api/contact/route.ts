import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { sendEmail } from '@/lib/email'
import { TicketPriority, TicketStatus } from '@prisma/client'
import type { ApiResponse } from '@/types'

// POST /api/contact — submit public inquiry form and send notification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, topic, message } = body

    if (!name || !email || !message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Full name, email address, and message are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const session = await auth()
    let userId = session?.user?.id

    if (!userId) {
      const adminUser = await prisma.user.findFirst({
        where: {
          roles: {
            some: {
              role: {
                name: { in: ['SUPER_ADMIN', 'ADMIN'] },
              },
            },
          },
        },
        select: { id: true },
      })

      if (adminUser) {
        userId = adminUser.id
      } else {
        const anyUser = await prisma.user.findFirst({ select: { id: true } })
        userId = anyUser?.id
      }
    }

    if (userId) {
      await prisma.supportTicket.create({
        data: {
          userId,
          subject: `[Public Inquiry: ${topic || 'General'}] from ${name}`,
          description: `Applicant/Parent: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nTopic: ${topic || 'Admissions'}\n\nMessage:\n${message}`,
          status: TicketStatus.OPEN,
          priority: TicketPriority.MEDIUM,
        },
      })
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'info@chosengenerationschool.edu'
    const schoolName = process.env.NEXT_PUBLIC_APP_NAME || 'CHOSEN GENERATION SCHOOL'

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #1e3a8a; padding: 15px; border-radius: 6px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">New Portal Website Inquiry</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">${schoolName}</p>
        </div>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject / Department:</strong> ${topic || 'General Inquiry'}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p><strong>Message:</strong></p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; font-size: 13px; line-height: 1.6; border: 1px solid #e2e8f0;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `
    const adminText = `New Website Inquiry\nFrom: ${name} (${email}, ${phone})\nTopic: ${topic}\n\nMessage:\n${message}`

    try {
      await sendEmail(adminEmail, `[Website Inquiry] ${topic || 'General'} - ${name}`, adminHtml, adminText)
    } catch (mailError) {
      console.warn('Could not dispatch admin notification email:', mailError)
    }

    const ackHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #1e3a8a; padding: 15px; border-radius: 6px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">Inquiry Received</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">${schoolName}</p>
        </div>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to <strong>${schoolName}</strong> regarding <em>${topic || 'your inquiry'}</em>.</p>
        <p>Our administrative desk has received your message and an officer will review and respond within 24 business hours.</p>
        <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; font-size: 12px; margin: 15px 0; border: 1px solid #e2e8f0;">
          <strong>Your Submitted Message:</strong><br/>
          ${message.replace(/\n/g, '<br/>')}
        </div>
        <p style="font-size: 12px; color: #64748b;">
          Warm regards,<br/>
          <strong>Admissions & Communications Office</strong><br/>
          ${schoolName}
        </p>
      </div>
    `
    const ackText = `Dear ${name},\n\nThank you for reaching out to ${schoolName}. We have received your message regarding ${topic} and will get back to you within 24 business hours.\n\nWarm regards,\n${schoolName}`

    try {
      await sendEmail(email, `Thank you for contacting ${schoolName}`, ackHtml, ackText)
    } catch (ackError) {
      console.warn('Could not dispatch acknowledgment email:', ackError)
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Your inquiry has been submitted successfully and routed to admissions.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/contact error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
