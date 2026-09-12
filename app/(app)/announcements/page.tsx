'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Megaphone, Pencil, Pin, Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'


type Batch = { id: string; name: string }
type Announcement = {
  id: string
  title: string
  message: string
  audience: 'everyone' | 'teachers' | 'students' | 'specific_batch'
  batch_id: string | null
  status: 'draft' | 'published'
  publish_at: string
  created_at: string
}
type FormState = {
  title: string
  message: string
  audience: Announcement['audience']
  batch_id: string
  status: Announcement['status']
  publish_at: string
}

const emptyForm: FormState = {
  title: '',
  message: '',
  audience: 'everyone',
  batch_id: '',
  status: 'draft',
  publish_at: new Date().toISOString().slice(0, 16),
}

const audienceLabels: Record<Announcement['audience'], string> = {
  everyone: 'Everyone',
  teachers: 'Teachers',
  students: 'Students',
  specific_batch: 'Specific batch',
}

export default function AnnouncementsPage() {
  const supabase = createClient()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const [announcementResult, batchResult] = await Promise.all([
      supabase.from('announcements').select('id, title, message, audience, batch_id, status, publish_at, created_at').order('created_at', { ascending: false }),
      supabase.from('batches').select('id, name').order('name'),
    ])
    if (announcementResult.error || batchResult.error) toast.error('Unable to load announcements')
    setAnnouncements((announcementResult.data ?? []) as Announcement[])
    setBatches((batchResult.data ?? []) as Batch[])
    setLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  const batchNames = useMemo(() => new Map(batches.map((batch) => [batch.id, batch.name])), [batches])

  function startCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, publish_at: new Date().toISOString().slice(0, 16) })
    setOpen(true)
  }

  function startEdit(item: Announcement) {
    setEditingId(item.id)
    setForm({ title: item.title, message: item.message, audience: item.audience, batch_id: item.batch_id ?? '', status: item.status, publish_at: item.publish_at.slice(0, 16) })
    setOpen(true)
  }

  async function saveAnnouncement(event: React.FormEvent) {
    event.preventDefault()
    const title = form.title.trim()
    const message = form.message.trim()
    if (title.length < 2 || message.length < 2 || (form.audience === 'specific_batch' && !form.batch_id)) {
      toast.error('Enter a title, message, and valid audience')
      return
    }
    setSaving(true)
    const organization = editingId ? null : await supabase.rpc('current_user_organization_id')
    const user = editingId ? null : await supabase.auth.getUser()
    if (!editingId && (organization?.error || !organization?.data || user?.error || !user?.data.user)) {
      toast.error('Unable to identify your organization')
      setSaving(false)
      return
    }
    const payload = {
      title,
      message,
      audience: form.audience,
      batch_id: form.audience === 'specific_batch' ? form.batch_id : null,
      status: form.status,
      publish_at: new Date(form.publish_at).toISOString(),
    }
    const result = editingId
      ? await supabase.from('announcements').update(payload).eq('id', editingId)
      : await supabase.from('announcements').insert({ ...payload, organization_id: organization?.data, created_by: user?.data.user?.id })
    if (result.error) toast.error('Unable to save announcement')
    else {
      toast.success(editingId ? 'Announcement updated' : 'Announcement created')
      setOpen(false)
      setForm(emptyForm)
      await loadData()
    }
    setSaving(false)
  }

  async function removeAnnouncement(id: string) {
    if (!window.confirm('Delete this announcement?')) return
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) toast.error('Unable to delete announcement')
    else { toast.success('Announcement deleted'); await loadData() }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Announcements" description="Keep students, parents and teachers up to date." actions={<Button onClick={startCreate}><Plus data-icon="inline-start" />New announcement</Button>} />
      {open && <Card>
        <CardHeader><CardTitle>{editingId ? 'Edit announcement' : 'New announcement'}</CardTitle><CardDescription>Only owners and admins can publish organization announcements.</CardDescription></CardHeader>
        <CardContent><form onSubmit={saveAnnouncement} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="announcement-title">Title</Label><Input id="announcement-title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="announcement-message">Message</Label><Textarea id="announcement-message" required rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></div>
          <div className="grid gap-2"><Label htmlFor="announcement-audience">Audience</Label><select id="announcement-audience" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value as Announcement['audience'], batch_id: '' })}>{Object.entries(audienceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          {form.audience === 'specific_batch' && <div className="grid gap-2"><Label htmlFor="announcement-batch">Batch</Label><select id="announcement-batch" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required value={form.batch_id} onChange={(event) => setForm({ ...form, batch_id: event.target.value })}><option value="">Select a batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</select></div>}
          <div className="grid gap-2"><Label htmlFor="announcement-status">Status</Label><select id="announcement-status" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Announcement['status'] })}><option value="draft">Draft</option><option value="published">Published</option></select></div>
          <div className="grid gap-2"><Label htmlFor="announcement-publish">Publish at</Label><Input id="announcement-publish" type="datetime-local" value={form.publish_at} onChange={(event) => setForm({ ...form, publish_at: event.target.value })} /></div>
          <div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}{editingId ? 'Save changes' : 'Create announcement'}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}><X data-icon="inline-start" />Cancel</Button></div>
        </form></CardContent>
      </Card>}
      {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading announcements…</div> : announcements.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No announcements yet. Create one to keep your organization informed.</CardContent></Card> : <div className="grid gap-4 lg:grid-cols-2">{announcements.map((announcement) => <Card key={announcement.id}><CardHeader className="flex flex-row items-start justify-between gap-4"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Megaphone className="size-4" /></div><div><CardTitle className="text-base">{announcement.title}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{new Date(announcement.publish_at).toLocaleString()}</p></div></div><div className="flex items-center gap-1">{announcement.status === 'published' && <Pin className="size-4 text-warning" />}<Badge variant={announcement.status === 'published' ? 'default' : 'secondary'}>{announcement.status}</Badge></div></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{announcement.message}</p><div className="mt-4 flex items-center justify-between gap-2"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{audienceLabels[announcement.audience]}</Badge>{announcement.batch_id && <Badge variant="outline">{batchNames.get(announcement.batch_id) ?? 'Selected batch'}</Badge>}</div><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${announcement.title}`} onClick={() => startEdit(announcement)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${announcement.title}`} onClick={() => removeAnnouncement(announcement.id)}><Trash2 /></Button></div></div></CardContent></Card>)}</div>}
    </div>
  )
}
