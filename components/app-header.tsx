'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sprout } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function AppHeader() {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  async function signOut() {
    await authClient.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="block font-heading text-lg font-semibold tracking-tight">TraitLinkr</span>
            <span className="block text-xs uppercase tracking-wide text-muted-foreground">Predictive Breeding</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {session?.user?.email && <span className="hidden text-sm text-muted-foreground sm:block">{session.user.email}</span>}
          <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    </header>
  )
}
