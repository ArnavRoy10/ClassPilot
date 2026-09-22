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


function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

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

    toast.success('Welcome back to ClassPilot')
    const accessToken = data.session?.access_token
    if (accessToken) {
      void fetch('/api/auth/log-session', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } })
    }
    router.push(searchParams.get('next')?.startsWith('/') ? searchParams.get('next')! : '/dashboard')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2"><h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Welcome back</h1><p className="text-sm text-muted-foreground">Log in to your center&apos;s ClassPilot dashboard.</p></div>
      <Alert><Info /><AlertTitle>Secure login</AlertTitle><AlertDescription>Use the email and password you registered with.</AlertDescription></Alert>
      <form onSubmit={handleSubmit}><FieldGroup>
        <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@yourcenter.com" required /></Field>
        <Field><div className="flex items-center justify-between"><FieldLabel htmlFor="password">Password</FieldLabel><Link href="/#" className="text-sm text-primary hover:underline">Forgot password?</Link></div><Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Your password" required /></Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</Button>
      </FieldGroup></form>
      <p className="text-center text-sm text-muted-foreground">New to ClassPilot? <Link href="/signup" className="font-medium text-primary hover:underline">Create an account</Link></p>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>
}
