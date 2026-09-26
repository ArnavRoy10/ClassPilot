'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const plans = [
  { id: 'solo', name: 'Solo Tutor', price: '₹299', limits: '50 students · 5 teachers' },
  { id: 'starter', name: 'Starter', price: '₹499', limits: '150 students · 15 teachers' },
  { id: 'growth', name: 'Growth', price: '₹999', limits: '500 students · 40 teachers' },
  { id: 'pro', name: 'Pro', price: '₹1,999', limits: 'Unlimited students · 100 teachers' },
] as const

type Props = {
  organization: { id: string; name: string; plan: string; max_students: number; max_teachers: number }
  subscription: { plan: string; status: string; stripe_subscription_id: string | null; cancel_at_period_end: boolean; current_period_end: string | null; trial_end: string | null } | null
  usage: { student_count: number; teacher_count: number } | null
}

function daysUntil(dateString: string | null): number | null {
  if (!dateString) return null
  const target = new Date(dateString).getTime()
  const now = Date.now()
  const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return days >= 0 ? days : 0
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function BillingPanel({ organization, subscription, usage }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const activePlan = subscription?.plan ?? organization.plan
  const status = subscription?.status ?? 'trialing'
  const trialDaysLeft = status === 'trialing' ? daysUntil(subscription?.trial_end ?? null) : null
  const subscriptionDaysLeft = status === 'active' ? daysUntil(subscription?.current_period_end ?? null) : null

  async function startCheckout(plan: string) {
    setBusy(plan)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) throw new Error('Unable to load Razorpay checkout. Check your connection and try again.')

      const response = await fetch('/api/billing/razorpay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ plan }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to start checkout.')

      const razorpayCheckout = new window.Razorpay({
        key: result.keyId,
        subscription_id: result.subscriptionId,
        name: 'ClassPilot',
        description: `${result.plan} plan`,
        theme: { color: '#5b8cff' },
        handler: () => {
          toast.success('Payment received — activating your plan…')
          setTimeout(() => window.location.reload(), 1500)
        },
        modal: {
          ondismiss: () => setBusy(null),
        },
      })
      razorpayCheckout.open()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start checkout')
      setBusy(null)
    }
  }

  async function cancelSubscription() {
    setBusy('cancel')
    try {
      const response = await fetch('/api/billing/cancel', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      toast.success('Your subscription will cancel at the end of the current period.')
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to cancel subscription')
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {trialDaysLeft !== null && (
        <div className={`rounded-lg border p-4 text-sm ${trialDaysLeft <= 3 ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-primary/30 bg-primary/5'}`}>
          {trialDaysLeft === 0 ? 'Your free trial ends today.' : `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in your free trial.`}
          {trialDaysLeft <= 3 && ' Choose a plan below to keep access.'}
        </div>
      )}
      {subscriptionDaysLeft !== null && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          {subscription?.cancel_at_period_end
            ? `Your subscription ends in ${subscriptionDaysLeft} day${subscriptionDaysLeft === 1 ? '' : 's'} and will not renew.`
            : `${subscriptionDaysLeft} day${subscriptionDaysLeft === 1 ? '' : 's'} left until your next payment.`}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>{organization.name} · {status.replaceAll('_', ' ')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-2xl font-semibold capitalize">{activePlan} plan</p><p className="text-sm text-muted-foreground">{usage?.student_count ?? 0}/{organization.max_students} students · {usage?.teacher_count ?? 0}/{organization.max_teachers} teachers</p></div>
          {subscription?.stripe_subscription_id && !subscription.cancel_at_period_end && <Button variant="outline" onClick={cancelSubscription} disabled={busy !== null}>{busy === 'cancel' && <Loader2 className="animate-spin" />}Cancel at period end</Button>}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const current = activePlan === plan.id
          return <Card key={plan.id} className={current ? 'ring-2 ring-primary' : ''}><CardHeader><CardTitle>{plan.name}</CardTitle><CardDescription>{plan.limits}</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><p className="text-2xl font-semibold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p><ul className="flex flex-col gap-2 text-sm text-muted-foreground"><li className="flex gap-2"><Check className="size-4 text-primary" />Unlimited attendance</li><li className="flex gap-2"><Check className="size-4 text-primary" />Reports and notifications</li></ul><Button className="w-full" variant={current ? 'secondary' : 'default'} disabled={current || busy !== null} onClick={() => startCheckout(plan.id)}>{busy === plan.id && <Loader2 className="animate-spin" />}{current ? 'Current plan' : 'Choose plan'}</Button></CardContent></Card>
        })}
      </div>
    </div>
  )
}
