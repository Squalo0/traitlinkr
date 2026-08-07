'use client'

import { Dna, Gauge, Sigma } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TRAIT_LABELS, type PredictedTrait } from '@/lib/types'

export interface PredictionResult {
  parentA: { id: number; name: string; code: string }
  parentB: { id: number; name: string; code: string }
  predicted: PredictedTrait[]
  similarity: number
  confidence: number
  bagging: { samples: number; spread: number }
}

function confidenceColor(v: number) {
  if (v >= 75) return 'text-primary'
  if (v >= 50) return 'text-chart-2'
  return 'text-destructive'
}

export function PredictionResultView({ result }: { result: PredictionResult }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Metric
          icon={Dna}
          label="Genomic Similarity"
          value={`${result.similarity}%`}
          hint="SNP allele overlap"
        />
        <Metric
          icon={Gauge}
          label="Confidence"
          value={`${result.confidence}%`}
          hint={`bagging · ${result.bagging.samples} samples`}
          valueClass={confidenceColor(result.confidence)}
        />
        <Metric
          icon={Sigma}
          label="Prediction Spread"
          value={`±${result.bagging.spread}%`}
          hint="mean interval width"
        />
      </div>

      <div className="space-y-4">
        {result.predicted.map((t) => (
          <TraitBar key={t.trait} trait={t} />
        ))}
      </div>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  valueClass,
}: {
  icon: typeof Dna
  label: string
  value: string
  hint: string
  valueClass?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={`mt-1 font-mono text-xl font-semibold tabular-nums ${valueClass ?? ''}`}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function TraitBar({ trait }: { trait: PredictedTrait }) {
  const lo = Math.min(trait.parentA, trait.parentB, trait.low)
  const hi = Math.max(trait.parentA, trait.parentB, trait.high)
  const range = hi - lo || 1
  const pos = (v: number) => ((v - lo) / range) * 100

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium">
          {TRAIT_LABELS[trait.trait] ?? trait.trait}
        </span>
        <span className="font-mono text-sm">
          <span className="font-semibold">{trait.predicted}</span>
          {trait.unit ? (
            <span className="ml-1 text-xs text-muted-foreground">
              {trait.unit}
            </span>
          ) : null}
          <span className="ml-2 text-xs text-muted-foreground">
            [{trait.low}–{trait.high}]
          </span>
        </span>
      </div>
      <div className="relative h-8 rounded-md bg-muted">
        {/* prediction interval band */}
        <div
          className="absolute top-1/2 h-4 -translate-y-1/2 rounded bg-primary/20"
          style={{
            left: `${pos(trait.low)}%`,
            width: `${pos(trait.high) - pos(trait.low)}%`,
          }}
        />
        {/* parent A marker */}
        <ParentMarker left={pos(trait.parentA)} label="A" tone="muted" />
        {/* parent B marker */}
        <ParentMarker left={pos(trait.parentB)} label="B" tone="muted" />
        {/* predicted marker */}
        <div
          className="absolute top-1/2 z-10 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pos(trait.predicted)}%` }}
          title={`Predicted: ${trait.predicted}`}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>Parent A: {trait.parentA}</span>
        <span>Parent B: {trait.parentB}</span>
      </div>
    </div>
  )
}

function ParentMarker({
  left,
  label,
  tone,
}: {
  left: number
  label: string
  tone: 'muted'
}) {
  return (
    <div
      className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      style={{ left: `${left}%` }}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card text-[9px] font-semibold text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export { Badge }
