import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ClassPilot handles account, workspace, and operational data.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-primary">ClassPilot legal</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated September 8, 2026</p>
      <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
        <section><h2 className="text-lg font-semibold text-foreground">What we collect</h2><p className="mt-2">We collect account details, organization details, and the operational records your authorized team adds to ClassPilot, such as students, teachers, attendance, fees, tests, and results.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">How we use data</h2><p className="mt-2">We use this information to provide the workspace, authenticate users, process subscriptions, send requested communications, prevent abuse, and improve reliability.</p></section>
        <section id="data"><h2 className="text-lg font-semibold text-foreground">Workspace data</h2><p className="mt-2">Organization data is scoped to the organization that owns it. Administrators are responsible for inviting appropriate users and following applicable education and privacy requirements.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Your choices</h2><p className="mt-2">For access, correction, export, or deletion requests, contact <a className="text-primary underline underline-offset-4" href="mailto:hello@classpilot.app">hello@classpilot.app</a>.</p></section>
      </div>
    </main>
  )
}
