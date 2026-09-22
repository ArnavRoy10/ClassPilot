import { NextResponse } from 'next/server'
import { getBillingContext } from '@/lib/billing'
import { BILLING_PLANS, isBillingPlan } from '@/lib/stripe'
import { getRazorpayMode, razorpay } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { plan?: string }
    if (!body.plan || !isBillingPlan(body.plan)) return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })
    
    const context = await getBillingContext()
    if (!context || context.profile.role !== 'owner') return NextResponse.json({ error: 'Only owners can manage billing.' }, { status: 403 })
    
    if (!razorpay) return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 })
    
    const mode = getRazorpayMode()
    if (mode === 'unknown') return NextResponse.json({ error: 'Razorpay key mode is invalid.' }, { status: 503 })
    
    const selected = BILLING_PLANS[body.plan]
    const planId = process.env[`RAZORPAY_PLAN_${body.plan.toUpperCase()}`]
    if (!planId) return NextResponse.json({ error: 'Razorpay plan is not configured.' }, { status: 503 })
    
    const subscription = await razorpay.subscriptions.create({ 
      plan_id: planId, 
      total_count: 12, 
      customer_notify: 1, 
      notes: { organization_id: context.organization.id, plan: body.plan } 
    })
    
    return NextResponse.json({ 
      subscriptionId: subscription.id, 
      keyId: process.env.RAZORPAY_KEY_ID, 
      plan: selected.name 
    })
  } catch {
    return NextResponse.json({ error: 'Unable to start Razorpay checkout.' }, { status: 502 })
  }
}
