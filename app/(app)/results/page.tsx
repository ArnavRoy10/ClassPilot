'use client'

import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Loader2, Pencil, Plus, Save, Trophy, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type Test = { id: string; name: string; batch_id: string; max_marks: number }
type Student = { id: string; full_name: string; student_code: string }
type Result = { id: string; test_id: string; student_id: string; marks_obtained: number; remarks: string | null }
type FormState = { test_id: string; student_id: string; marks_obtained: string; remarks: string }
const emptyForm: FormState = { test_id: '', student_id: '', marks_obtained: '', remarks: '' }

export default function ResultsPage() {
  const supabase = createClient()
  const [results, setResults] = useState<Result[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const [resultResponse, testResponse, studentResponse] = await Promise.all([
      supabase.from('results').select('id, test_id, student_id, marks_obtained, remarks').order('created_at', { ascending: false }),
      supabase.from('tests').select('id, name, batch_id, max_marks').order('test_date', { ascending: false }),
      supabase.from('students').select('id, full_name, student_code').order('full_name'),
    ])
    if (resultResponse.error || testResponse.error || studentResponse.error) toast.error('Unable to load results')
    setResults((resultResponse.data ?? []) as Result[])
    setTests((testResponse.data ?? []) as Test[])
    setStudents((studentResponse.data ?? []) as Student[])
    setLoading(false)
  }
  useEffect(() => { void loadData() }, [])
  const testsById = useMemo(() => new Map(tests.map((test) => [test.id, test])), [tests])
  const studentsById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students])
  const rankedResults = useMemo(() => [...results].sort((a, b) => Number(b.marks_obtained) - Number(a.marks_obtained)), [results])
  function startCreate() { setEditingId(null); setForm({ ...emptyForm, test_id: tests[0]?.id ?? '', student_id: students[0]?.id ?? '' }); setOpen(true) }
  function startEdit(result: Result) { setEditingId(result.id); setForm({ test_id: result.test_id, student_id: result.student_id, marks_obtained: String(result.marks_obtained), remarks: result.remarks ?? '' }); setOpen(true) }
  async function saveResult(event: FormEvent) {
    event.preventDefault()
    const test = testsById.get(form.test_id)
    const marks = Number(form.marks_obtained)
    if (!test || !form.student_id || !Number.isFinite(marks) || marks < 0 || marks > test.max_marks) { toast.error(`Marks must be between 0 and ${test?.max_marks ?? 0}`); return }
    setSaving(true)
    const organization = editingId ? null : await supabase.rpc('current_user_organization_id')
    if (!editingId && (organization.error || !organization.data)) { toast.error('Unable to identify your organization'); setSaving(false); return }
    const payload = { test_id: form.test_id, student_id: form.student_id, marks_obtained: marks, remarks: form.remarks.trim() || null }
    const response = editingId ? await supabase.from('results').update(payload).eq('id', editingId) : await supabase.from('results').insert({ ...payload, organization_id: organization.data })
    if (response.error) toast.error(response.error.code === '23505' ? 'A result already exists for this student and test' : 'Unable to save result')
    else { toast.success(editingId ? 'Result updated' : 'Result saved'); setOpen(false); setForm(emptyForm); await loadData() }
    setSaving(false)
  }
  async function removeResult(id: string) { if (!window.confirm('Delete this result?')) return; const { error } = await supabase.from('results').delete().eq('id', id); if (error) toast.error('Unable to delete result'); else { toast.success('Result deleted'); await loadData() } }

  return <div className="flex flex-col gap-6">
    <PageHeader title="Results" description="Review scores, rankings and academic progress."><Button onClick={startCreate}><Plus data-icon="inline-start" />Add result</Button></PageHeader>
    {open && <Card><CardHeader><CardTitle>{editingId ? 'Edit result' : 'Add result'}</CardTitle><CardDescription>Marks are checked against the selected test maximum.</CardDescription></CardHeader><CardContent><form onSubmit={saveResult} className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="result-test">Test</Label><select id="result-test" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.test_id} onChange={(e) => setForm({ ...form, test_id: e.target.value })} required><option value="">Select test</option>{tests.map((test) => <option key={test.id} value={test.id}>{test.name} ({test.max_marks})</option>)}</select></div><div className="grid gap-2"><Label htmlFor="result-student">Student</Label><select id="result-student" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required><option value="">Select student</option>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name} · {student.student_code}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="result-marks">Marks obtained</Label><Input id="result-marks" type="number" min="0" step="0.01" value={form.marks_obtained} onChange={(e) => setForm({ ...form, marks_obtained: e.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="result-remarks">Remarks</Label><Input id="result-remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Optional" /></div><div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />} {editingId ? 'Save changes' : 'Save result'}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}><X data-icon="inline-start" />Cancel</Button></div></form></CardContent></Card>}
    {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading results…</div> : rankedResults.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No results yet. Add marks after creating a test.</CardContent></Card> : <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/40"><tr className="text-left"><th className="p-4">Rank</th><th className="p-4">Student</th><th className="p-4">Test</th><th className="p-4 text-right">Score</th><th className="p-4">Remarks</th><th className="p-4" /></tr></thead><tbody>{rankedResults.map((result, index) => { const test = testsById.get(result.test_id); const student = studentsById.get(result.student_id); return <tr key={result.id} className="border-b last:border-0"><td className="p-4"><div className="flex items-center gap-2 font-semibold">{index < 3 && <Trophy className="size-4 text-warning" />}{index + 1}</div></td><td className="p-4 font-medium">{student?.full_name ?? 'Student'}<span className="ml-2 text-xs text-muted-foreground">{student?.student_code}</span></td><td className="p-4 text-muted-foreground">{test?.name ?? 'Test'}</td><td className="p-4 text-right font-semibold">{result.marks_obtained} / {test?.max_marks ?? '—'}</td><td className="p-4 text-muted-foreground">{result.remarks || '—'}</td><td className="p-4"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label="Edit result" onClick={() => startEdit(result)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label="Delete result" onClick={() => removeResult(result.id)}><Trash2 /></Button></div></td></tr> })}</tbody></table></div></Card>}
  </div>
}
