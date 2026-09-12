import type { Metadata } from 'next'
import { PricingSection } from '@/components/marketing/pricing-section'
import { Faq } from '@/components/marketing/faq'
import { Cta } from '@/components/marketing/cta'

export const metadata: Metadata = {
  title: 'Simple pricing for tutors and coaching centers',
  description:
    'Choose a ClassPilot plan for solo tutoring, growing coaching centers, or multi-branch operations. Start with a 14-day free trial.',
  alternates: { canonical: '/pricing' },
}

export default function PricingPage() {
  return (
    <>
      <div className="border-b border-border bg-gradient-to-b from-primary/8 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">
            Simple pricing for the way you teach
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
            Start free, choose the workspace that fits your classroom, and move up only when your center is ready.
          </p>
        </div>
      </div>
      <PricingSection />
      <Faq />
      <Cta />
    </>
  )
}
