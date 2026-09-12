import { NextResponse } from 'next/server'
import { cancelBillingSubscription } from '@/lib/billing'

export async function POST() {
  try {
    await cancelBillingSubscription()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to cancel subscription.' }, { status: 400 })
  }
}
