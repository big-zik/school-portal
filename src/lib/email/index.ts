/**
 * Email Service - src/lib/email/index.ts
 *
 * Unified email service supporting SendGrid and Nodemailer (SMTP).
 * Provider selection is determined by the SENDGRID_API_KEY environment variable.
 * If present and non-empty, SendGrid is used; otherwise Nodemailer falls back to SMTP.
 */

import sgMail from "@sendgrid/mail";
import nodemailer, { Transporter } from "nodemailer";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@school.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "School Portal";
const SENDGRID_KEY = process.env.SENDGRID_API_KEY ?? "";
const USE_SENDGRID = SENDGRID_KEY.length > 0;

if (USE_SENDGRID) {
  sgMail.setApiKey(SENDGRID_KEY);
}

/** Lazy-initialised Nodemailer transporter (only created when needed). */
let _nodemailerTransport: Transporter | null = null;

function getNodemailerTransport(): Transporter {
  if (!_nodemailerTransport) {
    _nodemailerTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "localhost",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }
  return _nodemailerTransport;
}

// ---------------------------------------------------------------------------
// Shared HTML wrapper / styling
// ---------------------------------------------------------------------------

const BRAND_COLOR = "#1e40af"; // Tailwind blue-800
const ACCENT_COLOR = "#f59e0b"; // Tailwind amber-400
const BG_COLOR = "#f8fafc";
const CARD_COLOR = "#ffffff";
const TEXT_DARK = "#1e293b";
const TEXT_MUTED = "#64748b";

function wrapTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${BG_COLOR};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: ${TEXT_DARK};
    }
    .wrapper {
      max-width: 600px;
      margin: 32px auto;
      background: ${CARD_COLOR};
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header {
      background: ${BRAND_COLOR};
      padding: 28px 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 6px 0 0;
      color: rgba(255,255,255,0.75);
      font-size: 13px;
    }
    .body {
      padding: 36px 32px;
    }
    .body h2 {
      margin: 0 0 12px;
      font-size: 20px;
      font-weight: 600;
      color: ${TEXT_DARK};
    }
    .body p {
      margin: 0 0 16px;
      font-size: 15px;
      line-height: 1.6;
      color: ${TEXT_DARK};
    }
    .body p.muted {
      color: ${TEXT_MUTED};
      font-size: 13px;
    }
    .info-box {
      background: ${BG_COLOR};
      border-left: 4px solid ${ACCENT_COLOR};
      border-radius: 6px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 4px 0;
      font-size: 14px;
    }
    .info-box strong {
      color: ${TEXT_DARK};
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background: ${BRAND_COLOR};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 8px 0 20px;
    }
    .btn:hover {
      background: #1e3a8a;
    }
    .divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }
    .footer {
      background: ${BG_COLOR};
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 4px 0;
      font-size: 12px;
      color: ${TEXT_MUTED};
    }
    .alert-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
    }
    .badge-absent  { background: #fee2e2; color: #991b1b; }
    .badge-present { background: #dcfce7; color: #166534; }
    .badge-late    { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${process.env.NEXT_PUBLIC_APP_NAME ?? "School Portal"}</h1>
      <p>Academic Management System</p>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>This email was sent by ${process.env.NEXT_PUBLIC_APP_NAME ?? "School Portal"}.</p>
      <p>Please do not reply directly to this email.</p>
      <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME ?? "School Portal"}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Generic email send function.
 * Routes to SendGrid or Nodemailer depending on environment configuration.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  const toArray = Array.isArray(to) ? to : [to];

  if (USE_SENDGRID) {
    await sgMail.sendMultiple({
      to: toArray,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      html,
      text: text ?? stripHtml(html),
    });
  } else {
    const transport = getNodemailerTransport();
    await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: toArray.join(", "),
      subject,
      html,
      text: text ?? stripHtml(html),
    });
  }
}

/** Minimal HTML-to-plaintext converter for auto-generating text bodies. */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Welcome Email
// ---------------------------------------------------------------------------

export interface WelcomeEmailUser {
  name: string;
  email: string;
  role: string;
  temporaryPassword?: string;
}

