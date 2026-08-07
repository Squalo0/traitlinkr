'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'
import { getPlantDetail } from '@/lib/queries'
import { predictCross } from '@/lib/prediction'
import type { CrossModel, Marker, PlantTrait, TargetTrait } from '@/lib/types'

export async function createPlant(input: {
  accession_code: string
  name: string
  species: string
  generation: string
  vigor: number
  notes?: string
  markers: { marker: string; allele: string }[]
  traits: { trait: string; value: number; unit?: string }[]
}) {
  const rows = (await sql`
    INSERT INTO plants (accession_code, name, species, generation, vigor, notes)
    VALUES (${input.accession_code}, ${input.name}, ${input.species}, ${input.generation}, ${input.vigor}, ${input.notes ?? null})
    RETURNING id
  `) as { id: number }[]
  const plantId = rows[0].id

  for (const m of input.markers) {
    if (!m.marker.trim()) continue
    await sql`INSERT INTO markers (plant_id, marker, allele) VALUES (${plantId}, ${m.marker}, ${m.allele})`
  }
  for (const t of input.traits) {
    if (!t.trait.trim()) continue
    await sql`INSERT INTO plant_traits (plant_id, trait, value, unit) VALUES (${plantId}, ${t.trait}, ${t.value}, ${t.unit ?? null})`
  }

  revalidatePath('/admin/plants')
  revalidatePath('/admin')
  return { id: plantId }
}

export async function deletePlant(id: number) {
  await sql`DELETE FROM markers WHERE plant_id = ${id}`
  await sql`DELETE FROM plant_traits WHERE plant_id = ${id}`
  await sql`DELETE FROM plantings WHERE plant_id = ${id}`
  await sql`DELETE FROM plants WHERE id = ${id}`
  revalidatePath('/admin/plants')
}

export async function createSite(input: {
  name: string
  region: string
  latitude: number
  longitude: number
  climate?: string
  soil?: string
  capacity: number
  notes?: string
}) {
  await sql`
    INSERT INTO sites (name, region, latitude, longitude, climate, soil, capacity, notes)
    VALUES (${input.name}, ${input.region}, ${input.latitude}, ${input.longitude}, ${input.climate ?? null}, ${input.soil ?? null}, ${input.capacity}, ${input.notes ?? null})
  `
  revalidatePath('/admin/sites')
  revalidatePath('/admin')
}

export async function createPlanting(input: {
  plant_id: number
  site_id: number
  quantity: number
  planted_on: string
}) {
  await sql`
    INSERT INTO plantings (plant_id, site_id, quantity, planted_on, status)
    VALUES (${input.plant_id}, ${input.site_id}, ${input.quantity}, ${input.planted_on}, 'growing')
  `
  revalidatePath('/admin/sites')
  revalidatePath('/admin')
}

export async function runCrossPrediction(input: {
  parentAId: number
  parentBId: number
  model: CrossModel
}) {
  const [a, b] = await Promise.all([
    getPlantDetail(input.parentAId),
    getPlantDetail(input.parentBId),
  ])
  if (!a || !b) throw new Error('Parent plant not found')
  const result = predictCross(a, b, input.model)
  return {
    parentA: { id: a.id, name: a.name, code: a.accession_code },
    parentB: { id: b.id, name: b.name, code: b.accession_code },
    ...result,
  }
}

export async function saveCross(input: {
  name: string
  parentAId: number
  parentBId: number
  model: CrossModel
  siteId?: number
}) {
  const [a, b] = await Promise.all([
    getPlantDetail(input.parentAId),
    getPlantDetail(input.parentBId),
  ])
  if (!a || !b) throw new Error('Parent plant not found')
  const result = predictCross(a, b, input.model)
  await sql`
    INSERT INTO crosses (name, parent_a_id, parent_b_id, model, predicted_traits, genomic_similarity, confidence, bagging, site_id)
    VALUES (
      ${input.name}, ${input.parentAId}, ${input.parentBId}, ${input.model},
      ${JSON.stringify(result.predicted)}, ${result.similarity}, ${result.confidence},
      ${JSON.stringify(result.bagging)}, ${input.siteId ?? null}
    )
  `
  revalidatePath('/admin/crosses')
  revalidatePath('/admin')
}

export async function createRequest(input: {
  requester_name: string
  org?: string
  title: string
  description?: string
  region?: string
  target_traits: TargetTrait[]
}) {
  const rows = (await sql`
    INSERT INTO requests (requester_name, org, title, description, region, target_traits, status)
    VALUES (${input.requester_name}, ${input.org ?? null}, ${input.title}, ${input.description ?? null}, ${input.region ?? null}, ${JSON.stringify(input.target_traits)}, 'open')
    RETURNING id
  `) as { id: number }[]
  revalidatePath('/requests')
  revalidatePath('/admin')
  return { id: rows[0].id }
}
