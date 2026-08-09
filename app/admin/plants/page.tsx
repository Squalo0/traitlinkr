import { getPlantDetails } from '@/lib/queries'
import { PlantForm } from '@/components/plant-form'
import { PlantTable } from '@/components/plant-table'
export const dynamic = "force-dynamic";


export default async function PlantsPage() {
  const plants = await getPlantDetails()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Plant Registry
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {plants.length} germplasm accession{plants.length === 1 ? '' : 's'}{' '}
            with SNP genotypes and phenotype records. Click a row to inspect.
          </p>
        </div>
        <PlantForm />
      </div>
      <PlantTable plants={plants} />
    </div>
  )
}
