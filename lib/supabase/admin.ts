// lib/supabase/admin.ts
import 'server-only'

import { createClient } from '@supabase/supabase-js'

export function getAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      `Supabase server configuration is missing: ${!url ? 'SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`.trim()
    )
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
