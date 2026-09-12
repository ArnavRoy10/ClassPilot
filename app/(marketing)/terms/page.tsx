import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern use of the ClassPilot workspace.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-primary">ClassPilot legal</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated September 8, 2026</p>
      <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
        <section><h2 className="text-lg font-semibold text-foreground">Using ClassPilot</h2><p className="mt-2">ClassPilot provides tools for managing coaching-center operations. You must provide accurate account information, protect your credentials, and use the service lawfully.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Workspace responsibility</h2><p className="mt-2">Your organization controls the records it adds, the people it invites, and the communications it sends. Do not upload information you are not authorized to process.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Trials and billing</h2><p className="mt-2">Plans, trial terms, limits, and billing details are shown on the pricing and billing pages. Subscriptions may be changed or canceled according to the applicable plan terms.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Support</h2><p className="mt-2">Questions about these terms can be sent to <a className="text-primary underline underline-offset-4" href="mailto:hello@classpilot.app">hello@classpilot.app</a>.</p></section>
      </div>
    </main>
  )
}
