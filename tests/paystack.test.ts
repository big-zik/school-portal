import crypto from 'crypto'
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  verifyPaystackWebhookSignature,
} from '@/lib/payments/paystack'

describe('Paystack Payment Gateway Integration', () => {
  describe('initializePaystackTransaction', () => {
    it('returns sandbox fallback when PAYSTACK_SECRET_KEY is unset', async () => {
      const res = await initializePaystackTransaction({
        email: 'parent@example.com',
        amount: 25000,
        reference: 'TEST_REF_123',
      })

      expect(res.success).toBe(true)
      expect(res.reference).toBe('TEST_REF_123')
      expect(res.authorizationUrl).toContain('paystack_mock=true')
    })
  })

  describe('verifyPaystackTransaction', () => {
    it('returns mock success verification when PAYSTACK_SECRET_KEY is unset', async () => {
      const res = await verifyPaystackTransaction('TEST_REF_123')
      expect(res.success).toBe(true)
      expect(res.reference).toBe('TEST_REF_123')
      expect(res.status).toBe('success')
    })
  })

  describe('verifyPaystackWebhookSignature', () => {
    it('returns true when secret key is unset (dev fallback)', () => {
      const valid = verifyPaystackWebhookSignature('{"event":"charge.success"}', 'some_signature')
      expect(valid).toBe(true)
    })
  })
})
