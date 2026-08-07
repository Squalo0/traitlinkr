'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

export interface MapMarker {
  id: number
  name: string
  region: string
  latitude: number
  longitude: number
  detail?: string
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export function SiteMap({
  markers,
  height = 380,
}: {
  markers: MapMarker[]
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return
    mapboxgl.accessToken = TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: markers.length
        ? [Number(markers[0].longitude), Number(markers[0].latitude)]
        : [37, 0],
      zoom: markers.length > 1 ? 4 : 6,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    const bounds = new mapboxgl.LngLatBounds()
    for (const m of markers) {
      const lng = Number(m.longitude)
      const lat = Number(m.latitude)
      const el = document.createElement('div')
      el.style.cssText =
        'width:16px;height:16px;border-radius:50%;background:#2f9e6b;border:2px solid #fff;box-shadow:0 0 0 2px rgba(47,158,107,.4)'
      new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 16 }).setHTML(
            `<strong>${m.name}</strong><br/><span style="color:#666">${m.region}</span>${
              m.detail ? `<br/>${m.detail}` : ''
            }`,
          ),
        )
        .addTo(map)
      bounds.extend([lng, lat])
    }
    if (markers.length > 1) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 7 })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [markers])

  if (!TOKEN) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center"
        style={{ height }}
      >
        <MapPin className="h-8 w-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Map preview unavailable</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Add a <code className="font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code>{' '}
            environment variable to render the interactive site map. Sites are
            still fully listed below.
          </p>
        </div>
        <div className="mt-2 grid w-full max-w-md gap-1.5">
          {markers.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5 text-left text-xs"
            >
              <span className="font-medium">{m.name}</span>
              <span className="font-mono text-muted-foreground">
                {Number(m.latitude).toFixed(2)}, {Number(m.longitude).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg border border-border"
      style={{ height }}
    />
  )
}
