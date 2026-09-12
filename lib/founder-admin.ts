import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

function getFounderEmails() {
  return (process.env.FOUNDER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
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
  const admin = getAdminClient()
  await admin.from('founder_admin_audit_logs').insert({
    admin_user_id: input.adminUserId,
    admin_email: input.adminEmail,
    action: input.action,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    metadata: input.metadata ?? {},
  })
}
