import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, ArrowRight, Building2, CreditCard, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireFounderAdmin, writeFounderAudit } from '@/lib/founder-admin'
import { getAdminClient } from '@/lib/supabase/admin'

export default async function FounderAdminPage() {
  const founder = await requireFounderAdmin()
  if (!founder) redirect('/login')

  let admin: ReturnType<typeof getAdminClient>
  try {
    admin = getAdminClient()
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[founder] getAdminClient failed:', message)
    return <main className="mx-auto w-full max-w-2xl py-16 text-center"><h1 className="text-xl font-semibold">Founder console can&apos;t reach Supabase</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p></main>
  }

  const [{ data: organizations }, { data: subscriptions }, { data: profiles }, { data: auditLogs }, { data: productEvents }] = await Promise.all([
    admin.from('organizations').select('id,name,type,plan,created_at').order('created_at', { ascending: false }).limit(200),
    admin.from('subscriptions').select('organization_id,plan,status,current_period_end,trial_end').order('created_at', { ascending: false }).limit(200),
    admin.from('profiles').select('id,organization_id,full_name,email,role').limit(500),
    admin.from('founder_admin_audit_logs').select('id,action,target_type,target_id,admin_email,created_at,metadata').order('created_at', { ascending: false }).limit(20),
    admin.from('product_events').select('organization_id,event_name,event_key,occurred_at,metadata').order('occurred_at', { ascending: false }).limit(1000),
  ])

  await writeFounderAudit({
    adminUserId: founder.id,
    adminEmail: founder.email,
    action: 'view_dashboard',
    metadata: { organizationCount: organizations?.length ?? 0 },
  })

  const activeSubscriptions = subscriptions?.filter((subscription) => ['active', 'trialing'].includes(subscription.status)).length ?? 0
  const recentOrganizations = organizations ?? []

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-2 border-b border-border pb-5">
        <p className="text-sm font-medium text-primary">Founder console</p>
        <h1 className="text-3xl font-semibold tracking-tight">ClassPilot operations</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Read-only visibility into organizations, subscriptions, users, and recent admin activity. Customer data remains scoped to the organization in the product.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Founder metrics">
        <MetricCard icon={<Building2 className="size-4" />} label="Organizations" value={organizations?.length ?? 0} />
        <MetricCard icon={<Users className="size-4" />} label="Profiles" value={profiles?.length ?? 0} />
        <MetricCard icon={<CreditCard className="size-4" />} label="Active plans" value={activeSubscriptions} />
        <MetricCard icon={<Activity className="size-4" />} label="Tracked events" value={productEvents?.length ?? 0} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div><p className="font-medium">Customer health and activation</p><p className="text-sm text-muted-foreground">See who is new, active, at risk, or inactive using product activity.</p></div>
          <Link href="/founder/customer-health" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">Open health view <ArrowRight className="size-4" /></Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
          <div><p className="font-medium">Sales pipeline</p><p className="text-sm text-muted-foreground">Track prospects, demos, trials, and next steps.</p></div>
          <Link href="/admin/leads" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">Open leads <ArrowRight className="size-4" /></Link>
          <Link href="/founder/audit-log" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">Full audit log <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Recent organizations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentOrganizations.length === 0 ? <p className="text-sm text-muted-foreground">No organizations yet.</p> : recentOrganizations.map((organization) => {
              const memberCount = profiles?.filter((profile) => profile.organization_id === organization.id).length ?? 0
              const subscription = subscriptions?.find((item) => item.organization_id === organization.id)
              return <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3" key={organization.id}>
                <div><p className="font-medium">{organization.name}</p><p className="text-xs text-muted-foreground">{organization.type} · {memberCount} profile{memberCount === 1 ? '' : 's'}</p></div>
                <div className="text-right"><p className="text-sm font-medium">{subscription?.plan ?? organization.plan}</p><p className="text-xs text-muted-foreground">{subscription?.status ?? 'no subscription'}</p></div>
              </div>
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Admin activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(auditLogs ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No admin events yet.</p> : auditLogs?.map((log) => <div className="border-b border-border pb-3 last:border-0 last:pb-0" key={log.id}><p className="text-sm font-medium">{log.action.replaceAll('_', ' ')}</p><p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()} · {log.admin_email}</p></div>)}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <Card><CardContent className="flex items-center gap-3 p-5"><span className="rounded-md bg-primary/10 p-2 text-primary">{icon}</span><div><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></CardContent></Card>
}
