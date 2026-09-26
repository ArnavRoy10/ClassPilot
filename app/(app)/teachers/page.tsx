'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Loader2, Pencil, Phone, Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/app/status-badge'
import { createClient } from '@/lib/supabase/client'
import { TEACHER_POWERS, emptyPermissions, type Permissions } from '@/lib/permissions'

type Teacher = { id: string; full_name: string; email: string; phone: string | null; subject: string; status: 'active' | 'inactive'; permissions?: Permissions | null }
type FormState = { full_name: string; email: string; phone: string; subject: string; status: 'active' | 'inactive'; password: string; permissions: Permissions }
const emptyForm = (): FormState => ({ full_name: '', email: '', phone: '', subject: '', status: 'active', password: '', permissions: emptyPermissions(TEACHER_POWERS) })

function initials(name: string) { return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() }

export default function TeachersPage() {
  const supabase = createClient()
  const router = useRouter()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loginIds, setLoginIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState<FormState>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maxTeachers, setMaxTeachers] = useState<number | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      const orgId = await supabase.rpc('current_user_organization_id')
      if (orgId.error || !orgId.data) { setCheckingAccess(false); return }
      const { data: org } = await supabase.from('organizations').select('type, max_teachers').eq('id', orgId.data).maybeSingle()
      if (org?.type === 'solo_tutor') { router.replace('/dashboard'); return }
      setMaxTeachers(org?.max_teachers ?? null)
      setCheckingAccess(false)
    }
    void checkAccess()
  }, [])

  async function loadTeachers() {
    setLoading(true)
    const { data, error } = await supabase.from('teachers').select('id, full_name, email, phone, subject, status, permissions').order('created_at', { ascending: false })
    if (error) toast.error('Unable to load teachers')
    setTeachers((data ?? []) as Teacher[])
    const { data: linked } = await supabase.from('profiles').select('teacher_id').not('teacher_id', 'is', null)
    setLoginIds(new Set((linked ?? []).map((row) => row.teacher_id as string)))
    setLoading(false)
  }
  useEffect(() => { void loadTeachers() }, [])

  function startCreate() { setEditingId(null); setForm(emptyForm()); setOpen(true) }
  function startEdit(t: Teacher) {
    setEditingId(t.id)
    setForm({ full_name: t.full_name, email: t.email, phone: t.phone ?? '', subject: t.subject, status: t.status, password: '', permissions: { ...emptyPermissions(TEACHER_POWERS), ...(t.permissions ?? {}) } })
    setOpen(true)
  }

  async function saveTeacher(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    const payload = {
      type: 'teacher',
      id: editingId ?? undefined,
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim(),
      status: form.status,
      password: form.password || undefined,
      permissions: form.permissions,
    }
    if (payload.full_name.length < 2 || payload.subject.length < 2 || !payload.email.includes('@')) { toast.error('Enter a valid name, email, and subject'); setSaving(false); return }

    const response = await fetch(editingId ? '/api/team/update' : '/api/team/create', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      toast.error(result.error ?? 'Unable to save teacher')
    } else {
      toast.success(editingId ? 'Teacher updated' : 'Teacher added')
      setOpen(false)
      setForm(emptyForm())
      await loadTeachers()
    }
    setSaving(false)
  }

  async function removeTeacher(id: string) {
    if (!window.confirm('Remove this teacher? This also removes their login, if they have one.')) return
    const response = await fetch('/api/team/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'teacher', id }) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) toast.error(result.error ?? 'Unable to remove teacher')
    else { toast.success('Teacher removed'); await loadTeachers() }
  }

  const atLimit = maxTeachers !== null && teachers.length >= maxTeachers

  if (checkingAccess) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading…</div>

  return <div className="flex flex-col gap-6">
    <PageHeader title="Teachers" description="Manage your faculty directory, subject assignments, and teacher logins."><Button onClick={startCreate} disabled={atLimit}><Plus data-icon="inline-start" />Add teacher</Button></PageHeader>
    {maxTeachers !== null && <p className="text-sm text-muted-foreground">{teachers.length} of {maxTeachers} teacher seats used{atLimit && ' — upgrade your plan to add more'}</p>}
    {open && <Card>
      <CardHeader><CardTitle>{editingId ? 'Edit teacher' : 'Add teacher'}</CardTitle><CardDescription>Set a password to give this teacher a login — leave it blank to keep them as a directory-only record{editingId ? ' with their current login unchanged' : ''}.</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={saveTeacher} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2"><Label htmlFor="teacher-name">Full name</Label><Input id="teacher-name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="grid gap-2"><Label htmlFor="teacher-email">Email</Label><Input id="teacher-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="grid gap-2"><Label htmlFor="teacher-phone">Phone</Label><Input id="teacher-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="grid gap-2"><Label htmlFor="teacher-subject">Subject</Label><Input id="teacher-subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="grid gap-2"><Label htmlFor="teacher-password">Login password {editingId ? '(leave blank to keep current)' : '(optional — enables login with the email above)'}</Label><Input id="teacher-password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></div>

          <div className="grid gap-2 sm:col-span-2">
            <Label>Powers</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {TEACHER_POWERS.map((power) => (
                <label key={power.key} className="flex items-start gap-2 rounded-md border border-border p-2 text-sm">
                  <input type="checkbox" className="mt-0.5" checked={Boolean(form.permissions[power.key])} onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, [power.key]: e.target.checked } })} />
                  <span><span className="block font-medium">{power.label}</span><span className="block text-xs text-muted-foreground">{power.description}</span></span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}{editingId ? 'Save changes' : 'Add teacher'}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}><X data-icon="inline-start" />Cancel</Button></div>
        </form>
      </CardContent>
    </Card>}
    {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading teachers…</div> : teachers.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No teachers yet. Add your first teacher to get started.</CardContent></Card> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{teachers.map((t) => <Card key={t.id}><CardHeader className="flex-row items-center gap-3"><Avatar className="size-11"><AvatarFallback>{initials(t.full_name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><CardTitle className="truncate text-base">{t.full_name}{loginIds.has(t.id) && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary align-middle">Login</span>}</CardTitle><CardDescription>{t.subject}</CardDescription></div><StatusBadge status={t.status} /></CardHeader><CardContent className="flex flex-col gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><BookOpen className="size-4" />{t.email}</span><span className="flex items-center gap-2 font-mono text-xs"><Phone className="size-4" />{t.phone ?? 'No phone added'}</span><div className="flex gap-2 pt-2"><Button size="sm" variant="outline" onClick={() => startEdit(t)}><Pencil data-icon="inline-start" />Edit</Button><Button size="sm" variant="ghost" onClick={() => removeTeacher(t.id)}><Trash2 data-icon="inline-start" />Remove</Button></div></CardContent></Card>)}</div>}
  </div>
}
