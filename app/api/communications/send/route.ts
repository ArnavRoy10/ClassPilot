import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await request.json().catch(() => null)
  const channel = payload?.channel
  const recipientType = payload?.recipientType
  const subject = typeof payload?.subject === 'string' ? payload.subject.trim() : ''
  const body = typeof payload?.body === 'string' ? payload.body.trim() : ''
  if (!['email', 'whatsapp', 'sms'].includes(channel) || !['all_students', 'all_teachers', 'students', 'parent', 'teacher'].includes(recipientType) || body.length < 2 || body.length > 10000 || (channel === 'email' && (subject.length < 2 || subject.length > 160))) return NextResponse.json({ error: 'Invalid message details.' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('organization_id, role').eq('id', user.id).maybeSingle()
  if (!profile || !['owner', 'admin', 'teacher'].includes(profile.role)) return NextResponse.json({ error: 'You cannot send messages.' }, { status: 403 })

  const roleFilter = recipientType === 'all_teachers' || recipientType === 'teacher' ? 'teacher' : recipientType === 'parent' ? 'parent' : 'student'
  const { data: recipients } = await supabase.from('profiles').select('id,full_name,email').eq('organization_id', profile.organization_id).eq('role', roleFilter)
  const validRecipients = (recipients ?? []).filter((recipient) => typeof recipient.email === 'string' && emailPattern.test(recipient.email))
  const { data: message, error: messageError } = await supabase.from('communication_messages').insert({ organization_id: profile.organization_id, sender_id: user.id, channel, recipient_type: recipientType, subject: subject || null, body, recipient_count: validRecipients.length, status: 'queued' }).select('id').single()
  if (messageError || !message) return NextResponse.json({ error: 'Unable to queue message.' }, { status: 500 })
  if (validRecipients.length) {
    const { error: recipientError } = await supabase.from('communication_recipients').insert(validRecipients.map((recipient) => ({ message_id: message.id, organization_id: profile.organization_id, recipient_profile_id: recipient.id, recipient_address: recipient.email, recipient_name: recipient.full_name, status: 'queued' })))
    if (recipientError) {
      await supabase.from('communication_messages').update({ status: 'failed', error_message: 'Unable to queue recipients.' }).eq('id', message.id)
      return NextResponse.json({ error: 'Unable to queue recipients.' }, { status: 500 })
    }
  }
  if (channel !== 'email') return NextResponse.json({ messageId: message.id, recipientCount: validRecipients.length, status: 'queued' })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Email delivery is not configured.' }, { status: 503 })
  const resend = new Resend(apiKey)
  const from = `ClassPilot <${process.env.RESEND_EMAIL_DOMAIN ? `no-reply@${process.env.RESEND_EMAIL_DOMAIN}` : 'onboarding@resend.dev'}>`
  const { data: sent, error: sendError } = await resend.emails.send({ from, to: validRecipients.map((recipient) => recipient.email), subject, text: body }, { idempotencyKey: `communication/${message.id}` })
  if (sendError) {
    await supabase.from('communication_messages').update({ status: 'failed', error_message: sendError.message }).eq('id', message.id)
    return NextResponse.json({ error: 'Email provider rejected the message.' }, { status: 502 })
  }
  await supabase.from('communication_messages').update({ status: 'sent', provider_message_id: sent?.id ?? null, sent_at: new Date().toISOString() }).eq('id', message.id)
  await supabase.from('communication_recipients').update({ status: 'sent', provider_message_id: sent?.id ?? null }).eq('message_id', message.id)
  return NextResponse.json({ messageId: message.id, recipientCount: validRecipients.length, status: 'sent' })
}
