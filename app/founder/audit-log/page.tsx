import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireFounderAdmin } from '@/lib/founder-admin'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FounderAuditLogPage() {
  const founder = await requireFounderAdmin()
  if (!founder) redirect('/login')

  let admin: ReturnType<typeof getAdminClient>
  try {
    admin = getAdminClient()
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[founder/audit-log] getAdminClient failed:', message)
    return <main className="mx-auto w-full max-w-2xl py-16 text-center"><h1 className="text-xl font-semibold">Audit log can&apos;t reach Supabase</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p></main>
  }

  const [auditRes, loginRes] = await Promise.all([
    admin.from('founder_admin_audit_logs').select('id,action,target_type,target_id,admin_email,ip_address,user_agent,created_at,metadata').order('created_at', { ascending: false }).limit(300),
    admin.from('login_events').select('id,email,organization_id,ip_address,user_agent,created_at').order('created_at', { ascending: false }).limit(300),
  ])

  if (auditRes.error) {
    return <main className="mx-auto w-full max-w-2xl py-16 text-center"><h1 className="text-xl font-semibold">Couldn&apos;t load audit log</h1><p className="mt-2 text-sm text-muted-foreground">{auditRes.error.message}</p><p className="mt-1 text-xs text-muted-foreground">code: {auditRes.error.code}</p></main>
  }
  if (loginRes.error) {
    return <main className="mx-auto w-full max-w-2xl py-16 text-center"><h1 className="text-xl font-semibold">Couldn&apos;t load login events</h1><p className="mt-2 text-sm text-muted-foreground">{loginRes.error.message}</p><p className="mt-1 text-xs text-muted-foreground">code: {loginRes.error.code}</p></main>
  }

  const auditLogs = auditRes.data ?? []
  const loginEvents = loginRes.data ?? []

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-5">
        <Link href="/founder" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Founder console</Link>
        <h1 className="text-3xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">Every founder-admin action and every user login, with IP address and browser.</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Founder actions ({auditLogs.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="pb-2 pr-4">When</th><th className="pb-2 pr-4">Admin</th><th className="pb-2 pr-4">Action</th><th className="pb-2 pr-4">Target</th><th className="pb-2 pr-4">IP</th><th className="pb-2">Browser</th></tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No actions recorded yet.</td></tr>}
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-4">{log.admin_email}</td>
                  <td className="py-2 pr-4">{log.action}</td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground">{log.target_type ? `${log.target_type}:${log.target_id?.slice(0, 8) ?? ''}` : '—'}</td>
                  <td className="py-2 pr-4 text-xs">{log.ip_address ?? '—'}</td>
                  <td className="py-2 max-w-[220px] truncate text-xs text-muted-foreground" title={log.user_agent ?? ''}>{log.user_agent ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>User logins ({loginEvents.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="pb-2 pr-4">When</th><th className="pb-2 pr-4">Email</th><th className="pb-2 pr-4">Organization</th><th className="pb-2 pr-4">IP</th><th className="pb-2">Browser</th></tr>
            </thead>
            <tbody>
              {loginEvents.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No logins recorded yet.</td></tr>}
              {loginEvents.map((event) => (
                <tr key={event.id} className="border-t border-border">
                  <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-4">{event.email ?? '—'}</td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground">{event.organization_id?.slice(0, 8) ?? '—'}</td>
                  <td className="py-2 pr-4 text-xs">{event.ip_address ?? '—'}</td>
                  <td className="py-2 max-w-[220px] truncate text-xs text-muted-foreground" title={event.user_agent ?? ''}>{event.user_agent ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  )
}
