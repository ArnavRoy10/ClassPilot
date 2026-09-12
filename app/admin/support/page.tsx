import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireFounderAdmin, writeFounderAudit } from '@/lib/founder-admin'
import { getAdminClient } from '@/lib/supabase/admin'

export default async function AdminSupportPage() {
  const founder = await requireFounderAdmin()
  if (!founder) redirect('/login')
  const admin = getAdminClient()
  const { data: tickets } = await admin.from('support_tickets').select('id,organization_id,subject,type,priority,status,created_at,updated_at,organizations(name)').order('updated_at', { ascending: false }).limit(100)
  await writeFounderAudit({ adminUserId: founder.id, adminEmail: founder.email, action: 'support_queue_viewed', targetType: 'support_ticket', metadata: { result_count: tickets?.length ?? 0 } })
  const openCount = (tickets ?? []).filter((ticket) => !['resolved', 'closed'].includes(ticket.status)).length
  const urgentCount = (tickets ?? []).filter((ticket) => ticket.priority === 'urgent').length
  return <main className="flex flex-col gap-6"><header><p className="text-sm font-medium text-primary">Founder operations</p><h1 className="text-3xl font-semibold tracking-tight">Support queue</h1><p className="mt-1 text-muted-foreground">Review customer conversations and identify issues that need a fast response.</p></header><section className="grid gap-4 sm:grid-cols-3"><Metric label="Open tickets" value={openCount} /><Metric label="Urgent" value={urgentCount} /><Metric label="Total shown" value={tickets?.length ?? 0} /></section><Card><CardHeader><CardTitle>Recent tickets</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-3">Subject</th><th className="px-3 py-3">Organization</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Priority</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Updated</th></tr></thead><tbody>{(tickets ?? []).map((ticket) => <tr key={ticket.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{ticket.subject}</td><td className="px-3 py-3 text-muted-foreground">{Array.isArray(ticket.organizations) ? (ticket.organizations[0] as { name?: string } | undefined)?.name : (ticket.organizations as { name?: string } | null)?.name ?? '—'}</td><td className="px-3 py-3 capitalize">{ticket.type.replaceAll('_', ' ')}</td><td className="px-3 py-3 capitalize">{ticket.priority}</td><td className="px-3 py-3 capitalize">{ticket.status.replaceAll('_', ' ')}</td><td className="px-3 py-3 text-muted-foreground">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(ticket.updated_at))}</td></tr>)}</tbody></table></div></CardContent></Card></main>
}
function Metric({ label, value }: { label: string; value: number }) { return <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></CardContent></Card> }
