import 'server-only'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

function getFounderEmails() {
  return (process.env.FOUNDER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

async function getRequestContext() {
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headerList.get('x-real-ip') ?? null
  const userAgent = headerList.get('user-agent') ?? null
  return { ip, userAgent }
}

export async function requireFounderAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email?.toLowerCase()
  if (!user || !email || !getFounderEmails().includes(email)) return null
  return { id: user.id, email }
}

export async function writeFounderAudit(input: {
  adminUserId: string
  adminEmail: string
  action: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}) {
  const { ip, userAgent } = await getRequestContext()
  const admin = getAdminClient()
  await admin.from('founder_admin_audit_logs').insert({
    admin_user_id: input.adminUserId,
    admin_email: input.adminEmail,
    action: input.action,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    metadata: input.metadata ?? {},
    ip_address: ip,
    user_agent: userAgent,
  })
}
