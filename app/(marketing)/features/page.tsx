import type { Metadata } from 'next'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Cta } from '@/components/marketing/cta'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Students, teachers, batches, attendance, fees, tests, results, timetable and announcements — every module your coaching center needs.',
}

export default function FeaturesPage() {
  return (
    <>
      <div className="border-b border-border bg-gradient-to-b from-primary/8 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">
            Every module your center needs
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
            ClassPilot replaces the tangle of registers and spreadsheets with
            focused, connected tools your whole team can share.
          </p>
        </div>
      </div>
      <FeaturesSection />
      <HowItWorks />
      <Cta />
    </>
  )
}
