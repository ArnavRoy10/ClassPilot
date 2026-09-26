import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { STUDENT_POWERS, TEACHER_POWERS, normalizePermissions } from '@/lib/permissions'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!callerProfile || callerProfile.role !== 'owner' || !callerProfile.organization_id) {
    return NextResponse.json({ error: 'Only the organization owner can edit teachers or students.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || (body.type !== 'teacher' && body.type !== 'student') || !body.id) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const admin = getAdminClient()
  const organizationId = callerProfile.organization_id
  const directoryTable = body.type === 'teacher' ? 'teachers' : 'students'
  const linkColumn = body.type === 'teacher' ? 'teacher_id' : 'student_id'

  const { data: existingRow } = await admin
    .from(directoryTable)
    .select('id, full_name')
    .eq('id', body.id)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (!existingRow) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

  const directoryPayload: Record<string, unknown> = {}
  if (typeof body.full_name === 'string' && body.full_name.trim()) directoryPayload.full_name = body.full_name.trim()
  if (body.permissions && typeof body.permissions === 'object') {
    directoryPayload.permissions = normalizePermissions(body.type === 'teacher' ? TEACHER_POWERS : STUDENT_POWERS, body.permissions)
  }
  if (body.type === 'teacher') {
    if (typeof body.subject === 'string') directoryPayload.subject = body.subject.trim()
    if (typeof body.phone === 'string') directoryPayload.phone = body.phone.trim() || null
    if (typeof body.status === 'string') directoryPayload.status = body.status
  } else {
    if (typeof body.student_code === 'string' && body.student_code.trim()) directoryPayload.student_code = body.student_code.trim().toUpperCase()
    if (typeof body.batch === 'string') directoryPayload.batch = body.batch.trim() || null
    if (typeof body.guardian_name === 'string') directoryPayload.guardian_name = body.guardian_name.trim() || null
    if (typeof body.guardian_phone === 'string') directoryPayload.guardian_phone = body.guardian_phone.trim() || null
  }
  if (typeof body.email === 'string' && body.email.trim() && body.type === 'teacher') {
    directoryPayload.email = body.email.trim().toLowerCase()
  }

  if (Object.keys(directoryPayload).length) {
    const { error } = await admin.from(directoryTable).update(directoryPayload).eq('id', body.id)
    if (error) {
      const message = error.code === '23505' ? 'That value is already in use.' : `Unable to update ${body.type}.`
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  const { data: linkedProfile } = await admin.from('profiles').select('id').eq(linkColumn, body.id).maybeSingle()
  const newEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const newPassword = typeof body.password === 'string' ? body.password : ''

  if (linkedProfile) {
    const authUpdate: Record<string, unknown> = {}
    if (newEmail) authUpdate.email = newEmail
    if (newPassword) {
      if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
      authUpdate.password = newPassword
    }
    if (Object.keys(authUpdate).length) {
      const { error: authError } = await admin.auth.admin.updateUserById(linkedProfile.id, authUpdate)
      if (authError) return NextResponse.json({ error: 'Unable to update the login.' }, { status: 400 })
    }

    const profilePayload: Record<string, unknown> = {}
    if (typeof body.full_name === 'string' && body.full_name.trim()) profilePayload.full_name = body.full_name.trim()
    if (newEmail) profilePayload.email = newEmail
    if (Object.keys(profilePayload).length) await admin.from('profiles').update(profilePayload).eq('id', linkedProfile.id)
  } else if (newEmail && newPassword) {
    if (!newEmail.includes('@')) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 })
    if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: newEmail,
      password: newPassword,
      email_confirm: true,
      user_metadata: { role: body.type },
    })
    if (authError || !authUser?.user) {
      const message = authError?.message?.toLowerCase().includes('already') ? 'That email is already in use for a login.' : 'Unable to create the login.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { error: profileError } = await admin.from('profiles').insert({
      id: authUser.user.id,
      full_name: (typeof body.full_name === 'string' && body.full_name.trim()) || existingRow.full_name,
      email: newEmail,
      role: body.type,
      organization_id: organizationId,
      [linkColumn]: body.id,
    })
    if (profileError) {
      await admin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: 'Unable to finish setting up the login.' }, { status: 400 })
    }
  }

  return NextResponse.json({ ok: true })
}
