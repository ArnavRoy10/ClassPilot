import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { verifyRazorpaySignature } from '@/lib/razorpay'

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('x-razorpay-signature')
  if (!signature || !verifyRazorpaySignature(payload, signature)) return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })

  let event: {
    id?: string
    event?: string
    payload?: {
      subscription?: { entity?: { id?: string; notes?: { organization_id?: string; plan?: string }; status?: string; current_start?: number; current_end?: number } }
      payment_link?: { entity?: { id?: string; notes?: { student_fee_id?: string; organization_id?: string }; amount_paid?: number } }
      payment?: { entity?: { id?: string; notes?: { student_fee_id?: string; organization_id?: string }; amount?: number } }
    }
  }
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 })
  }
  const eventId = event.id
  if (!eventId || !event.event) return NextResponse.json({ error: 'Invalid webhook event.' }, { status: 400 })
  const adminClient = getAdminClient()
  const { error: claimError } = await adminClient.from('billing_webhook_events').insert({ stripe_event_id: `razorpay:${eventId}`, event_type: event.event })
  if (claimError) {
    if (claimError.code === '23505') return NextResponse.json({ received: true, duplicate: true })
    return NextResponse.json({ error: 'Unable to record webhook event.' }, { status: 500 })
  }

  const entity = event.payload?.subscription?.entity
  const organizationId = entity?.notes?.organization_id
  if (organizationId && entity?.id) {
    await adminClient.from('subscriptions').upsert({ organization_id: organizationId, stripe_subscription_id: `razorpay:${entity.id}`, plan: entity.notes?.plan ?? 'free', status: entity.status === 'active' ? 'active' : entity.status === 'cancelled' ? 'canceled' : 'incomplete', current_period_start: entity.current_start ? new Date(entity.current_start * 1000).toISOString() : null, current_period_end: entity.current_end ? new Date(entity.current_end * 1000).toISOString() : null, updated_at: new Date().toISOString() }, { onConflict: 'organization_id' })
  }

  // Payment Links: a parent finished paying via a fee payment link
  if (event.event === 'payment_link.paid') {
    const linkEntity = event.payload?.payment_link?.entity
    const studentFeeId = linkEntity?.notes?.student_fee_id
    if (studentFeeId) {
      await adminClient.from('student_fees').update({ status: 'paid' }).eq('id', studentFeeId)
      await adminClient.from('payments').insert({ student_fee_id: studentFeeId, amount: (linkEntity?.amount_paid ?? 0) / 100, method: 'razorpay_payment_link' })
    }
  }

  // QR codes: a parent scanned and paid a fee QR code (arrives as a captured payment)
  if (event.event === 'payment.captured') {
    const paymentEntity = event.payload?.payment?.entity
    const studentFeeId = paymentEntity?.notes?.student_fee_id
    if (studentFeeId) {
      await adminClient.from('student_fees').update({ status: 'paid' }).eq('id', studentFeeId)
      await adminClient.from('payments').insert({ student_fee_id: studentFeeId, amount: (paymentEntity?.amount ?? 0) / 100, method: 'razorpay_qr_code' })
    }
  }

  return NextResponse.json({ received: true })
}
