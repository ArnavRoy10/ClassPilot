import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  // fee statuses
  paid: 'border-transparent bg-success/12 text-success',
  partial: 'border-transparent bg-warning/15 text-warning',
  due: 'border-transparent bg-destructive/12 text-destructive',
  // people / batch statuses
  active: 'border-transparent bg-success/12 text-success',
  'on leave': 'border-transparent bg-warning/15 text-warning',
  // test statuses
  completed: 'border-transparent bg-success/12 text-success',
  grading: 'border-transparent bg-warning/15 text-warning',
  scheduled: 'border-transparent bg-primary/12 text-primary',
  // class statuses
  ongoing: 'border-transparent bg-success/12 text-success',
  upcoming: 'border-transparent bg-primary/12 text-primary',
  done: 'border-transparent bg-muted text-muted-foreground',
}

const labels: Record<string, string> = {
  paid: 'Paid',
  partial: 'Partial',
  due: 'Due',
  active: 'Active',
  'on leave': 'On leave',
  completed: 'Completed',
  grading: 'Grading',
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  upcoming: 'Upcoming',
  done: 'Done',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium capitalize', styles[status])}>
      {labels[status] ?? status}
    </Badge>
  )
}
