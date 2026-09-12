import 'server-only'

import Razorpay from 'razorpay'
import crypto from 'node:crypto'

export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null

export function getRazorpayMode() {
  const keyId = process.env.RAZORPAY_KEY_ID ?? ''
  if (keyId.startsWith('rzp_live_')) return 'live' as const
  if (keyId.startsWith('rzp_test_')) return 'test' as const
  return 'unknown' as const
}

export function verifyRazorpaySignature(payload: string, signature: string, secret = process.env.RAZORPAY_WEBHOOK_SECRET) {
  if (!secret || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
}

export function isRazorpayConfigured() {
  return Boolean(razorpay && process.env.RAZORPAY_WEBHOOK_SECRET)
}
