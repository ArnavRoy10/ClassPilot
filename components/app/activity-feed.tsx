import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MOCK_ACTIVITY } from '@/lib/mock-data'

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across your academy</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {MOCK_ACTIVITY.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials(item.actor)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className="font-medium">{item.actor}</span>{' '}
                <span className="text-muted-foreground">{item.action}</span>{' '}
                <span className="font-medium">{item.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
