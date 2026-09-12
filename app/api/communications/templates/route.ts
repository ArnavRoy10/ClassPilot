import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).maybeSingle()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
  const { data, error } = await supabase.from('message_templates').select('id,name,channel,subject,body').eq('organization_id', profile.organization_id).eq('status', 'active').order('name')
  if (error) return NextResponse.json({ error: 'Unable to load message templates.' }, { status: 500 })
  return NextResponse.json({ templates: data ?? [] })
}