export async function sendWelcomeEmail(user: WelcomeEmailUser): Promise<void> {
  const roleLabel =
    user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();

  const credentialsBlock = user.temporaryPassword
    ? `<div class="info-box">
        <p><strong>Your Login Credentials</strong></p>
        <p>Email: <strong>${user.email}</strong></p>
        <p>Temporary Password: <strong>${user.temporaryPassword}</strong></p>
      </div>
      <p class="muted">Please log in and change your password immediately. This temporary password expires in 48 hours.</p>`
    : `<p>Use your registered email address to sign in. If you haven't set a password yet, use the "Forgot Password" link on the login page.</p>`;

  const html = wrapTemplate(
    "Welcome to School Portal",
    `<h2>Welcome, ${user.name}! 🎉</h2>
    <p>Your <strong>${roleLabel}</strong> account has been successfully created on <strong>${process.env.NEXT_PUBLIC_APP_NAME ?? "School Portal"}</strong>.</p>
    ${credentialsBlock}
    <a class="btn" href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login">Sign In to Your Account</a>
    <hr class="divider" />
    <p class="muted">If you have any questions or need assistance, please contact your school administrator.</p>`
  );

  await sendEmail(
    user.email,
    `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME ?? "School Portal"}!`,
    html
  );
}

// ---------------------------------------------------------------------------
// Password Reset Email
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string,
  expiresIn: string
): Promise<void> {
  const html = wrapTemplate(
    "Reset Your Password",
    `<h2>Reset Your Password</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your account. Click the button below to choose a new password.</p>
    <a class="btn" href="${resetUrl}">Reset Password</a>
    <p class="muted">This link expires in <strong>${expiresIn}</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not change.</p>
    <hr class="divider" />
    <p class="muted">If the button above doesn't work, copy and paste the following link into your browser:</p>
    <p class="muted" style="word-break:break-all;">${resetUrl}</p>`
  );

  await sendEmail(email, "Reset Your Password", html);
}

// ---------------------------------------------------------------------------
// Email Verification Email
// ---------------------------------------------------------------------------

export async function sendEmailVerificationEmail(
  email: string,
  name: string,
  verifyUrl: string
): Promise<void> {
  const html = wrapTemplate(
    "Verify Your Email Address",
    `<h2>Verify Your Email Address</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for registering. Please verify your email address to activate your account.</p>
    <a class="btn" href="${verifyUrl}">Verify Email Address</a>
    <p class="muted">This verification link expires in 24 hours. If you did not create an account, please disregard this email.</p>
    <hr class="divider" />
    <p class="muted">If the button doesn't work, copy this link into your browser:</p>
    <p class="muted" style="word-break:break-all;">${verifyUrl}</p>`
  );

  await sendEmail(email, "Verify Your Email Address", html);
}

// ---------------------------------------------------------------------------
// Attendance Alert (to parent)
// ---------------------------------------------------------------------------

export async function sendAttendanceAlert(
  parentEmail: string,
  parentName: string,
  studentName: string,
  date: string,
  status: "absent" | "late" | "present" | string,
  className: string
): Promise<void> {
  const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeClass =
    status === "absent"
      ? "badge-absent"
      : status === "late"
      ? "badge-late"
      : "badge-present";

  const message =
    status === "absent"
      ? `We are writing to inform you that your child was <strong>marked absent</strong> from school today. If this was unplanned, please contact the school office at your earliest convenience.`
      : status === "late"
      ? `We are writing to inform you that your child arrived <strong>late</strong> to school today. Please ensure they depart home with enough time to arrive punctually.`
      : `This is a confirmation that your child was <strong>marked present</strong> in school today.`;

  const html = wrapTemplate(
    "Attendance Notification",
    `<h2>Attendance Notification</h2>
    <p>Dear <strong>${parentName}</strong>,</p>
    <p>${message}</p>
    <div class="info-box">
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Class:</strong> ${className}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Status:</strong> <span class="alert-badge ${badgeClass}">${statusCapitalized}</span></p>
    </div>
    <p>You can view full attendance records by logging into the parent portal.</p>
    <a class="btn" href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/parent/attendance">View Attendance</a>
    <hr class="divider" />
    <p class="muted">If you believe this record is incorrect, please contact the class teacher or school office.</p>`
  );

  await sendEmail(
    parentEmail,
    `Attendance Alert: ${studentName} — ${statusCapitalized}`,
    html
  );
}

// ---------------------------------------------------------------------------
// Assignment Notification (to students)
// ---------------------------------------------------------------------------

