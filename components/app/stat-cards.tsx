import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_STATS } from '@/lib/mock-data'

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {MOCK_STATS.map((stat) => {
        const Icon = stat.trend === 'up' ? TrendingUp : TrendingDown
        const positive = stat.trend === 'up'
        return (
          <Card key={stat.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tracking-tight">{stat.value}</span>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 font-medium',
                    positive ? 'text-success' : 'text-destructive',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {stat.delta}
                </span>
                <span className="text-muted-foreground">{stat.hint}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
