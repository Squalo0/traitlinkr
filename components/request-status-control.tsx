'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { setRequestStatus } from '@/app/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { BreedingRequest } from '@/lib/types'

const STATUS_OPTIONS: BreedingRequest['status'][] = ['open', 'matched', 'closed']

const STATUS_DOT: Record<BreedingRequest['status'], string> = {
  open: 'bg-chart-3',
  matched: 'bg-primary',
  closed: 'bg-muted-foreground',
}

export function RequestStatusControl({
  id,
  status,
}: {
  id: number
  status: BreedingRequest['status']
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  async function handleChange(next: BreedingRequest['status'] | null) {
    if (!next) return
    setUpdating(true)
    try {
      await setRequestStatus(id, next)
      toast.success(`Marked as ${next}`)
      router.refresh()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : null}
      <Select value={status} onValueChange={handleChange} disabled={updating}>
        <SelectTrigger size="sm" className="w-32 capitalize">
          <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', STATUS_DOT[status])} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt} className="capitalize">
              <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', STATUS_DOT[opt])} />
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
