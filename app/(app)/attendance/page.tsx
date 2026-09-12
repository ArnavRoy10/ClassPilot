'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, Check, Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { trackProductEvent } from '@/lib/product-events'

type Batch = { id: string; name: string; capacity: number }
type Student = { id: string; full_name: string; student_code: string }
type BatchStudent = { batch_id: string; student_id: string }
type AttendanceStatus = 'present' | 'absent' | 'late'
type AttendanceRow = { id: string; batch_id: string; student_id: string; status: AttendanceStatus }

function localDate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function AttendancePage() {
  const supabase = createClient()
  const [date, setDate] = useState(localDate)
  const [batchId, setBatchId] = useState('')
  const [batches, setBatches] = useState<Batch[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [batchStudents, setBatchStudents] = useState<BatchStudent[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const selectedBatch = batches.find((batch) => batch.id === batchId)
  const selectedStudentIds = useMemo(() => batchStudents.filter((item) => item.batch_id === batchId).map((item) => item.student_id), [batchStudents, batchId])
  const selectedStudents = students.filter((student) => selectedStudentIds.includes(student.id))
  const summary = useMemo(() => {
    const statuses = selectedStudents.map((student) => attendance[student.id]).filter(Boolean)
    return { present: statuses.filter((status) => status === 'present').length, absent: statuses.filter((status) => status === 'absent').length, late: statuses.filter((status) => status === 'late').length }
  }, [attendance, selectedStudents])

  async function loadData() {
    setLoading(true)
    const [batchesResult, studentsResult, membershipsResult] = await Promise.all([
      supabase.from('batches').select('id, name, capacity').order('name'),
      supabase.from('students').select('id, full_name, student_code').order('full_name'),
      supabase.from('batch_students').select('batch_id, student_id'),
    ])
    if (batchesResult.error || studentsResult.error || membershipsResult.error) toast.error('Unable to load attendance data')
    const nextBatches = (batchesResult.data ?? []) as Batch[]
    setBatches(nextBatches)
    setStudents((studentsResult.data ?? []) as Student[])
    setBatchStudents((membershipsResult.data ?? []) as BatchStudent[])
    if (!batchId && nextBatches[0]) setBatchId(nextBatches[0].id)
    setLoading(false)
  }

  async function loadAttendance(nextBatchId = batchId, nextDate = date) {
    if (!nextBatchId || !nextDate) return
    const { data, error } = await supabase.from('attendance').select('id, batch_id, student_id, status').eq('batch_id', nextBatchId).eq('date', nextDate)
    if (error) { toast.error('Unable to load attendance'); return }
    setAttendance(Object.fromEntries(((data ?? []) as AttendanceRow[]).map((row) => [row.student_id, row.status])))
  }

  useEffect(() => { void loadData() }, [])
  useEffect(() => { void loadAttendance() }, [batchId, date])

  function setStatus(studentId: string, status: AttendanceStatus) { setAttendance((current) => ({ ...current, [studentId]: status })) }

  async function saveAttendance() {
    if (!batchId || !selectedStudents.length) return
    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    const { data: organizationId, error: organizationError } = await supabase.rpc('current_user_organization_id')
    if (organizationError || !organizationId || !userData.user) { toast.error('Unable to identify your organization'); setSaving(false); return }
    const rows = selectedStudents.map((student) => ({ organization_id: organizationId, batch_id: batchId, student_id: student.id, date, status: attendance[student.id] ?? 'present', marked_by: userData.user.id }))
    const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'organization_id,batch_id,student_id,date' })
    if (error) toast.error('Unable to save attendance')
    else { toast.success('Attendance saved'); void trackProductEvent(supabase, 'attendance_recorded', { eventKey: `attendance:${batchId}:${date}`, metadata: { batch_size: selectedStudents.length } }); await loadAttendance() }
    setSaving(false)
  }

  return <div className="flex flex-col gap-6">
    <PageHeader title="Attendance" description="Track daily attendance across every batch." actions={<Button onClick={saveAttendance} disabled={saving || !selectedStudents.length}>{saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}Save attendance</Button>} />
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      <Card><CardHeader><CardTitle>Mark attendance</CardTitle><CardDescription>Attendance is private to your organization and recorded per batch and date.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4 sm:flex-row"><div className="flex flex-col gap-2"><label htmlFor="attendance-date" className="text-sm font-medium">Date</label><Input id="attendance-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div><div className="flex flex-col gap-2"><label htmlFor="attendance-batch" className="text-sm font-medium">Batch</label><select id="attendance-batch" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={batchId} onChange={(event) => setBatchId(event.target.value)}><option value="">Select a batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</select></div></CardContent></Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-base">Today&apos;s summary</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-2 text-center"><div><p className="text-xl font-bold text-primary">{summary.present}</p><p className="text-xs text-muted-foreground">Present</p></div><div><p className="text-xl font-bold">{summary.late}</p><p className="text-xs text-muted-foreground">Late</p></div><div><p className="text-xl font-bold">{summary.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div></CardContent></Card>
    </div>
    {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading attendance…</div> : !selectedBatch ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Create a batch and assign students before marking attendance.</CardContent></Card> : <Card><CardHeader><CardTitle>{selectedBatch.name}</CardTitle><CardDescription>{selectedStudents.length} assigned students · {date}</CardDescription></CardHeader><CardContent className="flex flex-col gap-2">{selectedStudents.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No students are assigned to this batch yet.</p> : selectedStudents.map((student) => { const status = attendance[student.id] ?? 'present'; return <div key={student.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-medium">{student.full_name}</p><p className="text-xs text-muted-foreground">{student.student_code}</p></div><div className="flex items-center gap-2"><Button size="sm" variant={status === 'present' ? 'default' : 'outline'} onClick={() => setStatus(student.id, 'present')}><Check data-icon="inline-start" />Present</Button><Button size="sm" variant={status === 'late' ? 'default' : 'outline'} onClick={() => setStatus(student.id, 'late')}><CalendarCheck data-icon="inline-start" />Late</Button><Button size="sm" variant={status === 'absent' ? 'destructive' : 'outline'} onClick={() => setStatus(student.id, 'absent')}><X data-icon="inline-start" />Absent</Button></div></div> })}<div className="flex items-center justify-between border-t pt-4"><Badge variant="secondary">{selectedStudents.length} students</Badge><Button onClick={saveAttendance} disabled={saving}>{saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}Save attendance</Button></div></CardContent></Card>}
  </div>
}
