'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Info, Loader2 } from 'lucide-react'
import { SyntheticBadge } from '@/components/shared/SyntheticBadge'

interface WhyDrawerProps {
  entityType: string
  entityId: string
  triggerLabel?: string
}

export function WhyDrawer({ entityType, entityId, triggerLabel = 'Why?' }: WhyDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [evidence, setEvidence] = React.useState<any>(null)

  React.useEffect(() => {
    let mounted = true
    const loadData = async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/evidence/${entityType}/${entityId}`)
        const d = await r.json()
        if (mounted) {
          if (d.error) setEvidence({ error: d.error })
          else setEvidence(d)
        }
      } catch {
        if (mounted) setEvidence({ error: 'Failed to load' })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (isOpen && !evidence) {
      loadData()
    }

    return () => { mounted = false }
  }, [isOpen, entityType, entityId, evidence])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="ml-1 inline-flex items-center text-xs font-medium text-saffron hover:underline gap-1">
        <Info className="h-4 w-4" />
        {triggerLabel}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-saffron" />
            Evidence & Assumptions
            <SyntheticBadge />
          </SheetTitle>
          <SheetDescription>
            Traceability for AI-derived and model-generated values.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading...</div>
          ) : evidence?.error ? (
            <div className="text-danger">{evidence.error}</div>
          ) : evidence ? (
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground block">Model Version</span>
                <span>{evidence.modelVersionId}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block">Confidence</span>
                <span>{(evidence.confidence * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block">Sources</span>
                <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">{JSON.stringify(JSON.parse(evidence.sources || '{}'), null, 2)}</pre>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block">Assumptions</span>
                <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">{JSON.stringify(JSON.parse(evidence.assumptions || '{}'), null, 2)}</pre>
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
