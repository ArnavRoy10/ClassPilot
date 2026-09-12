import type { Metadata } from 'next'
import { PageHeader } from '@/components/app/page-header'
import { DemoBanner } from '@/components/app/demo-banner'
import { ProfileSettings } from '@/components/app/profile-settings'
import Link from 'next/link'
import { getUserContext } from '@/lib/supabase/user-context'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const userContext = await getUserContext()

  if (!userContext) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Settings" description="Your profile is not available yet." />
        <DemoBanner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your profile and workspace details." />
      <ProfileSettings userContext={userContext} />
      {userContext.role === 'owner' && <Link href="/settings/billing" className="inline-flex w-fit items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Manage billing</Link>}
    </div>
  )
}
