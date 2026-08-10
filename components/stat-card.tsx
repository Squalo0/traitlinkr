import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
}) {
  return (
    <Card className="relative overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1 bg-primary/70"
      />
      <CardContent className="space-y-2.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <Icon className="h-4 w-4 shrink-0 text-accent-foreground/70" />
        </div>
        <p className="font-heading text-3xl font-semibold tabular-nums leading-none text-foreground">
          {value}
        </p>
        {hint ? (
          <p className="truncate text-xs text-muted-foreground/80">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
