import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Solo Tutor',
    price: '₹299',
    cadence: '/month',
    audience: 'Perfect for home tutors & individual teachers',
    description: 'Everything one teacher needs to run classes simply.',
    featured: false,
    features: [
      'Exactly 1 teacher',
      'Up to 50 students',
      'Student & batch management',
      'Attendance, tests & results',
      'Timetable & basic dashboard',
      'Student portal',
    ],
    cta: 'Choose Solo Tutor',
  },
  {
    name: 'Starter',
    price: '₹499',
    cadence: '/month',
    audience: 'For coaching centers',
    description: 'A focused foundation for a small coaching center.',
    featured: false,
    features: [
      'Up to 100 students',
      'Up to 5 teachers',
      'Attendance & batch management',
      'Student management',
      'Basic reports',
    ],
    cta: 'Choose Starter',
  },
  {
    name: 'Growth',
    price: '₹999',
    cadence: '/month',
    audience: 'For coaching centers',
    description: 'More capacity and insight for growing centers.',
    featured: true,
    features: [
      'Up to 500 students',
      'Up to 20 teachers',
      'Everything in Starter',
      'Fee management',
      'Tests & results',
      'Student/parent portal & reports',
    ],
    cta: 'Choose Growth',
  },
  {
    name: 'Pro',
    price: '₹1,999',
    cadence: '/month',
    audience: 'For coaching centers',
    description: 'Advanced operations for ambitious institutions.',
    featured: false,
    features: [
      'Up to 1,500 students',
      'Unlimited teachers',
      'Everything in Growth',
      'Advanced analytics & reports',
      'AI assistant',
      'Multiple branches',
    ],
    cta: 'Choose Pro',
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Pricing</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          Start with the plan that fits your classroom
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
          Start without a card, invite your team when you are ready, and switch plans as your center grows. Every plan includes the full 14-day trial. Need a walkthrough? Book a demo and we will show you the workflow.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button render={<Link href="/signup" />}>Start free trial</Button>
          <Button variant="outline" render={<a href="mailto:hello@classpilot.app?subject=ClassPilot%20demo" />}>Book a demo</Button>
        </div>
      </div>

      <div className="mt-14 grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'relative flex h-full flex-col',
              plan.featured
                ? 'border-primary shadow-lg shadow-primary/10'
                : 'border-border/70',
            )}
          >
            {plan.featured && <Badge className="absolute -top-3 left-6">Most popular</Badge>}
            <CardHeader>
              <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
              <p className="text-xs font-medium text-primary">{plan.audience}</p>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.cadence}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.featured ? 'default' : 'outline'}
                render={<Link href={`/signup?plan=${encodeURIComponent(plan.name)}`} />}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
