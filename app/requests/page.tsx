import Link from 'next/link'
import { ArrowRight, Inbox } from 'lucide-react'
import { getRequests } from '@/lib/queries'
import { RequestForm } from '@/components/request-form'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TRAIT_LABELS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
  const requests = await getRequests()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Breeding Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Submit the traits you&apos;re looking for and get ranked parent-pair
          recommendations from the germplasm registry.
        </p>
      </div>

      <RequestForm />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {requests.length} request{requests.length === 1 ? '' : 's'}
        </h2>
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Inbox className="h-6 w-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                No requests submitted yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {requests.map((r) => (
              <Link key={r.id} href={`/requests/${r.id}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight text-pretty">
                        {r.title}
                      </p>
                      <Badge
                        variant={r.status === 'open' ? 'default' : 'secondary'}
                        className="shrink-0 capitalize"
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.requester_name}
                      {r.org ? ` · ${r.org}` : ''}
                      {r.region ? ` · ${r.region}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {r.target_traits.slice(0, 3).map((t) => (
                        <span
                          key={t.trait}
                          className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {TRAIT_LABELS[t.trait] ?? t.trait}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 pt-1 text-xs font-medium text-primary">
                      View recommendations
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
