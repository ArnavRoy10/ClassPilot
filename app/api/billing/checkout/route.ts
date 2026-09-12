import { NextResponse } from 'next/server'
import { createBillingCheckout } from '@/lib/billing'
import { isBillingPlan } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { plan?: string }
    if (!body.plan || !isBillingPlan(body.plan)) return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })
    const url = await createBillingCheckout(body.plan)
    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to start checkout.' }, { status: 400 })
  }
}
