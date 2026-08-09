import { GitMerge } from 'lucide-react'
import { CrossSimulator } from '@/components/cross-simulator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCrosses, getPlants, getSites } from '@/lib/queries'
export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  const [plants, sites, crosses] = await Promise.all([
    getPlants(),
    getSites(),
    getCrosses(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
          Cross Simulator
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Predict offspring trait values from two parent accessions using
          quantitative genetics models, with confidence estimated by ensemble
          bagging over the marker and phenotype data.
        </p>
      </div>

      <CrossSimulator plants={plants} sites={sites} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <GitMerge className="h-4 w-4 text-primary" />
            Saved Crosses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {crosses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No crosses saved yet. Run a prediction above and save it to your
              program.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Cross</th>
                    <th className="pb-2 font-medium">Parents</th>
                    <th className="pb-2 font-medium">Model</th>
                    <th className="pb-2 font-medium">Similarity</th>
                    <th className="pb-2 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {crosses.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 font-medium">{c.name}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {c.parent_a_name} × {c.parent_b_name}
                      </td>
                      <td className="py-2.5">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {c.model}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-mono">
                        {c.genomic_similarity != null
                          ? `${Number(c.genomic_similarity).toFixed(0)}%`
                          : '—'}
                      </td>
                      <td className="py-2.5 font-mono">
                        {c.confidence != null
                          ? `${Number(c.confidence).toFixed(0)}%`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
