import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const highlights = ['No setup fees', '14-day free trial', 'Cancel anytime']

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-primary/8 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full px-3 py-1">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Built for coaching centers &amp; tuition classes
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl">
            Run the class. Not the chaos.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
            ClassPilot gives tutors and coaching centers one clear workspace for students, batches, attendance, fees, and results — so every day starts with less chasing and more teaching.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/signup" />}>
              Start free trial
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" render={<a href="mailto:hello@classpilot.app?subject=ClassPilot%20demo" />}>
              Book a demo
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10 ring-1 ring-black/5">
            <Image
              src="/hero-dashboard.png"
              alt="ClassPilot dashboard showing student, attendance and fee metrics"
              width={1600}
              height={1000}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
