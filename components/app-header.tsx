import Link from 'next/link'
import { Sprout } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="block font-heading text-lg font-semibold tracking-tight">
              TraitLinkr
            </span>
            <span className="block text-xs uppercase tracking-wide text-muted-foreground">
              Predictive Breeding
            </span>
          </div>
        </Link>
        <div className="h-9 w-9" aria-hidden="true" />
      </div>
    </header>
  )
}
