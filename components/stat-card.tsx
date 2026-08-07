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
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tabular-nums leading-none">
            {value}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
          {hint ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground/80">
              {hint}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
