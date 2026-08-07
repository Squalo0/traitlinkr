import 'server-only'
import { getPlantDetails } from './queries'
import { predictCross, scoreAgainstTargets } from './prediction'
import type { CrossModel, PairRecommendation, Plant, PlantDetail, TargetTrait } from './types'

/**
 * Rank all viable parent pairs for a set of target traits. For each unordered
 * pair we run the cross prediction under the given model, then score the
 * predicted offspring against the breeder's weighted targets. Genomic
 * divergence is folded into the confidence estimate from bagging.
 */
export async function recommendPairs(
  targets: TargetTrait[],
  model: CrossModel = 'additive_dominance',
  limit = 8,
): Promise<PairRecommendation[]> {
  const plants = await getPlantDetails()
  const recs: PairRecommendation[] = []

  for (let i = 0; i < plants.length; i++) {
    for (let j = i + 1; j < plants.length; j++) {
      const a = plants[i]
      const b = plants[j]
      const result = predictCross(a, b, model)
      const { score, rationale } = scoreAgainstTargets(result.predicted, targets)
      // Blend goal-fit score with prediction confidence (80/20)
      const blended = Math.round(score * 0.8 + result.confidence * 0.2)
      recs.push({
        parentA: stripDetail(a),
        parentB: stripDetail(b),
        score: blended,
        genomicSimilarity: result.similarity,
        confidence: result.confidence,
        predictedTraits: result.predicted,
        rationale,
      })
    }
  }

  recs.sort((x, y) => y.score - x.score)
  return recs.slice(0, limit)
}

function stripDetail(p: PlantDetail): Plant {
  const { markers: _m, traits: _t, ...plant } = p
  return plant
}
