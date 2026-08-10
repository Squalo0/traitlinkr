import Link from 'next/link'
import { ArrowRight, MapPinned, Sprout, Wheat } from 'lucide-react'
import { getSession } from '@/lib/auth'

export default async function HomePage() {
  const session = await getSession()

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sprout className="h-5 w-5" /></span>
            <span className="font-heading text-lg font-semibold">TraitLinkr</span>
          </Link>
          <div className="flex items-center gap-2">
            {session ? <Link className="text-sm font-medium text-primary hover:underline" href="/admin">Open workspace</Link> : <><Link className="text-sm font-medium text-muted-foreground hover:text-foreground" href="/auth/sign-in">Sign in</Link><Link className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/auth/sign-up">Create account</Link></>}
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div className="space-y-7">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">A field notebook for better breeding decisions</p>
          <h1 className="max-w-3xl font-heading text-5xl leading-[1.02] tracking-tight text-balance sm:text-7xl">Connect traits to the next generation.</h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">TraitLinkr helps breeding teams organize plants, read field context, simulate crosses, and coordinate requests in one calm workspace.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={session ? '/admin' : '/auth/sign-up'} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary/90">{session ? 'Open workspace' : 'Get started'} <ArrowRight className="h-4 w-4" /></Link>
            <Link href={session ? '/requests' : '/auth/sign-in'} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 font-medium hover:bg-secondary">Submit a breeding request</Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:translate-y-8"><Wheat className="mb-12 h-6 w-6 text-primary" /><p className="font-heading text-2xl">Trace the traits</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Keep phenotype goals and parent material connected.</p></div>
          <div className="rounded-xl border border-border bg-secondary p-6 sm:-translate-y-8"><MapPinned className="mb-12 h-6 w-6 text-accent" /><p className="font-heading text-2xl">Know the field</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Make site conditions part of every breeding decision.</p></div>
        </div>
      </section>
    </main>
  )
}
