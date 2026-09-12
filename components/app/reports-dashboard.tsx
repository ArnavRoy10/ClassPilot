'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

type Props = { organizationId: string; role: string }
type RangeKey = 'today' | 'week' | 'month' | 'last_month' | 'custom'
type AttendanceRow = { date: string; status: 'present' | 'absent' | 'late'; student_id: string; batch_id: string }
type FeeRow = { amount: number; status: string; due_date: string; student_id: string; id: string }
type PaymentRow = { student_fee_id: string; amount: number; payment_date: string }
type ResultRow = { marks_obtained: number; student_id: string; test_id: string }
type TestRow = { id: string; subject: string; test_date: string; max_marks: number; batch_id: string }
type BatchRow = { id: string; name: string }
type StudentRow = { id: string; full_name: string; batch: string | null }

const chartConfig = { count: { label: 'Attendance', color: 'var(--chart-1)' } } satisfies ChartConfig

function getRange(key: RangeKey, customStart: string, customEnd: string) {
  const now = new Date()
  const end = customEnd || now.toISOString().slice(0, 10)
  if (key === 'custom') return { start: customStart || end, end }
  const start = new Date(now)
  if (key === 'today') return { start: end, end }
  if (key === 'week') start.setDate(now.getDate() - 6)
  if (key === 'month') start.setDate(1)
  if (key === 'last_month') { start.setMonth(now.getMonth() - 1, 1); now.setDate(0); return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) } }
  return { start: start.toISOString().slice(0, 10), end }
}

function csvEscape(value: unknown) { return `"${String(value ?? '').replaceAll('"', '""')}"` }
function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return toast.info('There is no report data to export')
  const headers = Object.keys(rows[0])
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url)
}

