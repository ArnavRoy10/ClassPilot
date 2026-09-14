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

type CreatePaymentLinkInput = {
  amount: number
  studentFeeId: string
  organizationId: string
  description: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export async function createFeePaymentLink(input: CreatePaymentLinkInput) {
  if (!razorpay) throw new Error('Razorpay is not configured.')
  return razorpay.paymentLink.create({
    amount: Math.round(input.amount * 100),
    currency: 'INR',
    description: input.description,
    customer: {
      name: input.customerName ?? '',
      email: input.customerEmail ?? '',
      contact: input.customerPhone ?? '',
    },
    notify: { sms: Boolean(input.customerPhone), email: Boolean(input.customerEmail) },
    reminder_enable: true,
    notes: { student_fee_id: input.studentFeeId, organization_id: input.organizationId },
    callback_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/fees`,
    callback_method: 'get',
  })
}

type CreateQrCodeInput = {
  amount: number
  studentFeeId: string
  organizationId: string
  description: string
}

export async function createFeeQrCode(input: CreateQrCodeInput) {
  if (!razorpay) throw new Error('Razorpay is not configured.')
  return razorpay.qrCode.create({
    type: 'upi_qr',
    name: input.description.slice(0, 40),
    usage: 'single_use',
    fixed_amount: true,
    payment_amount: Math.round(input.amount * 100),
    notes: { student_fee_id: input.studentFeeId, organization_id: input.organizationId },
  })
}
