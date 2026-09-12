import { redirect } from 'next/navigation'
import { ArrowLeft, Building2, CheckCircle2, CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireFounderAdmin, writeFounderAudit } from '@/lib/founder-admin'
import { getAdminClient } from '@/lib/supabase/admin'

type HealthStatus = 'New' | 'Active' | 'At risk' | 'Inactive'
const activationEvents = ['teacher_created', 'batch_created', 'student_created', 'attendance_recorded']

function healthStatus(createdAt: string, lastEventAt?: string): HealthStatus {
  const age = (Date.now() - new Date(createdAt).getTime()) / 86400000
  if (age <= 14) return 'New'
  if (!lastEventAt) return 'Inactive'
  const days = (Date.now() - new Date(lastEventAt).getTime()) / 86400000
  return days <= 7 ? 'Active' : days <= 21 ? 'At risk' : 'Inactive'
}

export default async function CustomerHealthPage() {
  const founder = await requireFounderAdmin()
  if (!founder) redirect('/login')
  const admin = getAdminClient()
  const [{ data: organizations }, { data: events }, { data: subscriptions }] = await Promise.all([
    admin.from('organizations').select('id,name,type,plan,created_at').order('created_at', { ascending: false }).limit(500),
    admin.from('product_events').select('organization_id,event_name,occurred_at').order('occurred_at', { ascending: false }).limit(10000),
    admin.from('subscriptions').select('organization_id,status,plan,trial_end,current_period_end').limit(500),
  ])
  await writeFounderAudit({ adminUserId: founder.id, adminEmail: founder.email, action: 'view_customer_health', metadata: { organizationCount: organizations?.length ?? 0 } })
  const rows = (organizations ?? []).map((organization) => {
    const orgEvents = (events ?? []).filter((event) => event.organization_id === organization.id)
    const completed = new Set(orgEvents.filter((event) => activationEvents.includes(event.event_name)).map((event) => event.event_name)).size
    const lastEventAt = orgEvents[0]?.occurred_at
    return { organization, eventCount: orgEvents.length, completed, activation: Math.round((completed / activationEvents.length) * 100), lastEventAt, status: healthStatus(organization.created_at, lastEventAt), subscription: (subscriptions ?? []).find((item) => item.organization_id === organization.id) }
  })
  const counts = rows.reduce<Record<HealthStatus, number>>((result, row) => { result[row.status] += 1; return result }, { New: 0, Active: 0, 'At risk': 0, Inactive: 0 })
  const activated = rows.filter((row) => row.activation === 100).length

  return <main className="mx-auto w-full max-w-6xl space-y-6">
    <header className="flex flex-col gap-3 border-b border-border pb-5"><Link href="/founder" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Founder console</Link><p className="text-sm font-medium text-primary">Customer health</p><h1 className="text-3xl font-semibold tracking-tight">Who needs attention?</h1><p className="max-w-2xl text-sm leading-6 text-muted-foreground">Activation is defined as teacher, batch, student, and attendance milestones. Health combines activation progress with recent product activity.</p></header>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Metric label="New" value={counts.New} /><Metric label="Active" value={counts.Active} /><Metric label="At risk" value={counts['At risk']} /><Metric label="Inactive" value={counts.Inactive} /><Metric label="Activated" value={activated} /></section>
    <Card><CardHeader><CardTitle>Organizations</CardTitle></CardHeader><CardContent className="space-y-3">{rows.length === 0 ? <p className="text-sm text-muted-foreground">No organizations yet.</p> : rows.map((row) => <div key={row.organization.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"><div className="flex items-center gap-3"><span className="rounded-md bg-primary/10 p-2 text-primary"><Building2 className="size-4" /></span><div><p className="font-medium">{row.organization.name}</p><p className="text-xs text-muted-foreground">{row.organization.type} · {row.eventCount} tracked event{row.eventCount === 1 ? '' : 's'}</p></div></div><div className="min-w-44"><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Activation</span><span className="font-medium">{row.activation}%</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${row.activation}%` }} /></div></div><div className="text-right"><p className="flex items-center justify-end gap-1 text-sm font-medium">{row.activation === 100 ? <CheckCircle2 className="size-4 text-success" /> : <CircleAlert className="size-4 text-warning" />}{row.status}</p><p className="text-xs text-muted-foreground">{row.subscription?.status ?? 'No subscription'} · {row.subscription?.plan ?? row.organization.plan}</p></div></div>)}</CardContent></Card>
  </main>
}

function Metric({ label, value }: { label: string; value: number }) { return <Card><CardContent className="p-5"><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></CardContent></Card> }
