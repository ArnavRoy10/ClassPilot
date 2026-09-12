import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/app/status-badge'
import { MOCK_TODAYS_CLASSES } from '@/lib/mock-data'

export function TodaysClasses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Classes</CardTitle>
        <CardDescription>Live schedule across all batches</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {MOCK_TODAYS_CLASSES.map((slot) => (
          <div
            key={`${slot.time}-${slot.batch}`}
            className="flex items-center gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
          >
            <div className="w-14 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
              {slot.time}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{slot.subject}</p>
              <p className="truncate text-xs text-muted-foreground">
                {slot.batch} · {slot.teacher} · {slot.room}
              </p>
            </div>
            <StatusBadge status={slot.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
