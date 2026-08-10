'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapMarker {
  id: number
  name: string
  region: string
  latitude: number
  longitude: number
  detail?: string
}

export function SiteMap({ markers, height = 380 }: { markers: MapMarker[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false })
    mapRef.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const points = markers.map((marker) => [Number(marker.latitude), Number(marker.longitude)] as [number, number])
    const bounds = L.latLngBounds([])
    const icon = L.divIcon({
      className: 'traitlinkr-map-marker',
      html: '<span></span>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -10],
    })

    markers.forEach((marker) => {
      const point: [number, number] = [Number(marker.latitude), Number(marker.longitude)]
      bounds.extend(point)
      const detail = marker.detail ? `<br><span>${marker.detail}</span>` : ''
      L.marker(point, { icon }).addTo(map).bindPopup(`<strong>${marker.name}</strong><br><span>${marker.region}</span>${detail}`)
    })

    if (points.length > 1) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 7 })
    else if (points.length === 1) map.setView(points[0], 6)
    else map.setView([37, -96], 3)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [markers])

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg border border-border bg-secondary" style={{ height }} aria-label="Field sites map" />
  )
}
