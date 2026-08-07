import type {
  CrossModel,
  Marker,
  PlantDetail,
  PlantTrait,
  PredictedTrait,
  TargetTrait,
} from './types'
import { LOWER_IS_BETTER } from './types'

/**
 * Genomic similarity between two plants based on shared SNP alleles.
 * Each marker is compared allele-by-allele (order-independent). Returns a
 * 0-100 percentage. Higher similarity => lower expected hybrid vigor
 * (heterosis), which the additive-dominance model uses.
 */
export function genomicSimilarity(a: Marker[], b: Marker[]): number {
  const byMarkerB = new Map(b.map((m) => [m.marker, m.allele]))
  const shared = a.filter((m) => byMarkerB.has(m.marker))
  if (shared.length === 0) return 0

  let score = 0
  for (const m of shared) {
    const allelesA = m.allele.split('/').sort()
    const allelesB = (byMarkerB.get(m.marker) as string).split('/').sort()
    // 1.0 if identical genotype, 0.5 if one allele shared, 0 if none
    const match =
      allelesA[0] === allelesB[0] && allelesA[1] === allelesB[1]
        ? 1
        : allelesA.some((x) => allelesB.includes(x))
          ? 0.5
          : 0
    score += match
  }
  return Math.round((score / shared.length) * 1000) / 10
}

/** Heterosis (hybrid vigor) factor: more divergent parents => bigger boost. */
function heterosisFactor(similarity: number): number {
  // 0% similarity -> +8% boost, 100% similarity -> 0% boost
  return (1 - similarity / 100) * 0.08
}

function traitMap(traits: PlantTrait[]): Map<string, PlantTrait> {
  return new Map(traits.map((t) => [t.trait, t]))
}

/**
 * Predict offspring trait values for a cross under the chosen model.
 * - mid_parent: average of the two parents (classic quantitative genetics)
 * - best_parent: leans toward the superior parent for each trait
 * - additive_dominance: mid-parent plus a heterosis boost scaled by genomic
 *   divergence, capturing hybrid vigor
 */
export function predictCross(
  parentA: PlantDetail,
  parentB: PlantDetail,
  model: CrossModel,
): { predicted: PredictedTrait[]; similarity: number; confidence: number; bagging: { samples: number; spread: number } } {
  const similarity = genomicSimilarity(parentA.markers, parentB.markers)
  const mapA = traitMap(parentA.traits)
  const mapB = traitMap(parentB.traits)
  const traitNames = new Set([...mapA.keys(), ...mapB.keys()])
  const boost = heterosisFactor(similarity)

  const predicted: PredictedTrait[] = []
  for (const trait of traitNames) {
    const ta = mapA.get(trait)
    const tb = mapB.get(trait)
    if (!ta || !tb) continue
    const va = ta.value
    const vb = tb.value
    const mid = (va + vb) / 2
    const lowerBetter = LOWER_IS_BETTER.has(trait)

    let base: number
    if (model === 'mid_parent') {
      base = mid
    } else if (model === 'best_parent') {
      const best = lowerBetter ? Math.min(va, vb) : Math.max(va, vb)
      // 70% toward best parent, 30% mid-parent
      base = best * 0.7 + mid * 0.3
    } else {
      // additive_dominance: mid-parent + heterosis
      base = lowerBetter ? mid * (1 - boost) : mid * (1 + boost)
    }

    predicted.push({
      trait,
      unit: ta.unit ?? tb.unit,
      parentA: va,
      parentB: vb,
      predicted: Math.round(base * 100) / 100,
      low: base,
      high: base,
    })
  }

  // Bagging: bootstrap-style resampling with per-trait noise to estimate a
  // prediction interval. Noise scales with parental divergence and model type.
  const bag = bagging(predicted, similarity, model)
  for (const p of predicted) {
    const interval = bag.intervals.get(p.trait)
    if (interval) {
      p.low = Math.round(interval.low * 100) / 100
      p.high = Math.round(interval.high * 100) / 100
    }
  }

  return {
    predicted,
    similarity,
    confidence: bag.confidence,
    bagging: { samples: bag.samples, spread: bag.spread },
  }
}

