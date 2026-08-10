import { cn } from '@/lib/utils'
import type { BreedingRequest } from '@/lib/types'

// Shared status -> earthy color mapping used across the dashboard, request
// list, and request detail views.
const STATUS_STYLES: Record<BreedingRequest['status'], string> = {
  open: 'bg-chart-3/15 text-chart-3 ring-1 ring-inset ring-chart-3/30',
  matched: 'bg-primary/12 text-primary ring-1 ring-inset ring-primary/25',
  closed: 'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
}

export function RequestStatusBadge({
  status,
  className,
}: {
  status: BreedingRequest['status']
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
