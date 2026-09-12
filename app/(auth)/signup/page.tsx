'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'


const coachingPlans = ['Starter', 'Growth', 'Pro'] as const
type AccountType = 'solo' | 'center'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedPlan = searchParams.get('plan')
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<AccountType>(requestedPlan === 'Solo Tutor' ? 'solo' : 'center')
  const [plan, setPlan] = useState(requestedPlan === 'Solo Tutor' || coachingPlans.includes(requestedPlan as (typeof coachingPlans)[number]) ? requestedPlan : 'Starter')

  const isSoloTutor = accountType === 'solo'

  function selectAccountType(nextType: AccountType) {
    setAccountType(nextType)
    setPlan(nextType === 'solo' ? 'Solo Tutor' : 'Starter')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const fullName = String(form.get('name') ?? '').trim()
    const centerName = String(form.get('center') ?? '').trim()
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { full_name: fullName, organization_name: centerName, plan },
      },
    })

    if (error) {
      setLoading(false)
      toast.error(error.message.toLowerCase().includes('password') ? error.message : 'Unable to create your account. Please check your details and try again.')
      return
    }

    if (data.session) {
      const { error: organizationError } = await supabase.rpc('create_organization_and_profile', {
        organization_name: centerName,
        organization_type: isSoloTutor ? 'solo_tutor' : 'coaching_center',
        organization_plan: plan,
        profile_full_name: fullName,
      })

      if (organizationError) {
        setLoading(false)
        toast.error('Your account was created, but workspace setup needs another attempt.')
        return
      }

      toast.success(`Welcome to ClassPilot — ${plan} is ready`)
      router.push('/dashboard')
      return
    }

    setLoading(false)
    toast.success('Account created. Check your email to confirm your account, then log in.')
    router.push('/login')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Create your ClassPilot account</h1>
        <p className="text-sm text-muted-foreground">Choose the setup that fits how you teach. Start with a 14-day free trial.</p>
      </div>

      <Alert>
        <Info />
        <AlertTitle>Secure account setup</AlertTitle>
        <AlertDescription>Your workspace and owner profile will be created securely after authentication.</AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel>What best describes you?</FieldLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" aria-pressed={isSoloTutor} onClick={() => selectAccountType('solo')} className={`rounded-lg border p-3 text-left transition-colors ${isSoloTutor ? 'border-primary bg-primary/8' : 'border-border hover:border-primary/50'}`}>
                <span className="block text-sm font-semibold text-foreground">Solo Tutor</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">For home tutors and individual teachers.</span>
              </button>
              <button type="button" aria-pressed={!isSoloTutor} onClick={() => selectAccountType('center')} className={`rounded-lg border p-3 text-left transition-colors ${!isSoloTutor ? 'border-primary bg-primary/8' : 'border-border hover:border-primary/50'}`}>
                <span className="block text-sm font-semibold text-foreground">Coaching Center</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">For teams managing multiple teachers and batches.</span>
              </button>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="plan">Choose your plan</FieldLabel>
            <select id="plan" value={plan ?? ''} onChange={(event) => setPlan(event.target.value)} className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]">
              {isSoloTutor ? <option value="Solo Tutor">Solo Tutor — ₹299/month</option> : coachingPlans.map((coachingPlan) => <option key={coachingPlan} value={coachingPlan}>{coachingPlan} — {coachingPlan === 'Starter' ? '₹499' : coachingPlan === 'Growth' ? '₹999' : '₹1,999'}/month</option>)}
            </select>
            <FieldDescription>{isSoloTutor ? 'Solo Tutor includes exactly 1 teacher and up to 50 students.' : 'Coaching Center plans support multiple teachers and larger student limits.'}</FieldDescription>
          </Field>
          <Field><FieldLabel htmlFor="center">Center or tutoring name</FieldLabel><Input id="center" name="center" placeholder={isSoloTutor ? 'Ananya Tutoring' : 'Bright Future Academy'} required /></Field>
          <Field><FieldLabel htmlFor="name">Your name</FieldLabel><Input id="name" name="name" placeholder="Ananya Sharma" autoComplete="name" required /></Field>
          <Field><FieldLabel htmlFor="email">Work email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@yourcenter.com" required /></Field>
          <Field><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} required /><FieldDescription>Use 8 or more characters with a mix of letters and numbers.</FieldDescription></Field>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account…' : `Create ${plan} account`}</Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link></p>
    </div>
  )
}

export default function SignupPage() {
  return <Suspense fallback={null}><SignupForm /></Suspense>
}