/**
 * Bagging (bootstrap aggregating) estimate. For each trait we draw N noisy
 * samples around the point estimate; the standard deviation across samples
 * gives a prediction interval and an aggregate confidence score. Divergent
 * parents and the additive-dominance model carry more uncertainty.
 */
function bagging(
  predicted: PredictedTrait[],
  similarity: number,
  model: CrossModel,
): {
  samples: number
  spread: number
  confidence: number
  intervals: Map<string, { low: number; high: number }>
} {
  const samples = 200
  const modelNoise = model === 'additive_dominance' ? 0.09 : model === 'best_parent' ? 0.07 : 0.05
  // Divergence adds uncertainty (more unknown recombination outcomes)
  const divergenceNoise = (1 - similarity / 100) * 0.06
  const noiseFrac = modelNoise + divergenceNoise

  const intervals = new Map<string, { low: number; high: number }>()
  let totalCv = 0
  let count = 0

  for (const p of predicted) {
    const mean = p.predicted
    const sd = Math.abs(mean) * noiseFrac
    // Deterministic pseudo-random draws (seeded by trait name) for stable UI
    let seed = hash(p.trait)
    let sum = 0
    let sumSq = 0
    for (let i = 0; i < samples; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const u1 = (seed % 10000) / 10000 || 0.0001
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const u2 = (seed % 10000) / 10000
      // Box-Muller transform -> standard normal
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      const draw = mean + z * sd
      sum += draw
      sumSq += draw * draw
    }
    const mu = sum / samples
    const variance = sumSq / samples - mu * mu
    const std = Math.sqrt(Math.max(variance, 0))
    intervals.set(p.trait, { low: mean - 1.96 * std, high: mean + 1.96 * std })
    if (mean !== 0) {
      totalCv += std / Math.abs(mean)
      count++
    }
  }

  const avgCv = count > 0 ? totalCv / count : 0.1
  // Confidence: lower coefficient of variation => higher confidence
  const confidence = Math.max(0, Math.min(100, Math.round((1 - avgCv * 4) * 100)))
  const spread = Math.round(avgCv * 1000) / 10

  return { samples, spread, confidence, intervals }
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h * 16777619) & 0x7fffffff
  }
  return h || 1
}

/**
 * Score how well a set of predicted traits satisfies a breeder's targets.
 * Weighted, normalized to 0-100. Used for ranking parent pairs.
 */
export function scoreAgainstTargets(
  predicted: PredictedTrait[],
  targets: TargetTrait[],
): { score: number; rationale: string[] } {
  const byTrait = new Map(predicted.map((p) => [p.trait, p]))
  let weightedSum = 0
  let totalWeight = 0
  const rationale: string[] = []

  for (const target of targets) {
    const p = byTrait.get(target.trait)
    const weight = target.weight || 1
    totalWeight += weight
    if (!p) {
      rationale.push(`No data for ${target.trait}`)
      continue
    }
    const lowerBetter = LOWER_IS_BETTER.has(target.trait)
    let ratio: number
    if (lowerBetter) {
      // meeting or beating (below) target is ideal
      ratio = target.target === 0 ? 1 : target.target / Math.max(p.predicted, 0.0001)
    } else {
      ratio = target.target === 0 ? 1 : p.predicted / target.target
    }
    const traitScore = Math.max(0, Math.min(1.1, ratio)) // allow slight overshoot credit
    weightedSum += Math.min(traitScore, 1) * weight

    const pct = Math.round(traitScore * 100)
    rationale.push(
      `${target.trait}: predicted ${p.predicted}${p.unit ? ' ' + p.unit : ''} vs target ${target.target} (${pct}% of goal)`,
    )
  }

  const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0
  return { score, rationale }
}
