import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#how-it-works' },
      { label: 'Careers', href: 'mailto:hello@classpilot.app?subject=Careers' },
      { label: 'Contact', href: 'mailto:hello@classpilot.app' },
      { label: 'Marketing kit', href: '/marketing-kit' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
      { label: 'Data policy', href: '/privacy#data' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A focused workspace for coaching centers to manage people, classes, attendance, fees, and results in one place.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ClassPilot. All rights reserved.</p>
          <p>Built for coaching centers everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
