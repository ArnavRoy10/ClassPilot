import type { Metadata } from 'next'
import { PageHeader } from '@/components/app/page-header'
import { DemoBanner } from '@/components/app/demo-banner'
import { StatCards } from '@/components/app/stat-cards'
import { FeeCollectionChart } from '@/components/app/fee-collection-chart'
import { AttendanceChart } from '@/components/app/attendance-chart'
import { TodaysClasses } from '@/components/app/todays-classes'
import { ActivityFeed } from '@/components/app/activity-feed'
import { OnboardingChecklist, type ActivationStep } from '@/components/app/onboarding-checklist'
import { ActivationFeedback } from '@/components/app/activation-feedback'
import { getUserContext } from '@/lib/supabase/user-context'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default async function DashboardPage() {
  const userContext = await getUserContext()
  const supabase = await createClient()
  const organizationId = userContext?.organization.id

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 6)

  const empty = {
    studentCount: 0, teacherCount: 0, batchCount: 0,
    productEvents: [] as { event_name: string; occurred_at: string }[],
    todayAttendance: [] as { status: string }[],
    weekAttendance: [] as { status: string; date: string }[],
    pendingFees: [] as { amount: number }[],
    monthPayments: [] as { amount: number; payment_date: string }[],
    sixMonthPayments: [] as { amount: number; payment_date: string }[],
    todaySchedules: [] as { start_time: string; subject: string | null; room: string | null; batches: { name: string } | { name: string }[] | null; teachers: { full_name: string } | { full_name: string }[] | null }[],
  }

  const result = organizationId
    ? await (async () => {
        const [
          { count: studentCount },
          { count: teacherCount },
          { count: batchCount },
          { data: productEvents },
          { data: todayAttendance },
          { data: weekAttendance },
          { data: pendingFees },
          { data: monthPayments },
          { data: sixMonthPayments },
          { data: todaySchedules },
        ] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
          supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
          supabase.from('batches').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
          supabase.from('product_events').select('event_name, occurred_at').eq('organization_id', organizationId).order('occurred_at', { ascending: false }).limit(6),
          supabase.from('attendance').select('status').eq('organization_id', organizationId).eq('date', todayStr),
          supabase.from('attendance').select('status, date').eq('organization_id', organizationId).gte('date', weekAgo.toISOString().slice(0, 10)),
          supabase.from('student_fees').select('amount').eq('organization_id', organizationId).neq('status', 'paid'),
          supabase.from('payments').select('amount, payment_date, student_fees!inner(organization_id)').eq('student_fees.organization_id', organizationId).gte('payment_date', monthStart),
          supabase.from('payments').select('amount, payment_date, student_fees!inner(organization_id)').eq('student_fees.organization_id', organizationId).gte('payment_date', sixMonthsAgo.toISOString()),
          supabase.from('schedules').select('start_time, subject, room, batches(name), teachers(full_name)').eq('organization_id', organizationId).eq('day_of_week', today.getDay()).order('start_time'),
        ])
        return { studentCount: studentCount ?? 0, teacherCount: teacherCount ?? 0, batchCount: batchCount ?? 0, productEvents: productEvents ?? [], todayAttendance: todayAttendance ?? [], weekAttendance: weekAttendance ?? [], pendingFees: pendingFees ?? [], monthPayments: monthPayments ?? [], sixMonthPayments: sixMonthPayments ?? [], todaySchedules: todaySchedules ?? [] }
      })()
    : empty

  const attendanceRate = result.todayAttendance.length > 0
    ? Math.round((result.todayAttendance.filter((a) => a.status === 'present').length / result.todayAttendance.length) * 100)
    : null

  const pendingFeesTotal = result.pendingFees.reduce((sum, fee) => sum + Number(fee.amount), 0)
  const monthlyCollected = result.monthPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)

  const feeChartData = Array.from({ length: 6 }).map((_, index) => {
    const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + index, 1)
    const label = d.toLocaleString('en-US', { month: 'short' })
    const collected = result.sixMonthPayments
      .filter((payment) => {
        const paymentDate = new Date(payment.payment_date)
        return paymentDate.getFullYear() === d.getFullYear() && paymentDate.getMonth() === d.getMonth()
      })
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
    return { month: label, collected }
  })

  const attendanceChartData = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(weekAgo)
    d.setDate(d.getDate() + index)
    const dateStr = d.toISOString().slice(0, 10)
    const dayRows = result.weekAttendance.filter((row) => row.date === dateStr)
    return {
      day: WEEKDAY_LABELS[d.getDay()],
      present: dayRows.filter((r) => r.status === 'present').length,
      absent: dayRows.filter((r) => r.status !== 'present').length,
    }
  })

  const todaysClasses = result.todaySchedules.map((slot) => {
    const batch = Array.isArray(slot.batches) ? slot.batches[0] : slot.batches
    const teacher = Array.isArray(slot.teachers) ? slot.teachers[0] : slot.teachers
    return { time: slot.start_time?.slice(0, 5) ?? '', batch: batch?.name ?? 'Batch', subject: slot.subject ?? '', teacher: teacher?.full_name ?? 'Unassigned', room: slot.room ?? '—' }
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back — here's what's happening at ${userContext?.organization.name ?? 'your organization'} today.`}
      />
      <DemoBanner />
      {userContext && <OnboardingChecklist organizationName={userContext.organization.name} daysSinceCreated={0} steps={[
        { id: 'teacher', label: 'Add your first teacher', description: 'Build your teaching team.', href: '/teachers', complete: result.teacherCount > 0 },
        { id: 'batch', label: 'Create a batch or class', description: 'Give your workspace a rhythm.', href: '/batches', complete: result.batchCount > 0 },
        { id: 'student', label: 'Enroll your first student', description: 'Start your student roster.', href: '/students', complete: result.studentCount > 0 },
        { id: 'attendance', label: 'Record attendance once', description: 'See daily operations come alive.', href: '/attendance', complete: result.todayAttendance.length > 0 || result.productEvents.some((event) => event.event_name === 'attendance_recorded') },
      ] as ActivationStep[]} />}
      {userContext && <ActivationFeedback />}
      <StatCards studentCount={result.studentCount} attendanceRate={attendanceRate} pendingFeesTotal={pendingFeesTotal} monthlyCollected={monthlyCollected} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <FeeCollectionChart data={feeChartData} />
        <AttendanceChart data={attendanceChartData} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TodaysClasses classes={todaysClasses} />
        <ActivityFeed events={result.productEvents} />
      </div>
    </div>
  )
}
