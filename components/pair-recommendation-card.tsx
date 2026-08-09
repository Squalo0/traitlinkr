import { Dna, Gauge } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TRAIT_LABELS, type PairRecommendation } from '@/lib/types'

function scoreColor(v: number) {
  if (v >= 75) return 'bg-primary'
  if (v >= 50) return 'bg-chart-2'
  return 'bg-destructive'
}

export function PairRecommendationCard({
  rank,
  rec,
}: {
  rank: number
  rec: PairRecommendation
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              #{rank} {rec.parentA.accession_code} × {rec.parentB.accession_code}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {rec.parentA.name} × {rec.parentB.name}
            </p>
          </div>
          <Badge className="shrink-0 font-mono text-sm">{rec.score}% match</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              Goal fit
            </span>
            <span className="font-mono">{rec.score}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${scoreColor(rec.score)}`}
              style={{ width: `${Math.min(rec.score, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Dna className="h-3.5 w-3.5" />
            Genomic similarity{' '}
            <span className="font-mono text-foreground">{rec.genomicSimilarity}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge className="h-3.5 w-3.5" />
            Confidence{' '}
            <span className="font-mono text-foreground">{rec.confidence}%</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {rec.predictedTraits.map((t) => (
            <span
              key={t.trait}
              className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {TRAIT_LABELS[t.trait] ?? t.trait}: {t.predicted}
              {t.unit ? ` ${t.unit}` : ''}
            </span>
          ))}
        </div>

        <ul className="space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
          {rec.rationale.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