export async function sendAssignmentNotification(
  emails: string[],
  assignmentTitle: string,
  dueDate: string,
  teacherName: string,
  subject: string
): Promise<void> {
  if (emails.length === 0) return;

  const html = wrapTemplate(
    "New Assignment",
    `<h2>New Assignment Posted</h2>
    <p>A new assignment has been published for your class. Please review the details below and submit before the due date.</p>
    <div class="info-box">
      <p><strong>Assignment:</strong> ${assignmentTitle}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
    </div>
    <a class="btn" href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/student/assignments">View Assignment</a>
    <hr class="divider" />
    <p class="muted">Late submissions may be penalised. Contact your teacher if you require an extension.</p>`
  );

  await sendEmail(
    emails,
    `New Assignment: ${assignmentTitle} (Due ${dueDate})`,
    html
  );
}

// ---------------------------------------------------------------------------
// Grade Published (to student and parent)
// ---------------------------------------------------------------------------

export async function sendGradePublished(
  studentEmail: string,
  parentEmail: string | null,
  studentName: string,
  subject: string,
  grade: string,
  feedback?: string
): Promise<void> {
  const feedbackBlock = feedback
    ? `<div class="info-box"><p><strong>Teacher Feedback:</strong></p><p>${feedback}</p></div>`
    : "";

  const html = wrapTemplate(
    "Grade Published",
    `<h2>Your Grade Has Been Published</h2>
    <p>Hi <strong>${studentName}</strong>,</p>
    <p>Your teacher has published a grade for a recent assessment. Please find the details below.</p>
    <div class="info-box">
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Grade:</strong> <span style="font-size:18px;font-weight:700;color:${BRAND_COLOR};">${grade}</span></p>
    </div>
    ${feedbackBlock}
    <a class="btn" href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/student/grades">View Full Grades</a>
    <hr class="divider" />
    <p class="muted">If you have questions about this grade, please speak with your subject teacher.</p>`
  );

  const recipients: string[] = [studentEmail];
  if (parentEmail) recipients.push(parentEmail);

  await sendEmail(
    recipients,
    `Grade Published: ${subject} — ${grade}`,
    html
  );
}

// ---------------------------------------------------------------------------
// Fee Reminder (to parent)
// ---------------------------------------------------------------------------

export async function sendFeeReminder(
  parentEmail: string,
  parentName: string,
  studentName: string,
  invoiceNumber: string,
  amount: string,
  dueDate: string,
  paymentUrl: string
): Promise<void> {
  const html = wrapTemplate(
    "Fee Payment Reminder",
    `<h2>Fee Payment Reminder</h2>
    <p>Dear <strong>${parentName}</strong>,</p>
    <p>This is a friendly reminder that a school fee payment is due. Kindly settle the outstanding balance before the due date to avoid any disruptions to your child's academic activities.</p>
    <div class="info-box">
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p><strong>Amount Due:</strong> <span style="font-size:16px;font-weight:700;color:#991b1b;">${amount}</span></p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
    </div>
    <a class="btn" href="${paymentUrl}">Pay Now</a>
    <hr class="divider" />
    <p class="muted">If you have already made this payment, please disregard this notice. For payment issues or enquiries, contact the bursar's office.</p>`
  );

  await sendEmail(
    parentEmail,
    `Fee Payment Reminder — Invoice ${invoiceNumber}`,
    html
  );
}

// ---------------------------------------------------------------------------
// Report Card Ready (to parent and student)
// ---------------------------------------------------------------------------

export async function sendReportCardReady(
  parentEmail: string,
  studentEmail: string,
  studentName: string,
  term: string,
  year: string
): Promise<void> {
  const html = wrapTemplate(
    "Report Card Available",
    `<h2>Report Card is Now Available</h2>
    <p>Dear Parent / Guardian of <strong>${studentName}</strong>,</p>
    <p>The <strong>${term}</strong> report card for the <strong>${year}</strong> academic year has been published and is now available for download on the portal.</p>
    <div class="info-box">
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Term:</strong> ${term}</p>
      <p><strong>Academic Year:</strong> ${year}</p>
    </div>
    <a class="btn" href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/parent/reports">View Report Card</a>
    <hr class="divider" />
    <p class="muted">If you experience difficulties accessing the report card, please contact the school office.</p>`
  );

  const recipients = [parentEmail, studentEmail].filter(Boolean);
  await sendEmail(
    recipients,
    `${studentName}'s ${term} Report Card is Ready`,
    html
  );
}
