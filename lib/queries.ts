import 'server-only'
import { sql } from './db'
import type {
  BreedingRequest,
  Cross,
  Marker,
  Plant,
  PlantDetail,
  PlantTrait,
  Planting,
  Site,
} from './types'

export async function getPlants(): Promise<Plant[]> {
  return (await sql`
    SELECT * FROM plants ORDER BY accession_code
  `) as Plant[]
}

export async function getPlantDetails(): Promise<PlantDetail[]> {
  const [plants, markers, traits] = await Promise.all([
    sql`SELECT * FROM plants ORDER BY accession_code` as Promise<Plant[]>,
    sql`SELECT * FROM markers` as Promise<Marker[]>,
    sql`SELECT * FROM plant_traits` as Promise<PlantTrait[]>,
  ])
  return plants.map((p) => ({
    ...p,
    markers: markers.filter((m) => m.plant_id === p.id),
    traits: traits.filter((t) => t.plant_id === p.id),
  }))
}

export async function getPlantDetail(id: number): Promise<PlantDetail | null> {
  const rows = (await sql`SELECT * FROM plants WHERE id = ${id}`) as Plant[]
  if (rows.length === 0) return null
  const [markers, traits] = await Promise.all([
    sql`SELECT * FROM markers WHERE plant_id = ${id}` as Promise<Marker[]>,
    sql`SELECT * FROM plant_traits WHERE plant_id = ${id}` as Promise<PlantTrait[]>,
  ])
  return { ...rows[0], markers, traits }
}

export async function getSites(): Promise<Site[]> {
  return (await sql`SELECT * FROM sites ORDER BY name`) as Site[]
}

export async function getPlantings(): Promise<
  (Planting & { plant_name: string; accession_code: string; site_name: string })[]
> {
  return (await sql`
    SELECT pl.*, p.name AS plant_name, p.accession_code, s.name AS site_name
    FROM plantings pl
    JOIN plants p ON p.id = pl.plant_id
    JOIN sites s ON s.id = pl.site_id
    ORDER BY pl.planted_on DESC
  `) as (Planting & { plant_name: string; accession_code: string; site_name: string })[]
}

export async function getCrosses(): Promise<
  (Cross & { parent_a_name: string; parent_b_name: string })[]
> {
  return (await sql`
    SELECT c.*, pa.name AS parent_a_name, pb.name AS parent_b_name
    FROM crosses c
    JOIN plants pa ON pa.id = c.parent_a_id
    JOIN plants pb ON pb.id = c.parent_b_id
    ORDER BY c.created_at DESC
  `) as (Cross & { parent_a_name: string; parent_b_name: string })[]
}

export async function getRequests(): Promise<BreedingRequest[]> {
  return (await sql`SELECT * FROM requests ORDER BY created_at DESC`) as BreedingRequest[]
}

export async function getRequest(id: number): Promise<BreedingRequest | null> {
  const rows = (await sql`SELECT * FROM requests WHERE id = ${id}`) as BreedingRequest[]
  return rows[0] ?? null
}

export async function getDashboardStats() {
  const [[plants], [sites], [crosses], [requests], [plantings]] = (await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM plants`,
    sql`SELECT COUNT(*)::int AS count FROM sites`,
    sql`SELECT COUNT(*)::int AS count FROM crosses`,
    sql`SELECT COUNT(*)::int AS count FROM requests WHERE status = 'open'`,
    sql`SELECT COALESCE(SUM(quantity),0)::int AS count FROM plantings WHERE status = 'growing'`,
  ])) as { count: number }[][]
  return {
    plants: plants.count,
    sites: sites.count,
    crosses: crosses.count,
    openRequests: requests.count,
    growing: plantings.count,
  }
}
