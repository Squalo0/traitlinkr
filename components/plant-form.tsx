'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createPlant } from '@/app/actions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TRAIT_LABELS } from '@/lib/types'

const TRAIT_OPTIONS = Object.keys(TRAIT_LABELS)
const DEFAULT_UNITS: Record<string, string> = {
  yield: 't/ha',
  drought_tolerance: 'index',
  plant_height: 'cm',
  disease_resistance: 'index',
  days_to_maturity: 'days',
}

type MarkerRow = { marker: string; allele: string }
type TraitRow = { trait: string; value: string }

export function PlantForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('Zea mays')
  const [generation, setGeneration] = useState('parent')
  const [vigor, setVigor] = useState('50')
  const [notes, setNotes] = useState('')
  const [markers, setMarkers] = useState<MarkerRow[]>([
    { marker: 'SNP_DRT1', allele: 'A/A' },
  ])
  const [traits, setTraits] = useState<TraitRow[]>([
    { trait: 'yield', value: '' },
  ])

  function reset() {
    setCode('')
    setName('')
    setSpecies('Zea mays')
    setGeneration('parent')
    setVigor('50')
    setNotes('')
    setMarkers([{ marker: 'SNP_DRT1', allele: 'A/A' }])
    setTraits([{ trait: 'yield', value: '' }])
  }

  async function handleSubmit() {
    if (!code.trim() || !name.trim()) {
      toast.error('Accession code and name are required')
      return
    }
    setSaving(true)
    try {
      await createPlant({
        accession_code: code.trim(),
        name: name.trim(),
        species: species.trim(),
        generation,
        vigor: Number(vigor) || 0,
        notes: notes.trim() || undefined,
        markers: markers.filter((m) => m.marker.trim()),
        traits: traits
          .filter((t) => t.trait.trim() && t.value !== '')
          .map((t) => ({
            trait: t.trait,
            value: Number(t.value),
            unit: DEFAULT_UNITS[t.trait],
          })),
      })
      toast.success(`Accession ${code} registered`)
      reset()
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast.error('Failed to register accession')
      console.log('[v0] createPlant error', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="h-4 w-4" />
            Register Accession
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register Germplasm Accession</DialogTitle>
          <DialogDescription>
            Add a plant with its SNP marker genotypes and phenotype trait
            measurements.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Accession Code</Label>
              <Input
                id="code"
                placeholder="ZM-0007"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Highland Gold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="species">Species</Label>
              <Input
                id="species"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Generation</Label>
              <Select value={generation} onValueChange={setGeneration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="f1">F1</SelectItem>
                  <SelectItem value="f2">F2</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vigor">Vigor (0-100)</Label>
              <Input
                id="vigor"
                type="number"
                value={vigor}
                onChange={(e) => setVigor(e.target.value)}
              />
            </div>
          </div>

          {/* SNP Markers */}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">SNP Markers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setMarkers((m) => [...m, { marker: '', allele: '' }])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add marker
              </Button>
            </div>
            {markers.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Marker (e.g. SNP_YLD2)"
                  value={m.marker}
                  onChange={(e) =>
                    setMarkers((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { ...r, marker: e.target.value } : r,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Allele (e.g. A/G)"
                  className="w-32 font-mono"
                  value={m.allele}
                  onChange={(e) =>
                    setMarkers((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { ...r, allele: e.target.value } : r,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setMarkers((rows) => rows.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove marker</span>
                </Button>
              </div>
            ))}
          </div>

          {/* Phenotype traits */}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Phenotype Traits</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setTraits((t) => [...t, { trait: 'yield', value: '' }])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add trait
              </Button>
            </div>
            {traits.map((t, i) => (
              <div key={i} className="flex gap-2">
                <Select
                  value={t.trait}
                  onValueChange={(v) =>
                    setTraits((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { ...r, trait: v } : r,
                      ),
                    )
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {TRAIT_LABELS[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Value"
                  className="w-32 font-mono"
                  value={t.value}
                  onChange={(e) =>
                    setTraits((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { ...r, value: e.target.value } : r,
                      ),
                    )
                  }
                />
                <span className="flex w-16 items-center text-xs text-muted-foreground">
                  {DEFAULT_UNITS[t.trait]}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setTraits((rows) => rows.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove trait</span>
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
