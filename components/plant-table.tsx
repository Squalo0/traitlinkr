'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Trash2, Dna, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { deletePlant } from '@/app/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TRAIT_LABELS, type PlantDetail } from '@/lib/types'

export function PlantTable({ plants }: { plants: PlantDetail[] }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleDelete(id: number, code: string) {
    setDeleting(id)
    try {
      await deletePlant(id)
      toast.success(`Removed ${code}`)
      router.refresh()
    } catch {
      toast.error('Failed to remove accession')
    } finally {
      setDeleting(null)
    }
  }

  if (plants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No accessions registered yet.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="w-10 px-3 py-2.5" />
            <th className="px-3 py-2.5 font-medium">Accession</th>
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="hidden px-3 py-2.5 font-medium sm:table-cell">
              Generation
            </th>
            <th className="hidden px-3 py-2.5 font-medium md:table-cell">
              Markers
            </th>
            <th className="hidden px-3 py-2.5 font-medium md:table-cell">
              Traits
            </th>
            <th className="px-3 py-2.5 text-right font-medium">Vigor</th>
            <th className="w-10 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {plants.map((p) => {
            const isOpen = expanded === p.id
            return (
              <Fragment key={p.id}>
                <tr
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                >
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">
                    {p.accession_code}
                  </td>
                  <td className="px-3 py-2.5 font-medium">{p.name}</td>
                  <td className="hidden px-3 py-2.5 sm:table-cell">
                    <Badge variant="secondary" className="uppercase">
                      {p.generation}
                    </Badge>
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">
                    {p.markers.length}
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">
                    {p.traits.length}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {Number(p.vigor)}
                  </td>
                  <td
                    className="px-3 py-2.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleting === p.id}
                      onClick={() => handleDelete(p.id, p.accession_code)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </td>
                </tr>
                {isOpen ? (
                  <tr className="bg-muted/30">
                    <td />
                    <td colSpan={7} className="px-3 py-4">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <Dna className="h-3.5 w-3.5" />
                            SNP Genotypes
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {p.markers.length === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                No markers
                              </span>
                            ) : (
                              p.markers.map((m) => (
                                <span
                                  key={m.id}
                                  className="rounded border border-border bg-card px-2 py-1 font-mono text-xs"
                                >
                                  {m.marker}{' '}
                                  <span className="text-primary">
                                    {m.allele}
                                  </span>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <Activity className="h-3.5 w-3.5" />
                            Phenotype Traits
                          </p>
                          <div className="grid gap-1.5">
                            {p.traits.length === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                No traits
                              </span>
                            ) : (
                              p.traits.map((t) => (
                                <div
                                  key={t.id}
                                  className="flex items-center justify-between rounded border border-border bg-card px-2.5 py-1.5 text-xs"
                                >
                                  <span>
                                    {TRAIT_LABELS[t.trait] ?? t.trait}
                                  </span>
                                  <span className="font-mono tabular-nums">
                                    {Number(t.value)}
                                    {t.unit ? (
                                      <span className="ml-1 text-muted-foreground">
                                        {t.unit}
                                      </span>
                                    ) : null}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      {p.notes ? (
                        <p
                          className={cn(
                            'mt-4 rounded-md bg-card p-3 text-xs text-muted-foreground',
                          )}
                        >
                          {p.notes}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
