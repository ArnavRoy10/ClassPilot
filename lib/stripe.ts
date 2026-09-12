import 'server-only'

import Stripe from 'stripe'

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Stripe is not configured.')
  return new Stripe(key, { apiVersion: '2026-08-26.dahlia' })
}

export const BILLING_PLANS = {
  solo: { name: 'Solo Tutor', priceId: process.env.STRIPE_PRICE_SOLO ?? '', monthly: 299 },
  starter: { name: 'Starter', priceId: process.env.STRIPE_PRICE_STARTER ?? '', monthly: 499 },
  growth: { name: 'Growth', priceId: process.env.STRIPE_PRICE_GROWTH ?? '', monthly: 999 },
  pro: { name: 'Pro', priceId: process.env.STRIPE_PRICE_PRO ?? '', monthly: 1999 },
} as const

export type BillingPlan = keyof typeof BILLING_PLANS

export function isBillingPlan(value: string): value is BillingPlan {
  return value in BILLING_PLANS
}
