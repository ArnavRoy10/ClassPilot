import { Users, CalendarCheck, Wallet, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StatCardsProps = {
  studentCount: number
  attendanceRate: number | null
  pendingFeesTotal: number
  monthlyCollected: number
}

export function StatCards({ studentCount, attendanceRate, pendingFeesTotal, monthlyCollected }: StatCardsProps) {
  const stats = [
    { key: 'students', label: 'Total Students', value: String(studentCount), icon: Users, hint: studentCount === 0 ? 'No students yet' : 'enrolled' },
    { key: 'attendance', label: "Today's Attendance", value: attendanceRate === null ? '—' : `${attendanceRate}%`, icon: CalendarCheck, hint: attendanceRate === null ? 'No attendance recorded today' : 'marked today' },
    { key: 'dues', label: 'Pending Fees', value: `₹${pendingFeesTotal.toLocaleString('en-IN')}`, icon: GraduationCap, hint: pendingFeesTotal === 0 ? 'All caught up' : 'outstanding' },
    { key: 'revenue', label: 'Collected This Month', value: `₹${monthlyCollected.toLocaleString('en-IN')}`, icon: Wallet, hint: 'this calendar month' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-3xl font-semibold tracking-tight">{stat.value}</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <stat.icon className="size-3.5" aria-hidden />
              {stat.hint}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
