'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createPlanting } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Plant, Site } from '@/lib/types'

export function PlantingForm({
  plants,
  sites,
}: {
  plants: Plant[]
  sites: Site[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [plantId, setPlantId] = useState('')
  const [siteId, setSiteId] = useState('')
  const [quantity, setQuantity] = useState('20')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  // base-ui's Select.Value resolves its display label from the Root's
  // `items` map rather than the rendered SelectItem children, so we provide
  // explicit value/label pairs here.
  const plantItems = plants.map((p) => ({
    value: String(p.id),
    label: `${p.accession_code} — ${p.name}`,
  }))
  const siteItems = sites.map((s) => ({ value: String(s.id), label: s.name }))

  async function handleSubmit() {
    if (!plantId || !siteId) {
      toast.error('Select a plant and a site')
      return
    }
    setSaving(true)
    try {
      await createPlanting({
        plant_id: Number(plantId),
        site_id: Number(siteId),
        quantity: Number(quantity) || 1,
        planted_on: date,
      })
      toast.success('Planting recorded')
      setOpen(false)
      setPlantId('')
      setSiteId('')
      setQuantity('20')
      router.refresh()
    } catch {
      toast.error('Failed to record planting')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Sprout className="h-4 w-4" />
            Record Planting
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Planting</DialogTitle>
          <DialogDescription>
            Log an accession planted at a field site.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Accession</Label>
            <Select value={plantId} onValueChange={setPlantId} items={plantItems}>
              <SelectTrigger>
                <SelectValue placeholder="Select plant" />
              </SelectTrigger>
              <SelectContent>
                {plants.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.accession_code} — {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Site</Label>
            <Select value={siteId} onValueChange={setSiteId} items={siteItems}>
              <SelectTrigger>
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-qty">Quantity</Label>
              <Input
                id="p-qty"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-date">Planted On</Label>
              <Input
                id="p-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
