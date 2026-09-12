'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { MOCK_ATTENDANCE_TREND } from '@/lib/mock-data'

const config = {
  present: { label: 'Present', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function AttendanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance This Week</CardTitle>
        <CardDescription>Students present per day</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[280px] w-full">
          <AreaChart data={MOCK_ATTENDANCE_TREND} accessibilityLayer>
            <defs>
              <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-present)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-present)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[380, 500]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="present"
              type="monotone"
              stroke="var(--color-present)"
              strokeWidth={2}
              fill="url(#fillPresent)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
