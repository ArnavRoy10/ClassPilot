import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/app/page-header'
import { BillingPanel } from '@/components/app/billing-panel'
import { getBillingContext } from '@/lib/billing'

export const metadata: Metadata = { title: 'Billing' }

export default async function BillingPage() {
  const context = await getBillingContext()
  if (!context) redirect('/login')
  if (context.profile.role !== 'owner') redirect('/settings')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Billing & plan" description="Manage your ClassPilot subscription and workspace limits." />
      <BillingPanel
        organization={context.organization}
        subscription={context.subscription}
        usage={context.usage as { student_count: number; teacher_count: number } | null}
      />
    </div>
  )
}
