import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type Activity = { id: string; label: string; time: string }

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function ActivityFeed({ events }: { events: { event_name: string; occurred_at: string }[] }) {
  const activities: Activity[] = events.map((event, index) => ({
    id: String(index),
    label: event.event_name.replace(/_/g, ' '),
    time: timeAgo(event.occurred_at),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across your academy</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {activities.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No activity yet — actions you take will show up here</p>}
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Avatar className="size-8"><AvatarFallback className="text-xs">•</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm capitalize leading-snug">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
