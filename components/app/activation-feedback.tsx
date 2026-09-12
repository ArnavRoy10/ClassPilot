'use client'

import { useState } from 'react'
import { CheckCircle2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function ActivationFeedback() {
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!comment.trim() || saving) return
    setSaving(true)
    const supabase = createClient()
    const [{ data: userData }, { data: organizationId }] = await Promise.all([supabase.auth.getUser(), supabase.rpc('current_user_organization_id')])
    if (!userData.user || !organizationId) { toast.error('We could not save your feedback.'); setSaving(false); return }
    const { error } = await supabase.from('support_feedback').insert({ organization_id: organizationId, submitted_by: userData.user.id, rating: 5, comment: comment.trim() })
    if (error) toast.error('We could not save your feedback.')
    else { setSent(true); toast.success('Thanks for sharing that.') }
    setSaving(false)
  }

  if (sent) return <Card><CardContent className="flex items-center gap-3 p-5 text-sm"><CheckCircle2 className="size-5 text-success" />Thanks — your feedback helps us improve the first-week experience.</CardContent></Card>
  return <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="size-4 text-primary" />How is setup going?</CardTitle></CardHeader><CardContent className="space-y-3"><Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tell us what would make your first week easier…" maxLength={2000} /><Button onClick={submit} disabled={!comment.trim() || saving}>{saving ? 'Saving…' : 'Share feedback'}</Button></CardContent></Card>
}
