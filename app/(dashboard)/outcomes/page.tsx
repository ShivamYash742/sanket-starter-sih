'use client'

import React, { useState } from 'react'
import { KpiCard } from '@/components/shared/KpiCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { RefreshCw, TrendingDown } from 'lucide-react'

export default function OutcomesPage() {
  const [loading, setLoading] = useState(false)
  const [recalibrated, setRecalibrated] = useState(false)

  // M4c acceptance data simulation
  const funnelData = [
    { stage: 'Identified', Expected: 163 * 10, Actual: 163 * 10 },
    { stage: 'Enrolled', Expected: 101 * 10, Actual: 89 * 10 },
    { stage: 'Completed', Expected: 900, Actual: 62 * 10 },
    { stage: 'Certified', Expected: 850, Actual: 57 * 10 },
    { stage: 'Applied', Expected: 800, Actual: 49 * 10 },
    { stage: 'Placed', Expected: 750, Actual: 41 * 10 }
  ]

  const handleRecalibrate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/outcomes/recalibrate', { method: 'POST' })
      if (res.ok) {
        setRecalibrated(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Outcomes & Recalibration</h2>
          <p className="text-muted-foreground mt-1">Track actual worker progression and recalibrate underlying models.</p>
        </div>
        <button 
          onClick={handleRecalibrate}
          disabled={loading || recalibrated}
          className="px-4 py-2 bg-saffron text-white rounded-md text-sm font-medium hover:bg-saffron/90 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {recalibrated ? 'Model Recalibrated (v0.5)' : 'Recalibrate Demand Model'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Forecast (EV Tech)" value="500" />
        <KpiCard title="Actual (EV Tech)" value="430" />
        <KpiCard title="Error Margin" value="-14%" />
        <KpiCard title="Placement Rate" value="46%" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card border border-border p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-6">Implementation Funnel</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Expected" fill="#E2E8F0" />
                <Bar dataKey="Actual" fill="#0B2A4A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-lg space-y-6">
          <h3 className="font-semibold text-lg">Likely Drivers of Variance</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-danger/5 text-danger rounded-md border border-danger/10">
              <TrendingDown className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Training Bottleneck</h4>
                <p className="text-xs mt-1 opacity-90">Capacity utilization capped at 85%. 120 workers dropped before enrollment.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted rounded-md border border-border text-foreground">
              <div className="h-5 w-5 rounded-full bg-border flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">!</div>
              <div>
                <h4 className="font-semibold text-sm">Demand Overestimation</h4>
                <p className="text-xs text-muted-foreground mt-1">Initial investment scale factor translated poorly to technician ratios in EV sector.</p>
              </div>
            </div>
          </div>
          {recalibrated && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-md text-success text-sm">
              <strong>Demand Model v0.5 Active</strong><br/>
              Comparable ratios for EV sector have been damped by 7% based on this variance.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
