/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function ScenariosPage() {
  const [params, setParams] = useState({
    demandPct: 0,
    investmentScale: 1.0,
    hiringVelocityFactor: 1.0,
    delayWeeks: 0,
    migrationPct: 0,
    trainingCapacityPct: 0
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runScenario = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/scenarios/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      const data = await res.json()
      setResult(data.result)
    } finally {
      setLoading(false)
    }
  }

  const renderDelta = (base: number, scenario: number, inverse = false) => {
    const diff = scenario - base
    if (diff === 0) return <span className="flex items-center gap-1 text-muted-foreground"><Minus className="h-4 w-4"/> 0</span>
    const isPositive = diff > 0
    // If inverse is true, less is better (e.g. residual, cost)
    const isGood = inverse ? !isPositive : isPositive
    
    return (
      <span className={`flex items-center gap-1 font-medium ${isGood ? 'text-success' : 'text-danger'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>}
        {Math.abs(diff).toLocaleString('en-IN')}
      </span>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold">Scenario Lab</h2>
        <p className="text-muted-foreground mt-1">Stress-test the baseline activation plan under varying conditions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-lg space-y-6">
          <h3 className="font-semibold text-lg border-b border-border pb-2">Levers</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Demand Variance (%)</label>
              <input type="range" min="-20" max="20" step="1" 
                value={params.demandPct * 100}
                onChange={e => setParams({...params, demandPct: parseInt(e.target.value) / 100})}
                className="w-full"
              />
              <div className="text-right text-xs text-muted-foreground">{Math.round(params.demandPct * 100)}%</div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Training Capacity (%)</label>
              <input type="range" min="-30" max="30" step="1" 
                value={params.trainingCapacityPct * 100}
                onChange={e => setParams({...params, trainingCapacityPct: parseInt(e.target.value) / 100})}
                className="w-full"
              />
              <div className="text-right text-xs text-muted-foreground">{Math.round(params.trainingCapacityPct * 100)}%</div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Project Delay (Weeks)</label>
              <input type="range" min="0" max="48" step="4" 
                value={params.delayWeeks}
                onChange={e => setParams({...params, delayWeeks: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="text-right text-xs text-muted-foreground">{params.delayWeeks} weeks</div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Hiring Velocity</label>
              <select 
                value={params.hiringVelocityFactor}
                onChange={e => setParams({...params, hiringVelocityFactor: parseFloat(e.target.value)})}
                className="w-full border-border bg-background rounded-md text-sm p-2"
              >
                <option value={0.85}>Low (0.85x)</option>
                <option value={1.0}>Base (1.0x)</option>
                <option value={1.10}>High (1.10x)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={runScenario}
            disabled={loading}
            className="w-full px-4 py-2 bg-navy text-white rounded-md text-sm font-medium hover:bg-navy/90 flex justify-center items-center gap-2"
          >
            {loading ? 'Running...' : <><Zap className="h-4 w-4" /> Run Scenario</>}
          </button>
        </div>

        <div className="md:col-span-2">
          {result ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden animate-in slide-in-from-right-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-4 font-semibold">Metric</th>
                    <th className="p-4 font-semibold text-right">Base Plan</th>
                    <th className="p-4 font-semibold text-right bg-saffron/10 text-navy">Scenario</th>
                    <th className="p-4 font-semibold text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-medium">Workforce Demand</td>
                    <td className="p-4 text-right">2,400</td>
                    <td className="p-4 text-right bg-saffron/5 font-semibold">{result.demand.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">{renderDelta(24 * 100, result.demand, true)}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Directly Deployable</td>
                    <td className="p-4 text-right">600</td>
                    <td className="p-4 text-right bg-saffron/5 font-semibold">{result.direct.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">{renderDelta(600, result.direct, false)}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Activated Transformable</td>
                    <td className="p-4 text-right">1,010</td>
                    <td className="p-4 text-right bg-saffron/5 font-semibold">{result.activated.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">{renderDelta(101 * 10, result.activated, false)}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Residual Gap</td>
                    <td className="p-4 text-right">790</td>
                    <td className="p-4 text-right bg-saffron/5 font-bold">{result.residual.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">{renderDelta(790, result.residual, true)}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Training Cost</td>
                    <td className="p-4 text-right">₹1.5Cr</td>
                    <td className="p-4 text-right bg-saffron/5 font-semibold">₹{(result.cost / 10000000).toFixed(2)}Cr</td>
                    <td className="p-4 text-right">{renderDelta(15000000, result.cost, true)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground p-12 text-center">
              <div>
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Adjust levers and run a scenario to see deltas against the base plan.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
