import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { RoleSwitcher } from './role-switcher'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="block font-semibold tracking-tight">TraitLinkr</span>
            <span className="block text-xs text-muted-foreground">
              Predictive Breeding
            </span>
          </div>
        </Link>
        <RoleSwitcher />
      </div>
    </header>
  )
}
