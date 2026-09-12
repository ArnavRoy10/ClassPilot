'use client'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { ClipboardList, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/app/status-badge'
import { createClient } from '@/lib/supabase/client'

type Batch = { id: string; name: string }
type Test = { id: string; batch_id: string; name: string; subject: string; test_date: string; max_marks: number; status: 'draft' | 'published' }
type FormState = { name: string; batch_id: string; subject: string; test_date: string; max_marks: string; status: 'draft' | 'published' }
const emptyForm: FormState = { name: '', batch_id: '', subject: '', test_date: '', max_marks: '100', status: 'draft' }

export default function TestsPage() {
  const supabase = createClient()
  const [tests, setTests] = useState<Test[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const [testsResult, batchesResult] = await Promise.all([
      supabase.from('tests').select('id, batch_id, name, subject, test_date, max_marks, status').order('test_date', { ascending: false }),
      supabase.from('batches').select('id, name').order('name'),
    ])
    if (testsResult.error || batchesResult.error) toast.error('Unable to load tests')
    setTests((testsResult.data ?? []) as Test[])
    setBatches((batchesResult.data ?? []) as Batch[])
    setLoading(false)
  }
  useEffect(() => { void loadData() }, [])
  const batchNames = new Map(batches.map((batch) => [batch.id, batch.name]))
  function startCreate() { setEditingId(null); setForm({ ...emptyForm, batch_id: batches[0]?.id ?? '' }); setOpen(true) }
  function startEdit(test: Test) { setEditingId(test.id); setForm({ name: test.name, batch_id: test.batch_id, subject: test.subject, test_date: test.test_date, max_marks: String(test.max_marks), status: test.status }); setOpen(true) }
  async function saveTest(event: FormEvent) {
    event.preventDefault()
    const maxMarks = Number(form.max_marks)
    if (form.name.trim().length < 2 || form.subject.trim().length < 2 || !form.batch_id || !form.test_date || !Number.isFinite(maxMarks) || maxMarks <= 0) { toast.error('Enter valid test details'); return }
    setSaving(true)
    const organization = editingId ? null : await supabase.rpc('current_user_organization_id')
    if (!editingId && (organization.error || !organization.data)) { toast.error('Unable to identify your organization'); setSaving(false); return }
    const payload = { name: form.name.trim(), batch_id: form.batch_id, subject: form.subject.trim(), test_date: form.test_date, max_marks: maxMarks, status: form.status }
    const result = editingId ? await supabase.from('tests').update(payload).eq('id', editingId) : await supabase.from('tests').insert({ ...payload, organization_id: organization.data })
    if (result.error) toast.error('Unable to save test')
    else { toast.success(editingId ? 'Test updated' : 'Test created'); setOpen(false); setForm(emptyForm); await loadData() }
    setSaving(false)
  }
  async function removeTest(id: string) { if (!window.confirm('Delete this test and its results?')) return; const { error } = await supabase.from('tests').delete().eq('id', id); if (error) toast.error('Unable to delete test'); else { toast.success('Test deleted'); await loadData() } }

  return <div className="flex flex-col gap-6">
    <PageHeader title="Tests" description="Schedule assessments and manage grading workflows."><Button onClick={startCreate}><Plus data-icon="inline-start" />Create test</Button></PageHeader>
    {open && <Card><CardHeader><CardTitle>{editingId ? 'Edit test' : 'Create test'}</CardTitle><CardDescription>Tests are visible only to authorized members of your organization.</CardDescription></CardHeader><CardContent><form onSubmit={saveTest} className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="test-name">Test name</Label><Input id="test-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="test-subject">Subject</Label><Input id="test-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="test-batch">Batch</Label><select id="test-batch" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })} required><option value="">Select batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="test-date">Test date</Label><Input id="test-date" type="date" value={form.test_date} onChange={(e) => setForm({ ...form, test_date: e.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="test-marks">Maximum marks</Label><Input id="test-marks" type="number" min="1" step="0.01" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="test-status">Status</Label><select id="test-status" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState['status'] })}><option value="draft">Draft</option><option value="published">Published</option></select></div><div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}{editingId ? 'Save changes' : 'Create test'}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}><X data-icon="inline-start" />Cancel</Button></div></form></CardContent></Card>}
    {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading tests…</div> : tests.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No tests yet. Create your first assessment.</CardContent></Card> : <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/40"><tr className="text-left"><th className="p-4">Test</th><th className="p-4">Batch</th><th className="p-4">Subject</th><th className="p-4">Date</th><th className="p-4">Max marks</th><th className="p-4">Status</th><th className="p-4" /></tr></thead><tbody>{tests.map((test) => <tr key={test.id} className="border-b last:border-0"><td className="p-4"><div className="flex items-center gap-3"><ClipboardList className="size-4 text-primary" /><div><p className="font-medium">{test.name}</p><p className="text-xs text-muted-foreground">{test.id.slice(0, 8)}</p></div></div></td><td className="p-4">{batchNames.get(test.batch_id) ?? 'Batch'}</td><td className="p-4 text-muted-foreground">{test.subject}</td><td className="p-4">{test.test_date}</td><td className="p-4">{test.max_marks}</td><td className="p-4"><StatusBadge status={test.status} /></td><td className="p-4"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${test.name}`} onClick={() => startEdit(test)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${test.name}`} onClick={() => removeTest(test.id)}><Trash2 /></Button></div></td></tr>)}</tbody></table></div></Card>}
  </div>
}
