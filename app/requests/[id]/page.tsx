import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getRequest } from '@/lib/queries'
import { recommendPairs } from '@/lib/matcher'
import { PairRecommendationCard } from '@/components/pair-recommendation-card'
import { RequestStatusControl } from '@/components/request-status-control'
import { Card, CardContent } from '@/components/ui/card'
import { TRAIT_LABELS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const requestId = Number(id)
  if (Number.isNaN(requestId)) notFound()

  const request = await getRequest(requestId)
  if (!request) notFound()

  const recommendations = await recommendPairs(request.target_traits)

  return (
    <div className="space-y-6">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to requests
      </Link>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-balance">
                {request.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {request.requester_name}
                {request.org ? ` · ${request.org}` : ''}
                {request.region ? ` · ${request.region}` : ''}
              </p>
            </div>
            <RequestStatusControl id={request.id} status={request.status} />
          </div>
          {request.description ? (
            <p className="text-sm text-pretty text-muted-foreground">
              {request.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {request.target_traits.map((t) => (
              <span
                key={t.trait}
                className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {TRAIT_LABELS[t.trait] ?? t.trait}: target {t.target}
                {t.weight !== 1 ? ` (weight ${t.weight})` : ''}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Recommended parent pairs
        </h2>
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Not enough germplasm data to generate recommendations yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec, i) => (
              <PairRecommendationCard
                key={`${rec.parentA.id}-${rec.parentB.id}`}
                rank={i + 1}
                rec={rec}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
