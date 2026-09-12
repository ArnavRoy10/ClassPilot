import { Hero } from '@/components/marketing/hero'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { PricingSection } from '@/components/marketing/pricing-section'
import { Faq } from '@/components/marketing/faq'
import type { Metadata } from 'next'
import { Cta } from '@/components/marketing/cta'

export const metadata: Metadata = {
  title: 'Coaching center software that keeps classes moving',
  description: 'ClassPilot helps tutors and coaching centers manage students, batches, attendance, fees, tests, and results in one clear workspace.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ClassPilot — Run the class. Not the chaos.',
    description: 'A dependable workspace for the people and routines behind great classes.',
    url: '/',
  },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <Faq />
      <Cta />
    </>
  )
}
