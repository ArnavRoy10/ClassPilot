import { redirect } from 'next/navigation'
import { getUserContext } from '@/lib/supabase/user-context'
import { PortalShell } from '@/components/portal/portal-shell'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const context = await getUserContext()
  if (!context) redirect('/login')
  if (!['student', 'parent'].includes(context.role)) redirect('/dashboard')
  return <PortalShell name={context.fullName} role={context.role}>{children}</PortalShell>
}
