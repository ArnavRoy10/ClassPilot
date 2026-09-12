import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Make your next class easier to run
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-pretty text-primary-foreground/85">
            Bring your people, classes, and daily follow-through into one dependable workspace. Start your free trial today, or let us walk you through it first.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" render={<Link href="/signup" />}>
              Start free trial
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              render={<Link href="/pricing" />}
            >
              View pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
