'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wand2, Loader2 } from 'lucide-react'

export default function EconomicSignalsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [pasteText, setPasteText] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    sector: 'SEMICONDUCTOR',
    location: 'Sanand',
    investmentCr: '',
    projectType: 'Greenfield',
    startDate: '',
    operationalDate: '',
    technology: '',
    employer: '',
    expectedHiring: ''
  })

  const handleParse = async () => {
    if (!pasteText.trim()) return
    setParsing(true)
    try {
      const res = await fetch('/api/llm/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText })
      })
      if (res.ok) {
        const parsed = await res.json()
        setFormData(prev => ({ ...prev, ...parsed }))
        setPasteText('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/economic-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/demand?eventId=${data.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold">New Economic Signal</h2>
        <p className="text-muted-foreground mt-1">
          Register a new factory, investment, or technology shift.
        </p>
      </div>

      <div className="bg-card border border-border p-6 rounded-lg space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Smart Paste (Optional)</label>
            <button
              type="button"
              onClick={() => setPasteText("Tata Electronics announced a new greenfield Semiconductor Facility in Sanand, Gujarat with an investment of ₹10,000 Crore. The advanced node fabrication plant will become operational in 18 months, creating expected direct hiring of 2,400 specialized workforce roles.")}
              className="text-xs text-saffron hover:underline font-medium"
            >
              Load Sample Press Release
            </button>
          </div>
          <div className="flex gap-2">
            <textarea 
              className="flex-1 min-h-[80px] rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              placeholder="Paste press release or news text here..."
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleParse}
              disabled={parsing || !pasteText.trim()}
              className="px-4 py-2 bg-saffron text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-saffron/90 disabled:opacity-50"
            >
              {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Extract
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-lg space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <input required type="text" className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Employer / Owner</label>
            <input required type="text" className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={formData.employer} onChange={e => setFormData({...formData, employer: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sector</label>
            <select required className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
              <option value="SEMICONDUCTOR">SEMICONDUCTOR</option>
              <option value="EV">EV</option>
              <option value="SOLAR">SOLAR</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">District Location</label>
            <input required type="text" className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Investment (₹ Crores)</label>
            <input required type="number" min="0" className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={formData.investmentCr} onChange={e => setFormData({...formData, investmentCr: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Type</label>
            <input type="text" className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expected Start Date</label>
            <input type="date" required className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Operational Date</label>
            <input type="date" required className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={formData.operationalDate} onChange={e => setFormData({...formData, operationalDate: e.target.value})} />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-navy text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-navy/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Analyse Workforce Impact
          </button>
        </div>
      </form>
    </div>
  )
}
