'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Leaf, MapPin, GitMerge } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/plants', label: 'Plant Registry', icon: Leaf },
  { href: '/admin/sites', label: 'Field Sites', icon: MapPin },
  { href: '/admin/crosses', label: 'Cross Simulator', icon: GitMerge },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-medium transition-colors',
              active
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className={cn('h-4 w-4', active && 'text-primary')} />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
