'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'


type LoginRole = 'owner' | 'teacher' | 'student'
const ROLE_OPTIONS: { value: LoginRole; label: string; hint: string; matches: string[] }[] = [
  { value: 'owner', label: 'Owner', hint: 'Log in to your center\u2019s dashboard.', matches: ['owner', 'admin'] },
  { value: 'teacher', label: 'Teacher', hint: 'Use the email and password your organization set up for you.', matches: ['teacher'] },
  { value: 'student', label: 'Student', hint: 'Use the email and password your organization set up for you.', matches: ['student', 'parent'] },
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<LoginRole>('owner')
  const activeRole = ROLE_OPTIONS.find((option) => option.value === role)!

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const supabase = createClient()
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      const message = error.message.toLowerCase().includes('confirm') ? 'Please confirm your email before logging in.' : error.status === 429 ? 'Too many attempts. Please try again later.' : 'Invalid email or password.'
      toast.error(message)
      return
    }

    const userId = data.user?.id
    if (userId) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
      if (profile?.role && !activeRole.matches.includes(profile.role)) {
        toast.warning(`This looks like a ${profile.role} account — you selected "${activeRole.label}". Logging you in anyway.`)
      }
    }

    toast.success('Welcome back to ClassPilot')
    const accessToken = data.session?.access_token
    if (accessToken) {
      void fetch('/api/auth/log-session', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } })
    }
    router.push(searchParams.get('next')?.startsWith('/') ? searchParams.get('next')! : '/dashboard')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2"><h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Welcome back</h1><p className="text-sm text-muted-foreground">Log in to your ClassPilot account.</p></div>
      <div className="grid grid-cols-3 gap-2">
        {ROLE_OPTIONS.map((option) => (
          <button key={option.value} type="button" onClick={() => setRole(option.value)} className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${role === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}>{option.label}</button>
        ))}
      </div>
      <Alert><Info /><AlertTitle>{activeRole.label} login</AlertTitle><AlertDescription>{activeRole.hint}</AlertDescription></Alert>
      <form onSubmit={handleSubmit}><FieldGroup>
        <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@yourcenter.com" required /></Field>
        <Field><div className="flex items-center justify-between"><FieldLabel htmlFor="password">Password</FieldLabel><Link href="/#" className="text-sm text-primary hover:underline">Forgot password?</Link></div><Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Your password" required /></Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</Button>
      </FieldGroup></form>
      {role === 'owner' ? (
        <p className="text-center text-sm text-muted-foreground">New to ClassPilot? <Link href="/signup" className="font-medium text-primary hover:underline">Create an account</Link></p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">{activeRole.label} accounts are created by your organization&apos;s owner — ask them for your login details.</p>
      )}
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>
}
