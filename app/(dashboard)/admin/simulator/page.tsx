'use client'

import React, { useState } from 'react'
import { Play } from 'lucide-react'

export default function SimulatorPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const runBlueprint = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/simulator', { method: 'POST' })
      const data = await res.json()
      if (data.error) alert(data.error)
      else setResult('Blueprint funnel executed successfully. DB seeded with outcomes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold">Outcome Simulator</h2>
        <p className="text-muted-foreground mt-1">Admin tool to simulate worker progression through the activation funnel.</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-lg max-w-xl">
        <h3 className="font-semibold text-lg mb-4">Blueprint Funnel Preset</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Advances seeded workers deterministically through stages: 
          Enrolled {'>'} Completed {'>'} Certified {'>'} Applied {'>'} Placed.
          This action writes Outcome and Application rows to the database.
        </p>

        <button 
          onClick={runBlueprint}
          disabled={loading || result !== null}
          className="px-4 py-2 bg-navy text-white rounded-md text-sm font-medium hover:bg-navy/90 flex items-center gap-2 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {loading ? 'Running Simulator...' : 'Run Blueprint'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-md text-success text-sm font-medium">
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
