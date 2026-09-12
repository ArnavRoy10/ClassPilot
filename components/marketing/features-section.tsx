import {
  Users,
  CalendarCheck,
  Wallet,
  ClipboardList,
  BarChart3,
  Megaphone,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Users,
    title: 'Student & teacher records',
    description:
      'A single source of truth for every enrollment, guardian contact, and faculty assignment across your batches.',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance in seconds',
    description:
      'Mark batch attendance from any device and spot low-attendance students before it becomes a problem.',
  },
  {
    icon: Wallet,
    title: 'Fees & invoicing',
    description:
      'Generate invoices, track partial payments, and see outstanding dues at a glance — no more chasing spreadsheets.',
  },
  {
    icon: ClipboardList,
    title: 'Tests & assessments',
    description:
      'Schedule weekly tests and mock exams, then capture marks against each batch and subject.',
  },
  {
    icon: BarChart3,
    title: 'Results & rankings',
    description:
      'Publish scores, rank students, and track progress over time so parents always know where things stand.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    description:
      'Send targeted notices to specific batches or all parents, and pin the ones that matter most.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Everything in one place
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          One workspace for the work that keeps classes moving
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
          Replace scattered registers, WhatsApp threads, and disconnected spreadsheets with a shared operating rhythm your whole team can trust.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border-border/70 transition-shadow hover:shadow-md">
            <CardHeader>
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </span>
              <CardTitle className="mt-4 font-display text-lg">{feature.title}</CardTitle>
              <CardDescription className="leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
