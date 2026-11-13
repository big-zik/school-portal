import crypto from 'crypto'

const SECRET = 'sk_test_secret_key'

type PaystackModule = typeof import('@/lib/payments/paystack')

/** The module reads PAYSTACK_SECRET_KEY at import time, so load a fresh copy. */
function loadWithKey(key: string): PaystackModule {
  let mod!: PaystackModule
  const previous = process.env.PAYSTACK_SECRET_KEY
  process.env.PAYSTACK_SECRET_KEY = key
  jest.isolateModules(() => {
    mod = require('@/lib/payments/paystack')
  })
  if (previous === undefined) delete process.env.PAYSTACK_SECRET_KEY
  else process.env.PAYSTACK_SECRET_KEY = previous
  return mod
}

const sign = (body: string) => crypto.createHmac('sha512', SECRET).update(body).digest('hex')

describe('Paystack with a secret key configured', () => {
  const fetchMock = jest.fn()
  const realFetch = global.fetch

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
  })
  afterAll(() => {
    global.fetch = realFetch
  })

  describe('initializePaystackTransaction', () => {
    it('converts Naira to kobo and sends a bearer token', async () => {
      const { initializePaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockResolvedValue({
        json: async () => ({
          status: true,
          data: { authorization_url: 'https://pay.test/x', access_code: 'AC1', reference: 'REF1' },
        }),
      })

      const res = await initializePaystackTransaction({
        email: 'p@example.com',
        amount: 25000.5,
        reference: 'REF1',
        metadata: { invoiceId: 'inv-1' },
      })

      expect(res).toEqual({
        success: true,
        authorizationUrl: 'https://pay.test/x',
        accessCode: 'AC1',
        reference: 'REF1',
      })

      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe('https://api.paystack.co/transaction/initialize')
      expect(init.method).toBe('POST')
      expect(init.headers.Authorization).toBe(`Bearer ${SECRET}`)
      const body = JSON.parse(init.body)
      expect(body.amount).toBe(2500050)
      expect(body.metadata).toEqual({ invoiceId: 'inv-1' })
    })

    it('rounds fractional kobo to a whole number', async () => {
      const { initializePaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockResolvedValue({ json: async () => ({ status: true, data: { reference: 'R' } }) })
      await initializePaystackTransaction({ email: 'p@example.com', amount: 10.005, reference: 'R' })
      expect(Number.isInteger(JSON.parse(fetchMock.mock.calls[0][1].body).amount)).toBe(true)
    })

    it('generates a PSK_ reference when none is supplied', async () => {
      const { initializePaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockResolvedValue({ json: async () => ({ status: false, message: 'nope' }) })
      const res = await initializePaystackTransaction({ email: 'p@example.com', amount: 100 })
      expect(res.reference).toMatch(/^PSK_\d+_\d{4}$/)
    })

    it('returns the gateway message when initialisation fails', async () => {
      const { initializePaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockResolvedValue({ json: async () => ({ status: false, message: 'Invalid key' }) })
      const res = await initializePaystackTransaction({ email: 'p@example.com', amount: 100, reference: 'R' })
      expect(res).toEqual({ success: false, reference: 'R', error: 'Invalid key' })
    })

    it('returns a failure result instead of throwing on a network error', async () => {
      const { initializePaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockRejectedValue(new Error('socket hang up'))
      const res = await initializePaystackTransaction({ email: 'p@example.com', amount: 100, reference: 'R' })
      expect(res.success).toBe(false)
      expect(res.error).toBe('socket hang up')
    })
  })

  describe('verifyPaystackTransaction', () => {
    it('maps a successful transaction and converts kobo back to Naira', async () => {
      const { verifyPaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockResolvedValue({
        json: async () => ({
          status: true,
          data: {
            status: 'success',
            amount: 2500000,
            reference: 'REF1',
            channel: 'card',
            paid_at: '2026-11-13T09:00:00Z',
            metadata: { invoiceId: 'inv-1' },
          },
        }),
      })

      const res = await verifyPaystackTransaction('REF1')
      expect(res.success).toBe(true)
      expect(res.amount).toBe(25000)
      expect(res.channel).toBe('card')
      expect(res.metadata).toEqual({ invoiceId: 'inv-1' })
    })

    it('url-encodes the reference', async () => {
      const { verifyPaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockResolvedValue({ json: async () => ({ status: false }) })
      await verifyPaystackTransaction('a/b?c')
      expect(fetchMock.mock.calls[0][0]).toBe('https://api.paystack.co/transaction/verify/a%2Fb%3Fc')
    })

    it('reports success=false for an abandoned transaction', async () => {
      const { verifyPaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockResolvedValue({
        json: async () => ({ status: true, data: { status: 'abandoned', amount: 0, reference: 'R' } }),
      })
      const res = await verifyPaystackTransaction('R')
      expect(res.success).toBe(false)
      expect(res.status).toBe('abandoned')
    })

    it('returns a failure result on a network error', async () => {
      const { verifyPaystackTransaction } = loadWithKey(SECRET)
      fetchMock.mockRejectedValue(new Error('timeout'))
      const res = await verifyPaystackTransaction('R')
      expect(res).toEqual({ success: false, reference: 'R', error: 'timeout' })
    })
  })

  describe('verifyPaystackWebhookSignature', () => {
    const body = '{"event":"charge.success","data":{"reference":"R1"}}'

    it('accepts a correct HMAC-SHA512 signature', () => {
      const { verifyPaystackWebhookSignature } = loadWithKey(SECRET)
      expect(verifyPaystackWebhookSignature(body, sign(body))).toBe(true)
    })

    it('rejects a signature computed with the wrong secret', () => {
      const { verifyPaystackWebhookSignature } = loadWithKey(SECRET)
      const forged = crypto.createHmac('sha512', 'other').update(body).digest('hex')
      expect(verifyPaystackWebhookSignature(body, forged)).toBe(false)
    })

    it('rejects a valid signature when the body has been tampered with', () => {
      const { verifyPaystackWebhookSignature } = loadWithKey(SECRET)
      expect(verifyPaystackWebhookSignature(body.replace('R1', 'R2'), sign(body))).toBe(false)
    })

    it('rejects a garbage signature', () => {
      const { verifyPaystackWebhookSignature } = loadWithKey(SECRET)
      expect(verifyPaystackWebhookSignature(body, 'deadbeef')).toBe(false)
    })

    // KNOWN DEFECT: `!signatureHeader` returns true even when a secret key is set,
    // so an attacker can forge a payment confirmation by omitting the header.
    // `it.failing` passes while the bug exists and will start failing once it is
    // fixed, at which point change it to a normal `it`.
    it.failing('rejects a request with no signature header when a secret key is configured', () => {
      const { verifyPaystackWebhookSignature } = loadWithKey(SECRET)
      expect(verifyPaystackWebhookSignature(body, undefined)).toBe(false)
      expect(verifyPaystackWebhookSignature(body, null)).toBe(false)
      expect(verifyPaystackWebhookSignature(body, '')).toBe(false)
    })
  })
})
