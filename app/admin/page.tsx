import Link from 'next/link'
import { Leaf, MapPin, GitMerge, Inbox, Sprout } from 'lucide-react'
import {
  getDashboardStats,
  getSites,
  getCrosses,
  getRequests,
  getPlantings,
} from '@/lib/queries'
import { StatCard } from '@/components/stat-card'
import { SiteMap, type MapMarker } from '@/components/site-map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RequestStatusBadge } from '@/components/request-status-badge'
import { TRAIT_LABELS } from '@/lib/types'

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, sites, crosses, requests, plantings] = await Promise.all([
    getDashboardStats(),
    getSites(),
    getCrosses(),
    getRequests(),
    getPlantings(),
  ])

  const markers: MapMarker[] = sites.map((s) => {
    const active = plantings.filter(
      (p) => p.site_id === s.id && p.status === 'growing',
    )
    const growing = active.reduce((sum, p) => sum + p.quantity, 0)
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            Breeding Program Overview
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Germplasm, field sites, and predictive cross activity at a glance.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href="/admin/crosses">
              <GitMerge className="h-4 w-4" />
              New Cross Simulation
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Accessions" value={stats.plants} icon={Leaf} />
        <StatCard label="Field Sites" value={stats.sites} icon={MapPin} />
        <StatCard label="Growing Plants" value={stats.growing} icon={Sprout} />
        <StatCard label="Simulated Crosses" value={stats.crosses} icon={GitMerge} />
        <StatCard label="Open Requests" value={stats.openRequests} icon={Inbox} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Field Site Map</CardTitle>
          </CardHeader>
          <CardContent>
            <SiteMap markers={markers} height={420} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">Recent Requests</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/requests">View all</Link>}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              requests.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight text-pretty">
                      {r.title}
                    </p>
                    <RequestStatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.requester_name}
                    {r.org ? ` · ${r.org}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.target_traits.slice(0, 3).map((t) => (
                      <span
                        key={t.trait}
                        className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {TRAIT_LABELS[t.trait] ?? t.trait}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Recent Cross Simulations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {crosses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No crosses simulated yet. Head to the Cross Simulator to predict
              offspring traits from two parents.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {crosses.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.parent_a_name} × {c.parent_b_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Similarity{' '}
                      <span className="font-mono text-foreground">
                        {c.genomic_similarity}%
                      </span>
                    </span>
                    <Badge variant="secondary">
                      {Number(c.confidence)}% confidence
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
