import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ ok: false, reason: 'no token' }, { status: 401 })

  const admin = getAdminClient()
  const { data: { user }, error: userError } = await admin.auth.getUser(token)
  if (userError || !user) return NextResponse.json({ ok: false, reason: 'invalid token' }, { status: 401 })

  const { data: profile } = await admin.from('profiles').select('organization_id').eq('id', user.id).maybeSingle()

  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headerList.get('x-real-ip') ?? null
  const userAgent = headerList.get('user-agent') ?? null

  const { error: insertError } = await admin.from('login_events').insert({
    user_id: user.id,
    organization_id: profile?.organization_id ?? null,
    email: user.email,
    ip_address: ip,
    user_agent: userAgent,
  })

  if (insertError) {
    console.error('[log-session] insert failed:', insertError)
    return NextResponse.json({ ok: false, reason: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
