export type Generation = 'parent' | 'f1' | 'f2' | 'advanced'

export interface Plant {
  id: number
  accession_code: string
  name: string
  species: string
  generation: Generation
  mother_id: number | null
  father_id: number | null
  vigor: number
  notes: string | null
  created_at: string
}

export interface Marker {
  id: number
  plant_id: number
  marker: string
  allele: string
}

export interface PlantTrait {
  id: number
  plant_id: number
  trait: string
  value: number
  unit: string | null
}

export interface Site {
  id: number
  name: string
  region: string
  latitude: number
  longitude: number
  climate: string | null
  soil: string | null
  capacity: number
  notes: string | null
  created_at: string
}

export interface Planting {
  id: number
  plant_id: number
  site_id: number
  planted_on: string
  quantity: number
  status: 'growing' | 'harvested' | 'failed'
  created_at: string
}

export interface PredictedTrait {
  trait: string
  unit: string | null
  parentA: number
  parentB: number
  predicted: number
  low: number
  high: number
}

export type CrossModel = 'mid_parent' | 'best_parent' | 'additive_dominance'

export interface Cross {
  id: number
  name: string
  parent_a_id: number
  parent_b_id: number
  model: CrossModel
  predicted_traits: PredictedTrait[]
  genomic_similarity: number | null
  confidence: number | null
  bagging: { samples: number; spread: number } | null
  site_id: number | null
  created_at: string
}

export interface TargetTrait {
  trait: string
  target: number
  weight: number
}

export interface BreedingRequest {
  id: number
  requester_name: string
  org: string | null
  title: string
  description: string | null
  target_traits: TargetTrait[]
  region: string | null
  status: 'open' | 'matched' | 'closed'
  created_by: string | null
  created_at: string
}

// Composite for detail views
export interface PlantDetail extends Plant {
  markers: Marker[]
  traits: PlantTrait[]
}

// Ranked parent-pair recommendation for a request
export interface PairRecommendation {
  parentA: Plant
  parentB: Plant
  score: number
  genomicSimilarity: number
  confidence: number
  predictedTraits: PredictedTrait[]
  rationale: string[]
}

export const TRAIT_LABELS: Record<string, string> = {
  yield: 'Yield',
  drought_tolerance: 'Drought Tolerance',
  plant_height: 'Plant Height',
  disease_resistance: 'Disease Resistance',
  days_to_maturity: 'Days to Maturity',
}

// Traits where a LOWER value is better (e.g. earlier maturity)
export const LOWER_IS_BETTER = new Set(['days_to_maturity', 'plant_height'])
