'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { createRequest } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TRAIT_LABELS } from '@/lib/types'

const TRAIT_OPTIONS = Object.keys(TRAIT_LABELS)

type TargetRow = { trait: string; target: string; weight: string }

export function RequestForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [requesterName, setRequesterName] = useState('')
  const [org, setOrg] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [region, setRegion] = useState('')
  const [targets, setTargets] = useState<TargetRow[]>([
    { trait: 'yield', target: '', weight: '2' },
  ])

  function reset() {
    setRequesterName('')
    setOrg('')
    setTitle('')
    setDescription('')
    setRegion('')
    setTargets([{ trait: 'yield', target: '', weight: '2' }])
  }

  async function handleSubmit() {
    if (!requesterName.trim() || !title.trim()) {
      toast.error('Your name and a request title are required')
      return
    }
    const cleanTargets = targets
      .filter((t) => t.trait.trim() && t.target !== '')
      .map((t) => ({
        trait: t.trait,
        target: Number(t.target),
        weight: Number(t.weight) || 1,
      }))
    if (cleanTargets.length === 0) {
      toast.error('Add at least one target trait')
      return
    }
    setSaving(true)
    try {
      await createRequest({
        requester_name: requesterName.trim(),
        org: org.trim() || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        region: region.trim() || undefined,
        target_traits: cleanTargets,
      })
      toast.success('Request submitted')
      reset()
      router.push('/requests')
      router.refresh()
    } catch (e) {
      toast.error('Failed to submit request')
      console.log('[v0] createRequest error', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Breeding Request</CardTitle>
        <CardDescription>
          Describe the traits you need and we&apos;ll recommend the best
          parent pairs from the germplasm registry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="r-name">Your Name</Label>
            <Input
              id="r-name"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-org">Organization</Label>
            <Input id="r-org" value={org} onChange={(e) => setOrg(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="r-title">Request Title</Label>
            <Input
              id="r-title"
              placeholder="High-yield drought-tolerant tomato"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-region">Region</Label>
            <Input
              id="r-region"
              placeholder="Imperial Valley, CA"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="r-desc">Description</Label>
          <Textarea
            id="r-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Target Traits</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setTargets((t) => [...t, { trait: 'yield', target: '', weight: '2' }])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add target
            </Button>
          </div>
          {targets.map((t, i) => (
            <div key={i} className="flex gap-2">
              <Select
                value={t.trait}
                onValueChange={(v) =>
                  setTargets((rows) =>
                    rows.map((r, idx) => (idx === i ? { ...r, trait: v ?? r.trait } : r)),
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
                placeholder="Target"
                className="w-28 font-mono"
                value={t.target}
                onChange={(e) =>
                  setTargets((rows) =>
                    rows.map((r, idx) => (idx === i ? { ...r, target: e.target.value } : r)),
                  )
                }
              />
              <Input
                type="number"
                placeholder="Weight"
                className="w-24 font-mono"
                value={t.weight}
                onChange={(e) =>
                  setTargets((rows) =>
                    rows.map((r, idx) => (idx === i ? { ...r, weight: e.target.value } : r)),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setTargets((rows) => rows.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove target</span>
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit Request
        </Button>
      </CardContent>
    </Card>
  )
}
