'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPinPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createSite } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function SiteForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    region: '',
    latitude: '',
    longitude: '',
    climate: '',
    soil: '',
    capacity: '100',
    notes: '',
  })

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.region.trim()) {
      toast.error('Name and region are required')
      return
    }
    const lat = Number(form.latitude)
    const lng = Number(form.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Latitude and longitude must be numbers')
      return
    }
    setSaving(true)
    try {
      await createSite({
        name: form.name.trim(),
        region: form.region.trim(),
        latitude: lat,
        longitude: lng,
        climate: form.climate.trim() || undefined,
        soil: form.soil.trim() || undefined,
        capacity: Number(form.capacity) || 0,
        notes: form.notes.trim() || undefined,
      })
      toast.success(`Site "${form.name}" added`)
      setOpen(false)
      setForm({
        name: '',
        region: '',
        latitude: '',
        longitude: '',
        climate: '',
        soil: '',
        capacity: '100',
        notes: '',
      })
      router.refresh()
    } catch {
      toast.error('Failed to add site')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MapPinPlus className="h-4 w-4" />
          Add Site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Planting Site</DialogTitle>
          <DialogDescription>
            Register a field location for trials and plantings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="s-name">Site Name</Label>
              <Input
                id="s-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-region">Region</Label>
              <Input
                id="s-region"
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-cap">Capacity</Label>
              <Input
                id="s-cap"
                type="number"
                value={form.capacity}
                onChange={(e) => set('capacity', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-lat">Latitude</Label>
              <Input
                id="s-lat"
                placeholder="-0.3031"
                className="font-mono"
                value={form.latitude}
                onChange={(e) => set('latitude', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-lng">Longitude</Label>
              <Input
                id="s-lng"
                placeholder="36.0800"
                className="font-mono"
                value={form.longitude}
                onChange={(e) => set('longitude', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-climate">Climate</Label>
              <Input
                id="s-climate"
                value={form.climate}
                onChange={(e) => set('climate', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-soil">Soil</Label>
              <Input
                id="s-soil"
                value={form.soil}
                onChange={(e) => set('soil', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-notes">Notes</Label>
            <Textarea
              id="s-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Add Site
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