export function ReportsDashboard({ organizationId, role }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const canSeeFinance = role === 'owner' || role === 'admin'
  const [rangeKey, setRangeKey] = useState<RangeKey>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [teachersCount, setTeachersCount] = useState(0)
  const [batches, setBatches] = useState<BatchRow[]>([])
  const [attendance, setAttendance] = useState<AttendanceRow[]>([])
  const [fees, setFees] = useState<FeeRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [tests, setTests] = useState<TestRow[]>([])
  const [results, setResults] = useState<ResultRow[]>([])

  const load = useCallback(async () => {
    setRefreshing(true)
    const { start, end } = getRange(rangeKey, customStart, customEnd)
    const requests = [
      supabase.from('students').select('id,full_name,batch').order('full_name'),
      supabase.from('teachers').select('id', { count: 'exact', head: true }),
      supabase.from('batches').select('id,name').order('name'),
      supabase.from('attendance').select('date,status,student_id,batch_id').gte('date', start).lte('date', end),
      canSeeFinance ? supabase.from('student_fees').select('id,amount,status,due_date,student_id') : Promise.resolve({ data: [], error: null }),
      canSeeFinance ? supabase.from('payments').select('student_fee_id,amount,payment_date') : Promise.resolve({ data: [], error: null }),
      supabase.from('tests').select('id,subject,test_date,max_marks,batch_id').gte('test_date', start).lte('test_date', end),
      supabase.from('results').select('marks_obtained,student_id,test_id'),
    ] as const
    const [studentResult, teacherResult, batchResult, attendanceResult, feeResult, paymentResult, testResult, resultResult] = await Promise.all(requests)
    if (studentResult.error || teacherResult.error || batchResult.error || attendanceResult.error || testResult.error || resultResult.error || ('error' in feeResult && feeResult.error) || ('error' in paymentResult && paymentResult.error)) toast.error('Unable to load reports')
    setStudents((studentResult.data ?? []) as StudentRow[])
    setTeachersCount(teacherResult.count ?? 0)
    setBatches((batchResult.data ?? []) as BatchRow[])
    setAttendance((attendanceResult.data ?? []) as AttendanceRow[])
    setFees((feeResult.data ?? []) as FeeRow[])
    setPayments((paymentResult.data ?? []) as PaymentRow[])
    setTests((testResult.data ?? []) as TestRow[])
    setResults((resultResult.data ?? []) as ResultRow[])
    setLoading(false); setRefreshing(false)
  }, [canSeeFinance, customEnd, customStart, rangeKey, supabase])

  useEffect(() => { void load() }, [load])

  const attendanceCounts = useMemo(() => attendance.reduce((acc, row) => { acc[row.status] += 1; return acc }, { present: 0, absent: 0, late: 0 }), [attendance])
  const attendanceRate = attendance.length ? Math.round(((attendanceCounts.present + attendanceCounts.late) / attendance.length) * 100) : 0
  const feeTotals = useMemo(() => { const paidByFee = payments.reduce<Record<string, number>>((acc, payment) => { acc[payment.student_fee_id] = (acc[payment.student_fee_id] ?? 0) + (Number(payment.amount) || 0); return acc }, {}); return fees.reduce((acc, row) => { const expected = Number(row.amount) || 0; const collected = paidByFee[row.id] ?? 0; acc.expected += expected; acc.collected += collected; acc.pending += Math.max(expected - collected, 0); if (row.status === 'overdue') acc.overdue += Math.max(expected - collected, 0); if (row.status === 'partially_paid') acc.partial += Math.min(collected, expected); return acc }, { expected: 0, collected: 0, pending: 0, overdue: 0, partial: 0 }) }, [fees, payments])
  const performance = useMemo(() => { const scores = results.map((row) => Number(row.marks_obtained)).filter(Number.isFinite); return { average: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0, highest: scores.length ? Math.max(...scores) : 0, lowest: scores.length ? Math.min(...scores) : 0 } }, [results])
  const batchRows = useMemo(() => batches.map((batch) => { const ids = new Set(students.filter((student) => student.batch === batch.name).map((student) => student.id)); const rows = attendance.filter((row) => row.batch_id === batch.id); const testsForBatch = tests.filter((test) => test.batch_id === batch.id); const batchResults = results.filter((result) => testsForBatch.some((test) => test.id === result.test_id)); return { name: batch.name, students: ids.size, attendance: rows.length ? Math.round((rows.filter((row) => row.status !== 'absent').length / rows.length) * 100) : 0, tests: testsForBatch.length, performance: batchResults.length ? Math.round(batchResults.reduce((sum, row) => sum + Number(row.marks_obtained), 0) / batchResults.length) : 0 } }), [attendance, batches, results, students, tests])
  const chartData = [{ label: 'Present', count: attendanceCounts.present }, { label: 'Late', count: attendanceCounts.late }, { label: 'Absent', count: attendanceCounts.absent }]

  if (loading) return <div className="rounded-xl border border-border/70 bg-card p-8 text-sm text-muted-foreground">Loading organization reports…</div>

  return <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-medium">Report window</p><p className="text-xs text-muted-foreground">All values are scoped to your organization and current access level.</p></div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">Range<select value={rangeKey} onChange={(event) => setRangeKey(event.target.value as RangeKey)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"><option value="today">Today</option><option value="week">This week</option><option value="month">This month</option><option value="last_month">Last month</option><option value="custom">Custom</option></select></label>
        {rangeKey === 'custom' && <><label className="flex flex-col gap-1 text-xs text-muted-foreground">From<input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" /></label><label className="flex flex-col gap-1 text-xs text-muted-foreground">To<input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" /></label></>}
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={refreshing}><RefreshCw data-icon="inline-start" />{refreshing ? 'Refreshing' : 'Refresh'}</Button>
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['Total students', students.length], ['Total teachers', teachersCount], ['Total batches', batches.length], ['Attendance rate', `${attendanceRate}%`], ['Fees collected', canSeeFinance ? `₹${feeTotals.collected.toLocaleString('en-IN')}` : 'Restricted'], ['Fees pending', canSeeFinance ? `₹${feeTotals.pending.toLocaleString('en-IN')}` : 'Restricted'], ['Tests conducted', tests.length], ['Average marks', performance.average.toFixed(1)]].map(([label, value]) => <Card key={String(label)}><CardHeader className="pb-2"><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>)}
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Attendance overview</CardTitle><CardDescription>{attendance.length} attendance records in the selected window.</CardDescription></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[260px] w-full"><BarChart data={chartData} accessibilityLayer><CartesianGrid vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="count" fill="var(--color-count)" radius={4} /></BarChart></ChartContainer><div className="grid grid-cols-3 gap-3 text-center text-sm"><div><p className="font-semibold">{attendanceCounts.present}</p><p className="text-muted-foreground">Present</p></div><div><p className="font-semibold">{attendanceCounts.late}</p><p className="text-muted-foreground">Late</p></div><div><p className="font-semibold">{attendanceCounts.absent}</p><p className="text-muted-foreground">Absent</p></div></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Academic performance</CardTitle><CardDescription>Results visible to your role in the selected window.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-3 gap-3"><div><p className="text-2xl font-semibold">{performance.average.toFixed(1)}</p><p className="text-sm text-muted-foreground">Average</p></div><div><p className="text-2xl font-semibold">{performance.highest.toFixed(1)}</p><p className="text-sm text-muted-foreground">Highest</p></div><div><p className="text-2xl font-semibold">{performance.lowest.toFixed(1)}</p><p className="text-sm text-muted-foreground">Lowest</p></div></div><div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-sm"><span>Tests conducted</span><span className="font-medium">{tests.length}</span></div><div className="flex items-center justify-between text-sm"><span>Results recorded</span><span className="font-medium">{results.length}</span></div><Button className="mt-6" variant="outline" size="sm" onClick={() => downloadCsv('classpilot-results.csv', results.map((row) => ({ test_id: row.test_id, student_id: row.student_id, marks_obtained: row.marks_obtained })))}><Download data-icon="inline-start" />Export results</Button></CardContent></Card>
    </div>
    {canSeeFinance && <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Fees overview</CardTitle><CardDescription>Financial data is visible to owners and admins only.</CardDescription></div><Button variant="outline" size="sm" onClick={() => downloadCsv('classpilot-fees.csv', fees)}><Download data-icon="inline-start" />Export fees</Button></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[['Expected', feeTotals.expected], ['Collected', feeTotals.collected], ['Pending', feeTotals.pending], ['Overdue', feeTotals.overdue], ['Partially paid', feeTotals.partial]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-border/70 p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">₹{Number(value).toLocaleString('en-IN')}</p></div>)}</div></CardContent></Card>}
    <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Batch overview</CardTitle><CardDescription>Student counts, attendance, tests, and performance by batch.</CardDescription></div><Button variant="outline" size="sm" onClick={() => downloadCsv('classpilot-batches.csv', batchRows)}><Download data-icon="inline-start" />Export batches</Button></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border/70 text-left text-muted-foreground"><th className="px-3 py-2 font-medium">Batch</th><th className="px-3 py-2 font-medium">Students</th><th className="px-3 py-2 font-medium">Attendance</th><th className="px-3 py-2 font-medium">Tests</th><th className="px-3 py-2 font-medium">Avg marks</th></tr></thead><tbody>{batchRows.map((row) => <tr key={row.name} className="border-b border-border/50 last:border-0"><td className="px-3 py-3 font-medium">{row.name}</td><td className="px-3 py-3">{row.students}</td><td className="px-3 py-3">{row.attendance}%</td><td className="px-3 py-3">{row.tests}</td><td className="px-3 py-3">{row.performance}</td></tr>)}</tbody></table></div></CardContent></Card>
  </div>
}
