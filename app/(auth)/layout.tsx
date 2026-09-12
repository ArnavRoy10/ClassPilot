import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, Wallet, BarChart3 } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

export const metadata: Metadata = {
  title: { default: 'Account access', template: '%s | ClassPilot' },
  robots: { index: false, follow: false },
}

const points = [
  { icon: GraduationCap, text: 'Manage students, teachers and batches with ease.' },
  { icon: Wallet, text: 'Track fees and dues without the spreadsheets.' },
  { icon: BarChart3, text: 'See attendance and results at a glance.' },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <Link href="/" aria-label="ClassPilot home">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]"
        />
        <div className="relative flex flex-col justify-center gap-8 p-12">
          <blockquote className="font-display text-2xl font-semibold leading-snug text-balance">
            “ClassPilot replaced four different registers and a messy
            spreadsheet. Our front desk finally has one place for everything.”
          </blockquote>
          <div className="text-sm text-primary-foreground/80">
            Ananya Sharma · Director, Bright Future Academy
          </div>
          <ul className="mt-4 flex flex-col gap-4 border-t border-primary-foreground/20 pt-8">
            {points.map((point) => (
              <li key={point.text} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <point.icon className="size-4.5" />
                </span>
                <span className="text-sm text-primary-foreground/90">{point.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
