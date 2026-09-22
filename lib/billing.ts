import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { BILLING_PLANS, isBillingPlan, getStripe, type BillingPlan } from '@/lib/stripe'

export async function getBillingContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role, organizations(id, name, plan, max_students, max_teachers)')
    .eq('id', user.id)
    .maybeSingle()
  const organization = Array.isArray(profile?.organizations) ? profile.organizations[0] : profile?.organizations
  if (!profile || !organization) return null

  const [{ data: subscription }, { data: usage }] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('organization_id', organization.id).maybeSingle(),
    supabase.rpc('billing_usage', { target_org_id: organization.id }).maybeSingle(),
  ])

  return { supabase, user, profile, organization, subscription, usage }
}

export async function createBillingCheckout(plan: BillingPlan) {
  const context = await getBillingContext()
  if (!context || context.profile.role !== 'owner') throw new Error('Only organization owners can manage billing.')
  const stripe = getStripe()
  const selected = BILLING_PLANS[plan]
  if (!selected.priceId) throw new Error('This plan is not configured yet.')

  let customerId = context.subscription?.stripe_customer_id ?? undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: context.user.email,
      name: context.organization.name,
      metadata: { organization_id: context.organization.id },
    })
    customerId = customer.id
    await context.supabase.from('subscriptions').upsert({ organization_id: context.organization.id, stripe_customer_id: customerId, plan: 'free', status: 'trialing' }, { onConflict: 'organization_id' })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: selected.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/settings/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/settings/billing?checkout=cancelled`,
    metadata: { organization_id: context.organization.id, plan },
    subscription_data: { metadata: { organization_id: context.organization.id, plan } },
    integration_identifier: `classpilot_${Math.random().toString(36).slice(2, 10)}`,
  })
  return session.url
}

export async function cancelBillingSubscription() {
  const context = await getBillingContext()
  if (!context || context.profile.role !== 'owner') throw new Error('Only organization owners can manage billing.')
  const subscriptionId = context.subscription?.stripe_subscription_id
  if (!subscriptionId) throw new Error('No active subscription found.')

  if (subscriptionId.startsWith('razorpay:')) {
    const { razorpay } = await import('@/lib/razorpay')
    if (!razorpay) throw new Error('Razorpay is not configured.')
    const id = subscriptionId.replace('razorpay:', '')
    await razorpay.subscriptions.cancel(id, { cancel_at_cycle_end: 1 })
    await context.supabase.from('subscriptions').update({ cancel_at_period_end: true }).eq('organization_id', context.organization.id)
    return
  }

  const stripe = getStripe()
  await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
}

export function planFromPriceId(priceId: string | null | undefined) {
  if (!priceId) return null
  return (Object.keys(BILLING_PLANS) as BillingPlan[]).find((key) => BILLING_PLANS[key].priceId === priceId) ?? null
}
