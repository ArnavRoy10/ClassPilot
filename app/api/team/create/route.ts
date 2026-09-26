import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { STUDENT_POWERS, TEACHER_POWERS, normalizePermissions } from '@/lib/permissions'

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
    return NextResponse.json({ error: 'Only the organization owner can add teachers or students.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || (body.type !== 'teacher' && body.type !== 'student')) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const fullName = String(body.full_name ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const permissions = normalizePermissions(body.type === 'teacher' ? TEACHER_POWERS : STUDENT_POWERS, body.permissions)
  const createLogin = Boolean(email && password)

  if (fullName.length < 2) return NextResponse.json({ error: 'Enter a valid name.' }, { status: 400 })
  if (createLogin && !email.includes('@')) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 })
  if (createLogin && password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })

  const admin = getAdminClient()
  const organizationId = callerProfile.organization_id
  const directoryTable = body.type === 'teacher' ? 'teachers' : 'students'

  const directoryPayload: Record<string, unknown> = { full_name: fullName, organization_id: organizationId, permissions }
  if (body.type === 'teacher') {
    directoryPayload.email = email || null
    directoryPayload.phone = body.phone ? String(body.phone).trim() : null
    directoryPayload.subject = String(body.subject ?? '').trim()
    directoryPayload.status = 'active'
  } else {
    directoryPayload.student_code = String(body.student_code ?? '').trim().toUpperCase()
    directoryPayload.batch = body.batch ? String(body.batch).trim() : null
    directoryPayload.guardian_name = body.guardian_name ? String(body.guardian_name).trim() : null
    directoryPayload.guardian_phone = body.guardian_phone ? String(body.guardian_phone).trim() : null
  }

  const { data: directoryRow, error: directoryError } = await admin
    .from(directoryTable)
    .insert(directoryPayload)
    .select('id')
    .single()

  if (directoryError || !directoryRow) {
    const message =
      directoryError?.message?.includes('seat limit')
        ? directoryError.message
        : directoryError?.code === '23505'
          ? `That ${body.type === 'teacher' ? 'email' : 'student code'} is already in use.`
          : `Unable to save ${body.type}.`
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!createLogin) {
    return NextResponse.json({ id: directoryRow.id, hasLogin: false })
  }

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: body.type },
  })

  if (authError || !authUser?.user) {
    await admin.from(directoryTable).delete().eq('id', directoryRow.id)
    const message = authError?.message?.toLowerCase().includes('already') ? 'That email is already in use for a login.' : 'Unable to create the login.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const linkColumn = body.type === 'teacher' ? 'teacher_id' : 'student_id'
  const { error: profileError } = await admin.from('profiles').insert({
    id: authUser.user.id,
    full_name: fullName,
    email,
    role: body.type,
    organization_id: organizationId,
    [linkColumn]: directoryRow.id,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    await admin.from(directoryTable).delete().eq('id', directoryRow.id)
    return NextResponse.json({ error: 'Unable to finish setting up the login.' }, { status: 400 })
  }

  return NextResponse.json({ id: directoryRow.id, hasLogin: true })
}
