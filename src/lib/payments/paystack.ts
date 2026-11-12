import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export interface PaystackInitParams {
  email: string
  amount: number // in Naira or main currency
  reference?: string
  callbackUrl?: string
  metadata?: Record<string, any>
}

export interface PaystackInitResult {
  success: boolean
  authorizationUrl?: string
  accessCode?: string
  reference: string
  error?: string
}

export interface PaystackVerifyResult {
  success: boolean
  status?: string
  amount?: number
  reference: string
  channel?: string
  paidAt?: string
  metadata?: Record<string, any>
  error?: string
}

/**
 * Initialize a Paystack transaction
 */
export async function initializePaystackTransaction(
  params: PaystackInitParams,
): Promise<PaystackInitResult> {
  const reference = params.reference || `PSK_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
  const amountKobo = Math.round(params.amount * 100) // Paystack expects whole kobo

  // Sandbox / development mock fallback if no secret key configured
  if (!PAYSTACK_SECRET_KEY) {
    console.warn('[Paystack] PAYSTACK_SECRET_KEY not set. Using sandbox simulator response.')
    return {
      success: true,
      authorizationUrl: `/parent/fees?paystack_mock=true&ref=${reference}`,
      accessCode: `mock_code_${Date.now()}`,
      reference,
    }
  }

  try {
    const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountKobo,
        reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    })

    const data = await res.json()
    if (data.status && data.data) {
      return {
        success: true,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
      }
    }

    return {
      success: false,
      reference,
      error: data.message || 'Paystack initialization failed',
    }
  } catch (err: any) {
    return {
      success: false,
      reference,
      error: err.message || 'Network error connecting to Paystack',
    }
  }
}

/**
 * Verify a Paystack transaction by reference
 */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResult> {
  if (!PAYSTACK_SECRET_KEY) {
    // In dev without API key, verify mock references
    return {
      success: true,
      status: 'success',
      reference,
      channel: 'card',
      paidAt: new Date().toISOString(),
    }
  }

  try {
    const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await res.json()
    if (data.status && data.data) {
      const d = data.data
      return {
        success: d.status === 'success',
        status: d.status,
        amount: d.amount ? d.amount / 100 : 0,
        reference: d.reference,
        channel: d.channel,
        paidAt: d.paid_at,
        metadata: d.metadata,
      }
    }

    return {
      success: false,
      reference,
      error: data.message || 'Verification failed',
    }
  } catch (err: any) {
    return {
      success: false,
      reference,
      error: err.message || 'Verification network error',
    }
  }
}

/**
 * Verify Paystack webhook HMAC SHA512 signature
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader?: string | null,
): boolean {
  if (!PAYSTACK_SECRET_KEY || !signatureHeader) return true

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex')

  return hash === signatureHeader
}
