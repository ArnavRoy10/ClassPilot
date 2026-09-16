import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type ClassSlot = { time: string; batch: string; subject: string; teacher: string; room: string }

export function TodaysClasses({ classes }: { classes: ClassSlot[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Classes</CardTitle>
        <CardDescription>Live schedule across all batches</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {classes.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No classes scheduled for today</p>}
        {classes.map((slot) => (
          <div key={`${slot.time}-${slot.batch}`} className="flex items-center gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60">
            <div className="w-14 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">{slot.time}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{slot.subject || 'Class'}</p>
              <p className="truncate text-xs text-muted-foreground">{slot.batch} · {slot.teacher} · {slot.room}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
