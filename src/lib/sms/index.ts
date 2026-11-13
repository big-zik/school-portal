/**
 * SMS Service - src/lib/sms/index.ts
 *
 * Provides a unified interface for sending SMS messages via Twilio.
 * Gracefully degrades when Twilio credentials are absent (logs a warning,
 * returns a failure result without throwing).
 */

import twilio from "twilio";

// ---------------------------------------------------------------------------
// Configuration & Twilio client initialisation
// ---------------------------------------------------------------------------

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "";
const SCHOOL_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "School Portal";

/** Returns true only when all three Twilio credential env vars are set. */
function hasCredentials(): boolean {
  return (
    ACCOUNT_SID.length > 0 && AUTH_TOKEN.length > 0 && FROM_NUMBER.length > 0
  );
}

/** Lazily created Twilio REST client (singleton). */
let _client: ReturnType<typeof twilio> | null = null;

function getClient(): ReturnType<typeof twilio> | null {
  if (!hasCredentials()) {
    console.warn(
      "[sms] Twilio credentials are not configured. " +
        "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER " +
        "to enable SMS delivery."
    );
    return null;
  }

  if (!_client) {
    _client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface SmsResult {
  success: boolean;
  sid?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

/**
 * Send a raw SMS message to the given phone number.
 *
 * @param to       E.164 formatted phone number (e.g. "+2348012345678").
 * @param message  Plain-text message body (max ~160 chars for single segment).
 * @returns        Result object with success flag and Twilio message SID on success.
 */
export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const client = getClient();

  if (!client) {
    return {
      success: false,
      error: "Twilio credentials not configured. SMS was not sent.",
    };
  }

  if (!to || !to.startsWith("+")) {
    return {
      success: false,
      error: `Invalid phone number format: "${to}". Must be in E.164 format (e.g. +2348012345678).`,
    };
  }

  try {
    const msg = await client.messages.create({
      from: FROM_NUMBER,
      to,
      body: message,
    });

    return { success: true, sid: msg.sid };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[sms] Failed to send SMS:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ---------------------------------------------------------------------------
// Attendance SMS Alert
// ---------------------------------------------------------------------------

/**
 * Notify a parent / guardian about their child's attendance status.
 *
 * @param phone        Parent's E.164 phone number.
 * @param parentName   Parent / guardian's first name.
 * @param studentName  Student's full name.
 * @param status       Attendance status (e.g. "absent", "late", "present").
 * @param date         Human-readable date string (e.g. "Monday, 10 Nov 2026").
 * @param schoolName   School name override (defaults to NEXT_PUBLIC_APP_NAME env var).
 */
export async function sendAttendanceSmsAlert(
  phone: string,
  parentName: string,
  studentName: string,
  status: string,
  date: string,
  schoolName: string = SCHOOL_NAME
): Promise<SmsResult> {
  const statusLower = status.toLowerCase();

  let body: string;
  if (statusLower === "absent") {
    body =
      `Hi ${parentName}, this is ${schoolName}. ` +
      `${studentName} was marked ABSENT on ${date}. ` +
      `Please contact the school office if this is unexpected. ` +
      `Reply STOP to opt out.`;
  } else if (statusLower === "late") {
    body =
      `Hi ${parentName}, this is ${schoolName}. ` +
      `${studentName} arrived LATE on ${date}. ` +
      `Please ensure timely departure from home. ` +
      `Reply STOP to opt out.`;
  } else {
    body =
      `Hi ${parentName}, this is ${schoolName}. ` +
      `${studentName} was marked PRESENT on ${date}. ` +
      `Reply STOP to opt out.`;
  }

  return sendSms(phone, body);
}

// ---------------------------------------------------------------------------
// OTP SMS
// ---------------------------------------------------------------------------

/**
 * Send a one-time password (OTP) to a phone number.
 *
 * @param phone    E.164 phone number.
 * @param otp      The OTP code string.
 * @param purpose  Short description of purpose (e.g. "login", "password reset").
 */
export async function sendOtpSms(
  phone: string,
  otp: string,
  purpose: string
): Promise<SmsResult> {
  const body =
    `Your ${SCHOOL_NAME} ${purpose} verification code is: ${otp}. ` +
    `It expires in 10 minutes. Do not share this code with anyone.`;

  return sendSms(phone, body);
}

// ---------------------------------------------------------------------------
// Fee Reminder SMS
// ---------------------------------------------------------------------------

/**
 * Remind a parent about an outstanding school fee payment via SMS.
 *
 * @param phone        Parent's E.164 phone number.
 * @param parentName   Parent / guardian's first name.
 * @param studentName  Student's full name.
 * @param amount       Formatted amount string (e.g. "NGN 50,000" or "$200.00").
 * @param dueDate      Human-readable due date string.
 */
export async function sendFeeReminderSms(
  phone: string,
  parentName: string,
  studentName: string,
  amount: string,
  dueDate: string
): Promise<SmsResult> {
  const body =
    `Hi ${parentName}, ${SCHOOL_NAME} reminds you that a fee of ${amount} ` +
    `for ${studentName} is due by ${dueDate}. ` +
    `Please log in to the portal to make payment and avoid disruptions. ` +
    `Reply STOP to opt out.`;

  return sendSms(phone, body);
}

// ---------------------------------------------------------------------------
// Event Reminder SMS
// ---------------------------------------------------------------------------

/**
 * Send an event reminder to a parent, student, or staff member.
 *
 * @param phone       Recipient's E.164 phone number.
 * @param name        Recipient's first name.
 * @param eventTitle  Title / name of the event.
 * @param eventDate   Human-readable date and time of the event.
 */
export async function sendEventReminderSms(
  phone: string,
  name: string,
  eventTitle: string,
  eventDate: string
): Promise<SmsResult> {
  const body =
    `Hi ${name}, this is a reminder from ${SCHOOL_NAME}. ` +
    `"${eventTitle}" is scheduled for ${eventDate}. ` +
    `Please plan accordingly. Reply STOP to opt out.`;

  return sendSms(phone, body);
}

// ---------------------------------------------------------------------------
// Payment Receipt SMS
// ---------------------------------------------------------------------------

export async function sendPaymentReceiptSms(
  phone: string,
  parentName: string,
  studentName: string,
  amount: number,
  receiptNumber: string,
  balanceRemaining: number = 0
): Promise<SmsResult> {
  const formattedAmount = `NGN ${amount.toLocaleString()}`;
  const formattedBalance = `NGN ${balanceRemaining.toLocaleString()}`;
  const body =
    `Dear ${parentName}, payment of ${formattedAmount} for ${studentName} was confirmed. ` +
    `Receipt: ${receiptNumber}. Bal: ${formattedBalance}. - ${SCHOOL_NAME}`;

  return sendSms(phone, body);
}

// ---------------------------------------------------------------------------
// Admission Application Received SMS
// ---------------------------------------------------------------------------

export async function sendAdmissionConfirmationSms(
  phone: string,
  parentName: string,
  applicantName: string,
  applicationNumber: string
): Promise<SmsResult> {
  const body =
    `Dear ${parentName}, admission application for ${applicantName} has been received (Ref: ${applicationNumber}). ` +
    `You will receive an invite for the entrance assessment shortly. - ${SCHOOL_NAME}`;

  return sendSms(phone, body);
}

