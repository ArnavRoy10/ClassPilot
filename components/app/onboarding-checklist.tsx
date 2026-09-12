'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Clock3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type ActivationStep = {
  id: string
  label: string
  description: string
  href: string
  complete: boolean
}

type OnboardingChecklistProps = {
  organizationName: string
  steps: ActivationStep[]
  daysSinceCreated: number
}

export function OnboardingChecklist({ organizationName, steps, daysSinceCreated }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false)
  const completed = steps.filter((step) => step.complete).length
  const progress = Math.round((completed / steps.length) * 100)
  const nextStep = useMemo(() => steps.find((step) => !step.complete), [steps])

  if (dismissed || completed === steps.length) return null

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">Your first week at {organizationName}</CardTitle>
          <CardDescription>{nextStep ? `Next up: ${nextStep.label}. Complete the essentials to reach your first useful outcome.` : 'You are almost ready.'}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm font-semibold text-primary">{progress}%</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Dismiss activation checklist" onClick={() => setDismissed(true)}><X className="size-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-primary/10" aria-label={`${progress}% complete`}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => <Button key={step.id} variant="outline" className={cn('h-auto items-start justify-between gap-3 px-3 py-3 text-left', step.complete && 'border-success/30 bg-success/5')} render={<Link href={step.href} />}>
            <span className="space-y-1"><span className={cn('block text-sm', step.complete && 'text-muted-foreground line-through')}>{step.label}</span><span className="block text-xs font-normal text-muted-foreground">{step.description}</span></span>
            {step.complete ? <Check className="mt-0.5 size-4 shrink-0 text-success" /> : <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />}
          </Button>)}
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-3.5" />Workspace age: {daysSinceCreated} day{daysSinceCreated === 1 ? '' : 's'}. We will keep this guidance contextual.</p>
      </CardContent>
    </Card>
  )
}

export function OnboardingDismissButton({ onDismiss }: { onDismiss: () => void }) {
  return <Button type="button" variant="ghost" size="icon" aria-label="Dismiss activation checklist" onClick={onDismiss}><X className="size-4" /></Button>
}
