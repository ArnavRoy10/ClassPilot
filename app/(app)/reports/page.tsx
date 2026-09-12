import { PageHeader } from '@/components/app/page-header'
import { ReportsDashboard } from '@/components/app/reports-dashboard'
import { getUserContext } from '@/lib/supabase/user-context'

export default async function ReportsPage() {
  const context = await getUserContext()
  if (!context) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Review organization-wide academic, attendance, batch, and financial performance." />
      <ReportsDashboard organizationId={context.organization.id} role={context.role} />
    </div>
  )
}
