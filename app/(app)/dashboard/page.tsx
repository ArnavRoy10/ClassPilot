import type { Metadata } from 'next'
import { PageHeader } from '@/components/app/page-header'
import { DemoBanner } from '@/components/app/demo-banner'
import { StatCards } from '@/components/app/stat-cards'
import { FeeCollectionChart } from '@/components/app/fee-collection-chart'
import { AttendanceChart } from '@/components/app/attendance-chart'
import { TodaysClasses } from '@/components/app/todays-classes'
import { ActivityFeed } from '@/components/app/activity-feed'
import { OnboardingChecklist, type ActivationStep } from '@/components/app/onboarding-checklist'
import { ActivationFeedback } from '@/components/app/activation-feedback'
import { getUserContext } from '@/lib/supabase/user-context'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const userContext = await getUserContext()
  const supabase = await createClient()
  const organizationId = userContext?.organization.id
  const [{ count: studentCount }, { count: teacherCount }, { count: batchCount }, { data: productEvents }, { data: attendanceRows }] = organizationId
    ? await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
        supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
        supabase.from('batches').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
        supabase.from('product_events').select('event_name').eq('organization_id', organizationId),
        supabase.from('attendance').select('id').eq('organization_id', organizationId),
      ])
    : [{ count: 0 }, { count: 0 }, { count: 0 }, { data: [] }, { data: [] }]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back — here's what's happening at ${userContext?.organization.name ?? 'your organization'} today.`}
      />
      <DemoBanner />
      {userContext && <OnboardingChecklist organizationName={userContext.organization.name} daysSinceCreated={0} steps={[
        { id: 'teacher', label: 'Add your first teacher', description: 'Build your teaching team.', href: '/teachers', complete: (teacherCount ?? 0) > 0 },
        { id: 'batch', label: 'Create a batch or class', description: 'Give your workspace a rhythm.', href: '/batches', complete: (batchCount ?? 0) > 0 },
        { id: 'student', label: 'Enroll your first student', description: 'Start your student roster.', href: '/students', complete: (studentCount ?? 0) > 0 },
        { id: 'attendance', label: 'Record attendance once', description: 'See daily operations come alive.', href: '/attendance', complete: (attendanceRows as unknown[] | null)?.length ? true : (productEvents ?? []).some((event) => event.event_name === 'attendance_recorded') },
      ] as ActivationStep[]} />}
      {userContext && <ActivationFeedback />}
      <StatCards />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <FeeCollectionChart />
        <AttendanceChart />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TodaysClasses />
        <ActivityFeed />
      </div>
    </div>
  )
}
