'use client'

import { useEffect, useMemo, useState } from 'react'
import { Layers, Loader2, Pencil, Plus, Save, Trash2, UserPlus, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

type Teacher = { id: string; full_name: string }
type Student = { id: string; full_name: string; student_code: string }
type Batch = { id: string; name: string; level: string; capacity: number; teacher_id: string | null; schedule: string; student_ids: string[] }
type FormState = { name: string; level: string; capacity: string; teacher_id: string; schedule: string }
const emptyForm: FormState = { name: '', level: '', capacity: '30', teacher_id: '', schedule: '' }

export default function BatchesPage() {
  const supabase = createClient()
  const [batches, setBatches] = useState<Batch[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [assigning, setAssigning] = useState(false)

  async function loadData() {
    setLoading(true)
    const [batchResult, teacherResult, studentResult] = await Promise.all([
      supabase.from('batches').select('id, name, level, capacity, teacher_id, schedule, batch_students(student_id)').order('created_at', { ascending: false }),
      supabase.from('teachers').select('id, full_name').eq('status', 'active').order('full_name'),
      supabase.from('students').select('id, full_name, student_code').order('full_name'),
    ])
    if (batchResult.error || teacherResult.error || studentResult.error) toast.error('Unable to load batch data')
    setBatches((batchResult.data ?? []).map((row: { id: string; name: string; level: string; capacity: number; teacher_id: string | null; schedule: string; batch_students?: { student_id: string }[] }) => ({ ...row, student_ids: (row.batch_students ?? []).map((item) => item.student_id) })) as Batch[])
    setTeachers((teacherResult.data ?? []) as Teacher[])
    setStudents((studentResult.data ?? []) as Student[])
    setLoading(false)
  }
  useEffect(() => { void loadData() }, [])

  const teacherNames = useMemo(() => new Map(teachers.map((teacher) => [teacher.id, teacher.full_name])), [teachers])
  function startCreate() { setEditingId(null); setForm(emptyForm); setOpen(true) }
  function startEdit(batch: Batch) { setEditingId(batch.id); setForm({ name: batch.name, level: batch.level, capacity: String(batch.capacity), teacher_id: batch.teacher_id ?? '', schedule: batch.schedule }); setOpen(true) }
  async function saveBatch(event: React.FormEvent) {
    event.preventDefault(); setSaving(true)
    const capacity = Number(form.capacity)
    if (form.name.trim().length < 2 || form.level.trim().length < 2 || form.schedule.trim().length < 2 || !Number.isInteger(capacity) || capacity < 1) { toast.error('Enter valid batch details'); setSaving(false); return }
    const payload = { name: form.name.trim(), level: form.level.trim(), capacity, teacher_id: form.teacher_id || null, schedule: form.schedule.trim() }
    const organization = editingId ? null : await supabase.rpc('current_user_organization_id')
    if (!editingId && (organization.error || !organization.data)) { toast.error('Unable to identify your organization'); setSaving(false); return }
    const result = editingId ? await supabase.from('batches').update(payload).eq('id', editingId) : await supabase.from('batches').insert({ ...payload, organization_id: organization.data })
    if (result.error) toast.error('Unable to save batch')
    else { toast.success(editingId ? 'Batch updated' : 'Batch added'); setOpen(false); setForm(emptyForm); await loadData() }
    setSaving(false)
  }
  async function removeBatch(id: string) { if (!window.confirm('Remove this batch and its student assignments?')) return; const { error } = await supabase.from('batches').delete().eq('id', id); if (error) toast.error('Unable to remove batch'); else { toast.success('Batch removed'); await loadData() } }
  function openAssignments(batch: Batch) { setAssigningId(batch.id); setSelectedStudents(batch.student_ids); }
  function toggleStudent(id: string) { setSelectedStudents((current) => current.includes(id) ? current.filter((studentId) => studentId !== id) : [...current, id]) }
  async function saveAssignments() {
    if (!assigningId) return
    const batch = batches.find((item) => item.id === assigningId)
    if (!batch || selectedStudents.length > batch.capacity) { toast.error(`This batch can hold up to ${batch?.capacity ?? 0} students`); return }
    setAssigning(true)
    const { error: deleteError } = await supabase.from('batch_students').delete().eq('batch_id', assigningId)
    const { error: insertError } = selectedStudents.length ? await supabase.from('batch_students').insert(selectedStudents.map((student_id) => ({ batch_id: assigningId, student_id }))) : { error: null }
    if (deleteError || insertError) toast.error('Unable to update student assignments')
    else { toast.success('Student assignments updated'); setAssigningId(null); await loadData() }
    setAssigning(false)
  }

  return <div className="flex flex-col gap-6">
    <PageHeader title="Batches" description="Organize class groups, capacity and weekly schedules."><Button onClick={startCreate}><Plus data-icon="inline-start" />Add batch</Button></PageHeader>
    {open && <Card><CardHeader><CardTitle>{editingId ? 'Edit batch' : 'Add batch'}</CardTitle><CardDescription>Batch records are private to your organization.</CardDescription></CardHeader><CardContent><form onSubmit={saveBatch} className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="batch-name">Batch name</Label><Input id="batch-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="batch-level">Level</Label><Input id="batch-level" required value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="batch-capacity">Capacity</Label><Input id="batch-capacity" type="number" min="1" required value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="batch-teacher">Teacher</Label><select id="batch-teacher" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.teacher_id} onChange={(event) => setForm({ ...form, teacher_id: event.target.value })}><option value="">Unassigned</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>)}</select></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="batch-schedule">Schedule</Label><Input id="batch-schedule" required placeholder="Mon, Wed · 5:00 PM" value={form.schedule} onChange={(event) => setForm({ ...form, schedule: event.target.value })} /></div><div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}{editingId ? 'Save changes' : 'Add batch'}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}><X data-icon="inline-start" />Cancel</Button></div></form></CardContent></Card>}
    {assigningId && <Card><CardHeader><CardTitle>Assign students</CardTitle><CardDescription>Select students for {batches.find((batch) => batch.id === assigningId)?.name}. Capacity is enforced before saving.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">{students.map((student) => <label key={student.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm"><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudent(student.id)} /><span className="min-w-0"><span className="block truncate font-medium">{student.full_name}</span><span className="text-xs text-muted-foreground">{student.student_code}</span></span></label>)}{students.length === 0 && <p className="text-sm text-muted-foreground">Add students before assigning them to a batch.</p>}</div><div className="flex gap-2"><Button onClick={saveAssignments} disabled={assigning}>{assigning ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}Save assignments</Button><Button variant="outline" onClick={() => setAssigningId(null)}><X data-icon="inline-start" />Cancel</Button></div></CardContent></Card>}
    {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading batches…</div> : batches.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No batches yet. Add your first batch to get started.</CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{batches.map((batch) => <Card key={batch.id}><CardHeader className="flex flex-row items-start justify-between gap-3"><div><CardTitle className="text-base">{batch.name}</CardTitle><CardDescription className="mt-1">{batch.level}</CardDescription></div><Layers className="size-5 text-primary" /></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Capacity</span><span className="font-medium">{batch.student_ids.length} / {batch.capacity}</span></div><Progress value={Math.min(100, (batch.student_ids.length / batch.capacity) * 100)} /><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{batch.teacher_id ? teacherNames.get(batch.teacher_id) ?? 'Assigned teacher' : 'No teacher assigned'}</span><span>{batch.schedule}</span></div><div className="flex items-center justify-between gap-2 border-t pt-3"><Badge variant="secondary"><Users className="mr-1 size-3" />{batch.student_ids.length} students</Badge><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Assign students to ${batch.name}`} onClick={() => openAssignments(batch)}><UserPlus /></Button><Button size="icon" variant="ghost" aria-label={`Edit ${batch.name}`} onClick={() => startEdit(batch)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Remove ${batch.name}`} onClick={() => removeBatch(batch.id)}><Trash2 /></Button></div></div></CardContent></Card>)}</div>}
  </div>
}
