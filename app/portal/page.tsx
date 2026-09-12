import { getUserContext } from '@/lib/supabase/user-context'
import { createClient } from '@/lib/supabase/server'
import { PortalHeader, StatCard, EmptyState, PortalTable, StatusPill, formatDate, money } from '@/components/portal/portal-shell'

export default async function PortalPage() {
  const context = await getUserContext(); const supabase = await createClient()
  const [{ data: links }, { data: profile }] = await Promise.all([
    supabase.from('parent_student_links').select('student_id').eq('parent_profile_id', context!.userId),
    supabase.from('profiles').select('student_id').eq('id', context!.userId).maybeSingle(),
  ])
  const ids = [...new Set([...(links ?? []).map((x) => x.student_id), ...(profile?.student_id ? [profile.student_id] : [])])]
  const { data: students } = ids.length ? await supabase.from('students').select('id,full_name,student_code').in('id', ids) : { data: [] as { id: string; full_name: string; student_code: string }[] }
  const studentIds = (students ?? []).map((s) => s.id)
  const [{ data: attendance }, { data: results }, { data: fees }] = await Promise.all([
    studentIds.length ? supabase.from('attendance').select('status').in('student_id', studentIds) : Promise.resolve({ data: [] }),
    studentIds.length ? supabase.from('results').select('student_id,marks_obtained,test_id,tests(name,subject,max_marks,test_date)').in('student_id', studentIds) : Promise.resolve({ data: [] }),
    studentIds.length ? supabase.from('student_fees').select('student_id,amount,status,due_date').in('student_id', studentIds) : Promise.resolve({ data: [] }),
  ])
  const totalAttendance = attendance?.length ?? 0; const present = attendance?.filter((x) => x.status === 'present').length ?? 0; const attendancePercent = totalAttendance ? Math.round((present / totalAttendance) * 100) : 0
  return <><PortalHeader title="Student portal" description={context!.role === 'parent' ? 'A secure view of your linked students.' : 'Your learning, attendance, and updates in one place.'} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Students linked" value={String(students?.length ?? 0)} /><StatCard label="Attendance" value={`${attendancePercent}%`} detail={`${present} present days`} /><StatCard label="Recent results" value={String(results?.length ?? 0)} /><StatCard label="Outstanding fees" value={money((fees ?? []).filter((f) => f.status !== 'paid').reduce((sum, f) => sum + Number(f.amount), 0))} /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><section><h2 className="mb-3 font-display text-lg font-semibold">Linked students</h2>{students?.length ? <PortalTable headers={['Student', 'Code']} rows={students.map((s) => [<span className="font-medium" key={s.id}>{s.full_name}</span>, s.student_code || '—'])} /> : <EmptyState text="No student profile is linked to this account yet." />}</section><section><h2 className="mb-3 font-display text-lg font-semibold">Recent results</h2>{results?.length ? <PortalTable headers={['Test', 'Score']} rows={results.slice(0, 5).map((r: any) => [<div key={r.test_id}><p className="font-medium">{r.tests?.name ?? 'Test'}</p><p className="text-xs text-muted-foreground">{r.tests?.subject ?? '—'} · {formatDate(r.tests?.test_date)}</p></div>, <StatusPill>{r.marks_obtained}/{r.tests?.max_marks ?? '—'}</StatusPill>])} /> : <EmptyState text="Published results will appear here." />}</section></div>
  </>
}
