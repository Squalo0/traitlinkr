'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FlaskConical, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RoleSwitcher() {
  const pathname = usePathname()
  const isRequester = pathname.startsWith('/requests')
  const role: 'admin' | 'requester' = isRequester ? 'requester' : 'admin'

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
      <Link
        href="/admin"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          role === 'admin'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <FlaskConical className="h-4 w-4" />
        Breeder
      </Link>
      <Link
        href="/requests"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          role === 'requester'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Users className="h-4 w-4" />
        Requester
      </Link>
    </div>
  )
}
