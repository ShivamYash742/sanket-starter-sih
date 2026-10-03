/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { KpiCard } from '@/components/shared/KpiCard'
import { DataTable } from '@/components/shared/DataTable'
import { Loader2, Zap } from 'lucide-react'

export default function PlansPage() {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<any>(null)

  const generatePlan = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/activation/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: 'demo-event-id' })
      })
      const data = await res.json()
      if (!data.error) {
        setPlan(data.result)
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const assignmentCols = [
    { key: 'cohortId', title: 'Cohort ID' },
    { key: 'centreId', title: 'Assigned Centre' },
    { key: 'cycle', title: 'Cycle', render: (r: any) => `Cycle ${r.cycle + 1}` },
    { key: 'workers', title: 'Workers Activated' },
    { key: 'cost', title: 'Estimated Cost (₹)', render: (r: any) => r.cost.toLocaleString('en-IN') }
  ]

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activation Plans</h2>
          <p className="text-muted-foreground mt-1">Optimize and generate training assignments for the workforce gap.</p>
        </div>
        <button 
          onClick={generatePlan}
          disabled={loading}
          className="px-4 py-2 bg-navy text-white rounded-md text-sm font-medium hover:bg-navy/90 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Generate Activation Plan
        </button>
      </div>

      {!plan ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No active plan generated yet.</p>
          <p className="text-sm">Click &quot;Generate Activation Plan&quot; to run the HiGHS optimizer.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="Demand" value="2,500" />
            <KpiCard title="Directly Deployable" value="600" />
            <KpiCard title="Activated Transformable" value={((plan.assignments as any[]) || []).reduce((a: number, c: { workers: number }) => a + c.workers, 0).toLocaleString('en-IN')} />
            <KpiCard title="Residual Gap" value={Object.values((plan.unactivated as Record<string, number>) || {}).reduce((a: number, c: number) => a + c, 0).toLocaleString('en-IN')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Total Training Cost" value={`₹${plan.totalCost.toLocaleString('en-IN')}`} />
            <KpiCard title="Activation Time" value="18 Weeks" />
            <KpiCard title="Capacity Utilization" value="82%" />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Optimized Assignments</h3>
            </div>
            <DataTable columns={assignmentCols} data={plan.assignments} />
          </div>
        </div>
      )}
    </div>
  )
}
