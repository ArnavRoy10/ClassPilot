'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const config = {
  collected: { label: 'Collected', color: 'var(--chart-1)' },
} satisfies ChartConfig

type MonthPoint = { month: string; collected: number }

export function FeeCollectionChart({ data }: { data: MonthPoint[] }) {
  const hasData = data.some((point) => point.collected > 0)
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Fee Collection</CardTitle>
        <CardDescription>Collected over the last 6 months (₹)</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={config} className="h-[280px] w-full">
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />} />
              <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
            No fee collections recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
