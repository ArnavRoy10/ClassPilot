import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock3, Mail, MapPin, Plus, Search, Trash2 } from 'lucide-react'
import { requireFounderAdmin } from '@/lib/founder-admin'
import { getAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createLead, updateLead, addActivity, deleteLead } from './actions'

const statuses = ['new', 'contacted', 'qualified', 'demo_booked', 'trial', 'won', 'lost'] as const
const sources = ['website', 'referral', 'outbound', 'event', 'other'] as const
const organizationTypes = ['Solo Tutor', 'Coaching Center', 'Institute'] as const
const activityTypes = ['General Activity', 'Contacted', 'Reply Received', 'Demo Scheduled', 'Trial Started', 'Converted to Paid', 'Marked Lost'] as const

type Lead = { id: string; full_name: string; email: string; phone: string | null; organization_name: string | null; organization_type: string; city: string | null; source: string; status: string; notes: string | null; next_step: string | null; next_step_at: string | null; created_at: string; updated_at: string }
type Activity = { id: string; activity_type: string; description: string; created_at: string }

function label(value: string) { return value.replaceAll('_', ' ') }

export default async function FounderLeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; lead?: string }> }) {
  const founder = await requireFounderAdmin(); if (!founder) redirect('/login'); const params = await searchParams; const query = (params.q ?? '').trim().toLowerCase(); const statusFilter = params.status ?? 'all'

  let admin: ReturnType<typeof getAdminClient>
  try {
    admin = getAdminClient()
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[admin/leads] getAdminClient failed:', message)
    return <main className="mx-auto w-full max-w-2xl py-16 text-center"><h1 className="text-xl font-semibold">Leads page can&apos;t reach Supabase</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p></main>
  }

  const [leadsRes, orgsRes] = await Promise.all([
    admin.from('sales_leads').select('id,full_name,email,phone,organization_name,organization_type,city,source,status,notes,next_step,next_step_at,created_at,updated_at').order('updated_at', { ascending: false }).limit(500),
    admin.from('organizations').select('id,name').order('name').limit(500),
  ])

  if (leadsRes.error) {
    console.error('[admin/leads] sales_leads query failed:', leadsRes.error)
    return <main className="mx-auto w-full max-w-2xl py-16 text-center"><h1 className="text-xl font-semibold">Couldn&apos;t load leads</h1><p className="mt-2 text-sm text-muted-foreground">{leadsRes.error.message}</p><p className="mt-1 text-xs text-muted-foreground">code: {leadsRes.error.code}</p></main>
  }
  if (orgsRes.error) {
    console.error('[admin/leads] organizations query failed:', orgsRes.error)
    return <main className="mx-auto w-full max-w-2xl py-16 text-center"><h1 className="text-xl font-semibold">Couldn&apos;t load organizations</h1><p className="mt-2 text-sm text-muted-foreground">{orgsRes.error.message}</p><p className="mt-1 text-xs text-muted-foreground">code: {orgsRes.error.code}</p></main>
  }

  const data = leadsRes.data
  const organizations = orgsRes.data
  const leads = ((data ?? []) as Lead[]).filter((lead) => (!query || [lead.full_name, lead.email, lead.organization_name ?? '', lead.city ?? ''].join(' ').toLowerCase().includes(query)) && (statusFilter === 'all' || lead.status === statusFilter)); const selected = (data ?? []).find((lead) => lead.id === params.lead) as Lead | undefined
  let activities: Activity[] = []
  if (selected) {
    const actRes = await admin.from('sales_lead_activities').select('id,activity_type,description,created_at').eq('lead_id', selected.id).order('created_at', { ascending: false })
    if (actRes.error) {
      console.error('[admin/leads] sales_lead_activities query failed:', actRes.error)
      return <main className="mx-auto w-full max-w-2xl py-16 text-center"><h1 className="text-xl font-semibold">Couldn&apos;t load activity</h1><p className="mt-2 text-sm text-muted-foreground">{actRes.error.message}</p><p className="mt-1 text-xs text-muted-foreground">code: {actRes.error.code}</p></main>
    }
    activities = (actRes.data ?? []) as Activity[]
  }
  const totals = (data ?? []).reduce<Record<string, number>>((acc, lead) => { acc[lead.status] = (acc[lead.status] ?? 0) + 1; return acc }, {})
  return <main className="mx-auto w-full max-w-7xl space-y-6"><header className="flex flex-col gap-3 border-b border-border pb-5"><Link href="/founder" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Founder console</Link><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">Sales workspace</p><h1 className="text-3xl font-semibold tracking-tight">Leads</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Keep every conversation, next step, and trial handoff in one founder-only view.</p></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><BriefcaseBusiness className="size-4 text-primary" />{data?.length ?? 0} total leads</div></div></header>
    <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">{statuses.map((status) => <Card key={status}><CardContent className="p-4"><p className="text-xl font-semibold">{totals[status] ?? 0}</p><p className="text-xs capitalize text-muted-foreground">{label(status)}</p></CardContent></Card>)}</section>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="size-4 text-primary" />Add lead</CardTitle></CardHeader><CardContent><form action={createLead} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Field name="full_name" label="Full name" required /><Field name="email" label="Email" type="email" required /><Field name="phone" label="Phone" /><Field name="organization_name" label="Organization" /><Field name="city" label="City" /><SelectField name="organization_type" label="Type" options={organizationTypes} /><SelectField name="source" label="Source" options={sources} /><SelectField name="status" label="Status" options={statuses} /><Field name="next_step" label="Next step" /><Field name="next_step_at" label="Next step date" type="date" /><div className="md:col-span-2"><Label htmlFor="linked_organization_id">Linked customer</Label><select id="linked_organization_id" name="linked_organization_id" className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Not linked</option>{(organizations ?? []).map((org) => <option value={org.id} key={org.id}>{org.name}</option>)}</select></div><div className="md:col-span-2 lg:col-span-4"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" className="mt-2 min-h-20" maxLength={5000} /></div><div className="lg:col-span-4"><Button type="submit">Create lead</Button></div></form></CardContent></Card>
    <Card><CardHeader><form className="flex flex-col gap-3 sm:flex-row sm:items-end" method="get"><div className="flex-1"><Label htmlFor="q">Search leads</Label><div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="q" name="q" defaultValue={query} placeholder="Name, email, organization, or city" className="pl-9" /></div></div><div><Label htmlFor="status">Status</Label><select id="status" name="status" defaultValue={statusFilter} className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></div><Button type="submit" variant="outline">Filter</Button></form></CardHeader><CardContent className="flex flex-col gap-3">{leads.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No leads match this view.</p> : leads.map((lead) => <div key={lead.id} className="grid gap-4 rounded-xl border border-border p-4 lg:grid-cols-[1.2fr_1fr_0.9fr_1.3fr_auto] lg:items-start"><div><Link href={`/admin/leads?lead=${lead.id}`} className="font-medium hover:text-primary hover:underline">{lead.full_name}</Link><p className="flex items-center gap-1 text-sm text-muted-foreground"><Mail className="size-3" />{lead.email}</p>{lead.city && <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{lead.city}</p>}</div><div><p className="text-sm">{lead.organization_name || 'Independent tutor'}</p><p className="text-xs text-muted-foreground">{lead.organization_type} · {lead.source}</p></div><div><p className="inline-flex items-center gap-1 text-sm capitalize"><CheckCircle2 className="size-3.5 text-primary" />{label(lead.status)}</p><p className="text-xs text-muted-foreground">{new Date(lead.updated_at).toLocaleDateString()}</p></div><form action={updateLead} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1"><input type="hidden" name="id" value={lead.id} /><select name="status" defaultValue={lead.status} className="flex h-9 rounded-md border border-input bg-background px-2 text-sm">{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select><Input name="next_step" defaultValue={lead.next_step ?? ''} placeholder="Next step" maxLength={500} /><Input name="next_step_at" type="date" defaultValue={lead.next_step_at?.slice(0, 10) ?? ''} /><Textarea name="notes" defaultValue={lead.notes ?? ''} placeholder="Notes" maxLength={5000} className="min-h-16" /><Button size="sm" type="submit">Save</Button></form><form action={deleteLead} className="lg:justify-self-end"><input type="hidden" name="id" value={lead.id} /><Button type="submit" size="icon" variant="ghost" aria-label={`Delete ${lead.full_name}`}><Trash2 className="size-4 text-destructive" /></Button></form></div>)}</CardContent></Card>
    {selected && <Card><CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-3"><span>{selected.full_name} activity</span><Link href="/admin/leads" className="text-sm font-normal text-muted-foreground hover:text-foreground">Close</Link></CardTitle></CardHeader><CardContent className="grid gap-6 lg:grid-cols-[1fr_1.4fr]"><form action={addActivity} className="flex flex-col gap-3"><input type="hidden" name="lead_id" value={selected.id} /><div><Label htmlFor="activity_type">Activity type</Label><select id="activity_type" name="activity_type" className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{activityTypes.map((type) => <option key={type}>{type}</option>)}</select></div><div><Label htmlFor="description">What happened?</Label><Textarea id="description" name="description" required maxLength={5000} className="mt-2 min-h-28" placeholder="Add a concise note about the conversation or next step." /></div><Button type="submit">Add activity</Button></form><div className="flex flex-col gap-3">{activities.length === 0 ? <p className="text-sm text-muted-foreground">No activity recorded yet.</p> : activities.map((activity) => <div key={activity.id} className="flex gap-3 rounded-lg border border-border p-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-medium">{activity.activity_type}</p><p className="text-sm text-muted-foreground">{activity.description}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p></div></div>)}</div></CardContent></Card>}
  </main>
}
function Field({ name, label, type = 'text', required = false }: { name: string; label: string; type?: string; required?: boolean }) { return <div><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} required={required} maxLength={name === 'email' ? 320 : 160} className="mt-2" /></div> }
function SelectField({ name, label, options }: { name: string; label: string; options: readonly string[] }) { return <div><Label htmlFor={name}>{label}</Label><select id={name} name={name} defaultValue={options[0]} className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{options.map((option) => <option key={option} value={option}>{label === 'Status' ? option.replaceAll('_', ' ') : option}</option>)}</select></div> }
