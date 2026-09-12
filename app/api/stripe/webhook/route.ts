import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { planFromPriceId } from '@/lib/billing'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) return new NextResponse('Webhook not configured', { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  const adminClient = getAdminClient()
  const { error: claimed } = await adminClient.from('billing_webhook_events').insert({ stripe_event_id: event.id, event_type: event.type })
  if (claimed) {
    if (claimed.code === '23505') return NextResponse.json({ received: true, duplicate: true })
    return new NextResponse('Unable to record event', { status: 500 })
  }

  const subscription = event.data.object as Stripe.Subscription
  const organizationId = typeof subscription === 'object' && 'metadata' in subscription ? subscription.metadata.organization_id : undefined
  const priceId = subscription.items?.data?.[0]?.price?.id
  const plan = planFromPriceId(priceId) ?? (typeof subscription === 'object' && 'metadata' in subscription ? subscription.metadata.plan : null)

  if (event.type.startsWith('customer.subscription.') && organizationId) {
    const limits = plan === 'solo' ? { max_students: 50, max_teachers: 5 } : plan === 'starter' ? { max_students: 150, max_teachers: 15 } : plan === 'growth' ? { max_students: 500, max_teachers: 40 } : plan === 'pro' ? { max_students: 100000, max_teachers: 100 } : { max_students: 25, max_teachers: 3 }
    await adminClient.from('organizations').update({ plan: plan ?? 'free', ...limits }).eq('id', organizationId)
    await adminClient.from('subscriptions').upsert({
      organization_id: organizationId,
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan: plan ?? 'free',
      status: subscription.status,
      current_period_start: new Date(subscription.items.data[0]?.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.items.data[0]?.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id' })
  }

  return NextResponse.json({ received: true })
}
