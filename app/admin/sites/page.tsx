import { MapPin, Sprout, Thermometer, Layers } from 'lucide-react'
import { getSites, getPlantings, getPlants } from '@/lib/queries'
import { SiteMap, type MapMarker } from '@/components/site-map'
import { SiteForm } from '@/components/site-form'
import { PlantingForm } from '@/components/planting-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const [sites, plantings, plants] = await Promise.all([
    getSites(),
    getPlantings(),
    getPlants(),
  ])

  const markers: MapMarker[] = sites.map((s) => {
    const growing = plantings
      .filter((p) => p.site_id === s.id && p.status === 'growing')
      .reduce((sum, p) => sum + p.quantity, 0)
    return {
      id: s.id,
      name: s.name,
      region: s.region,
      latitude: s.latitude,
      longitude: s.longitude,
      detail: `${growing} plants growing`,
    }
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Field Sites
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Field locations and active plantings across the breeding network.
          </p>
        </div>
        <div className="flex gap-2">
          <PlantingForm plants={plants} sites={sites} />
          <SiteForm />
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <SiteMap markers={markers} height={400} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((s) => {
          const sitePlantings = plantings.filter((p) => p.site_id === s.id)
          const growing = sitePlantings
            .filter((p) => p.status === 'growing')
            .reduce((sum, p) => sum + p.quantity, 0)
          const usage = s.capacity > 0 ? Math.round((growing / s.capacity) * 100) : 0
          return (
            <Card key={s.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-heading text-base">
                    {s.name}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="border-accent/40 bg-accent/25 text-accent-foreground"
                  >
                    {s.region}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {Number(s.latitude).toFixed(2)},{' '}
                    {Number(s.longitude).toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5" />
                    {s.climate ?? '—'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    {s.soil ?? '—'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sprout className="h-3.5 w-3.5" />
                    {growing} / {s.capacity}
                  </span>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Capacity used</span>
                    <span className="font-mono">{usage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>
                </div>
                {sitePlantings.length > 0 ? (
                  <div className="space-y-1 border-t border-border pt-2">
                    {sitePlantings.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="truncate">{p.plant_name}</span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-mono">{p.quantity}</span>
                          <Badge
                            variant={
                              p.status === 'growing' ? 'default' : 'secondary'
                            }
                            className="px-1.5 py-0 text-[10px] capitalize"
                          >
                            {p.status}
                          </Badge>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="border-t border-border pt-2 text-xs text-muted-foreground">
                    No plantings recorded.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
