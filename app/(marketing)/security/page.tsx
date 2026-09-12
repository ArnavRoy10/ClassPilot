import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security',
  description: 'Security practices for ClassPilot workspaces.',
}

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-primary">ClassPilot trust</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">Security</h1>
      <p className="mt-4 text-sm text-muted-foreground">A practical security baseline for coaching-center operations.</p>
      <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
        <section><h2 className="text-lg font-semibold text-foreground">Tenant-aware access</h2><p className="mt-2">Workspace records are associated with an organization and protected through authenticated access controls and database policies.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Server-side secrets</h2><p className="mt-2">Payment, email, and administrative database credentials are used only by server-side routes and are not intended for browser exposure.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Report a concern</h2><p className="mt-2">Please report suspected security issues privately to <a className="text-primary underline underline-offset-4" href="mailto:hello@classpilot.app">hello@classpilot.app</a>.</p></section>
      </div>
    </main>
  )
}
