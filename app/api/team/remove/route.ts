import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!callerProfile || callerProfile.role !== 'owner' || !callerProfile.organization_id) {
    return NextResponse.json({ error: 'Only the organization owner can remove teachers or students.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || (body.type !== 'teacher' && body.type !== 'student') || !body.id) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const admin = getAdminClient()
  const directoryTable = body.type === 'teacher' ? 'teachers' : 'students'
  const linkColumn = body.type === 'teacher' ? 'teacher_id' : 'student_id'

  const { data: existingRow } = await admin
    .from(directoryTable)
    .select('id')
    .eq('id', body.id)
    .eq('organization_id', callerProfile.organization_id)
    .maybeSingle()

  if (!existingRow) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

  const { data: linkedProfile } = await admin.from('profiles').select('id').eq(linkColumn, body.id).maybeSingle()
  if (linkedProfile) {
    await admin.from('profiles').delete().eq('id', linkedProfile.id)
    await admin.auth.admin.deleteUser(linkedProfile.id)
  }

  const { error } = await admin.from(directoryTable).delete().eq('id', body.id)
  if (error) return NextResponse.json({ error: `Unable to remove ${body.type}.` }, { status: 400 })

  return NextResponse.json({ ok: true })
}
