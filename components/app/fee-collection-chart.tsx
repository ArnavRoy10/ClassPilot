'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { MOCK_FEE_COLLECTION } from '@/lib/mock-data'

const config = {
  collected: { label: 'Collected', color: 'var(--chart-1)' },
  target: { label: 'Target', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function FeeCollectionChart() {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Fee Collection</CardTitle>
        <CardDescription>Collected vs. target over the last 6 months (₹)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[280px] w-full">
          <BarChart data={MOCK_FEE_COLLECTION} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="var(--color-target)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
