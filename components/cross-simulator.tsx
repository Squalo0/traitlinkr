'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitMerge, Loader2, Save, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { runCrossPrediction, saveCross } from '@/app/actions'
import {
  PredictionResultView,
  type PredictionResult,
} from '@/components/prediction-result'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CrossModel, Plant, Site } from '@/lib/types'

const MODELS: { value: CrossModel; label: string; blurb: string }[] = [
  {
    value: 'mid_parent',
    label: 'Mid-Parent',
    blurb: 'Offspring = average of both parents. Classic additive model.',
  },
  {
    value: 'best_parent',
    label: 'Best-Parent',
    blurb: 'Leans toward the superior parent per trait (selection pressure).',
  },
  {
    value: 'additive_dominance',
    label: 'Additive + Dominance',
    blurb: 'Mid-parent plus heterosis boost scaled by genomic divergence.',
  },
]

export function CrossSimulator({
  plants,
  sites,
}: {
  plants: Plant[]
  sites: Site[]
}) {
  const router = useRouter()
  const [parentA, setParentA] = useState('')
  const [parentB, setParentB] = useState('')
  const [model, setModel] = useState<CrossModel>('additive_dominance')
  const [siteId, setSiteId] = useState('')
  const [name, setName] = useState('')
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)

  async function handleRun() {
    if (!parentA || !parentB) {
      toast.error('Select two parent accessions')
      return
    }
    if (parentA === parentB) {
      toast.error('Parents must be different accessions')
      return
    }
    setRunning(true)
    try {
      const res = await runCrossPrediction({
        parentAId: Number(parentA),
        parentBId: Number(parentB),
        model,
      })
      setResult(res)
      if (!name) {
        setName(`${res.parentA.code} × ${res.parentB.code}`)
      }
    } catch {
      toast.error('Prediction failed')
    } finally {
      setRunning(false)
    }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    try {
      await saveCross({
        name: name.trim() || `${result.parentA.code} × ${result.parentB.code}`,
        parentAId: result.parentA.id,
        parentBId: result.parentB.id,
        model,
        siteId: siteId ? Number(siteId) : undefined,
      })
      toast.success('Cross saved to program')
      router.refresh()
    } catch {
      toast.error('Failed to save cross')
    } finally {
      setSaving(false)
    }
  }

  const activeModel = MODELS.find((m) => m.value === model)!

  // base-ui's Select.Value only resolves a display label from the Root's
  // `items` map — it does not read the rendered SelectItem children — so we
  // provide explicit value/label pairs for every select whose value isn't
  // already human-readable.
  const plantItems = plants.map((p) => ({
    value: String(p.id),
    label: `${p.accession_code} — ${p.name}`,
  }))
  const siteItems = sites.map((s) => ({ value: String(s.id), label: s.name }))

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitMerge className="h-4 w-4" />
            Configure Cross
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Parent A</Label>
            <Select value={parentA} onValueChange={setParentA} items={plantItems}>
              <SelectTrigger>
                <SelectValue placeholder="Select accession" />
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
            <Label>Parent B</Label>
            <Select value={parentB} onValueChange={setParentB} items={plantItems}>
              <SelectTrigger>
                <SelectValue placeholder="Select accession" />
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
            <Label>Prediction Model</Label>
            <Select
              value={model}
              onValueChange={(v) => setModel(v as CrossModel)}
              items={MODELS}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{activeModel.blurb}</p>
          </div>

          <Button onClick={handleRun} disabled={running} className="w-full">
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Predict Offspring
          </Button>

          {result ? (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="cross-name">Cross Name</Label>
                <Input
                  id="cross-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Target Site (optional)</Label>
                <Select value={siteId} onValueChange={setSiteId} items={siteItems}>
                  <SelectTrigger>
                    <SelectValue placeholder="No site" />
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
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="outline"
                className="w-full"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save to Program
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {result
              ? `Predicted Offspring — ${result.parentA.code} × ${result.parentB.code}`
              : 'Prediction Results'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <PredictionResultView result={result} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <GitMerge className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-medium">No prediction yet</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Pick two parent accessions and a model, then run the
                  prediction to see offspring trait forecasts with confidence
                  intervals.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
