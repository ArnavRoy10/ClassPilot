import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).maybeSingle()

  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headerList.get('x-real-ip') ?? null
  const userAgent = headerList.get('user-agent') ?? null

  const admin = getAdminClient()
  await admin.from('login_events').insert({
    user_id: user.id,
    organization_id: profile?.organization_id ?? null,
    email: user.email,
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
