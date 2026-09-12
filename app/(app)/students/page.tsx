'use client'

import { useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Save, Search, Trash2, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/app/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { trackProductEvent } from '@/lib/product-events'

type Student = { id: string; full_name: string; student_code: string; batch: string | null; guardian_name: string | null; guardian_phone: string | null; fee_status: 'paid' | 'pending' | 'overdue'; attendance: number }
type FormState = { full_name: string; student_code: string; batch: string; guardian_name: string; guardian_phone: string }
const emptyForm: FormState = { full_name: '', student_code: '', batch: '', guardian_name: '', guardian_phone: '' }
function initials(name: string) { return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() }

export default function StudentsPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  async function loadStudents() { setLoading(true); const { data, error } = await supabase.from('students').select('id, full_name, student_code, batch, guardian_name, guardian_phone, fee_status, attendance').order('created_at', { ascending: false }); if (error) toast.error('Unable to load students'); setStudents((data ?? []) as Student[]); setLoading(false) }
  useEffect(() => { void loadStudents() }, [])
  function startCreate() { setEditingId(null); setForm(emptyForm); setOpen(true) }
  function startEdit(s: Student) { setEditingId(s.id); setForm({ full_name: s.full_name, student_code: s.student_code, batch: s.batch ?? '', guardian_name: s.guardian_name ?? '', guardian_phone: s.guardian_phone ?? '' }); setOpen(true) }
  async function saveStudent(event: React.FormEvent) { event.preventDefault(); setSaving(true); const payload = { full_name: form.full_name.trim(), student_code: form.student_code.trim().toUpperCase(), batch: form.batch.trim() || null, guardian_name: form.guardian_name.trim() || null, guardian_phone: form.guardian_phone.trim() || null }; if (payload.full_name.length < 2 || payload.student_code.length < 2) { toast.error('Enter a valid name and student code'); setSaving(false); return }; const organization = editingId ? null : await supabase.rpc('current_user_organization_id')
    if (!editingId && (organization.error || !organization.data)) { toast.error('Unable to identify your organization'); setSaving(false); return }
    const result = editingId ? await supabase.from('students').update(payload).eq('id', editingId) : await supabase.from('students').insert({ ...payload, organization_id: organization.data }); if (result.error) toast.error(result.error.code === '23505' ? 'That student code already exists' : 'Unable to save student'); else { toast.success(editingId ? 'Student updated' : 'Student added'); if (!editingId) void trackProductEvent(supabase, 'student_created', { eventKey: `student:${Date.now()}`, metadata: { has_guardian: Boolean(payload.guardian_name) } }); setOpen(false); setForm(emptyForm); await loadStudents() }; setSaving(false) }
  async function removeStudent(id: string) { if (!window.confirm('Remove this student?')) return; const { error } = await supabase.from('students').delete().eq('id', id); if (error) toast.error('Unable to remove student'); else { toast.success('Student removed'); await loadStudents() } }
  const filtered = students.filter((s) => `${s.full_name} ${s.student_code} ${s.batch ?? ''} ${s.guardian_name ?? ''}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="flex flex-col gap-6">
    <PageHeader title="Students" description="Manage enrollments, profiles and guardian contacts."><Button onClick={startCreate}><Plus data-icon="inline-start" />Add student</Button></PageHeader>
    {open && <Card><CardHeader><CardTitle>{editingId ? 'Edit student' : 'Add student'}</CardTitle><CardDescription>Student records are private to your organization.</CardDescription></CardHeader><CardContent><form onSubmit={saveStudent} className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="student-name">Full name</Label><Input id="student-name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="student-code">Student code</Label><Input id="student-code" required value={form.student_code} onChange={(e) => setForm({ ...form, student_code: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="student-batch">Batch</Label><Input id="student-batch" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="guardian-name">Guardian name</Label><Input id="guardian-name" value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="guardian-phone">Guardian phone</Label><Input id="guardian-phone" value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} /></div><div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}{editingId ? 'Save changes' : 'Add student'}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}><X data-icon="inline-start" />Cancel</Button></div></form></CardContent></Card>}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search students..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} /></div><p className="text-sm text-muted-foreground"><Users className="mr-1 inline size-4 align-text-bottom" />{filtered.length} students shown</p></div>
    {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading students…</div> : <Card className="overflow-hidden p-0"><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Batch</TableHead><TableHead>Guardian</TableHead><TableHead className="hidden md:table-cell">Phone</TableHead><TableHead>Fees</TableHead><TableHead className="text-right">Attendance</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((s) => <TableRow key={s.id}><TableCell><div className="flex items-center gap-3"><Avatar className="size-8"><AvatarFallback className="text-xs">{initials(s.full_name)}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-medium">{s.full_name}</p><p className="truncate text-xs text-muted-foreground">{s.student_code}</p></div></div></TableCell><TableCell className="text-muted-foreground">{s.batch ?? '—'}</TableCell><TableCell className="text-muted-foreground">{s.guardian_name ?? '—'}</TableCell><TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">{s.guardian_phone ?? '—'}</TableCell><TableCell><StatusBadge status={s.fee_status} /></TableCell><TableCell className="text-right tabular-nums">{s.attendance}%</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${s.full_name}`} onClick={() => startEdit(s)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Remove ${s.full_name}`} onClick={() => removeStudent(s.id)}><Trash2 /></Button></div></TableCell></TableRow>)}{filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No students found.</TableCell></TableRow>}</TableBody></Table></Card>}
  </div>
}
