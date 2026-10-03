import React from 'react'
import { prisma } from '@/lib/db'
import { forecastDemand } from '@/lib/engines/demand'
import { recordEvidence } from '@/lib/engines/evidence'
import { KpiCard } from '@/components/shared/KpiCard'
import { WhyDrawer } from '@/components/shared/WhyDrawer'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { EmptyState } from '@/components/shared/EmptyState'

export default async function DemandPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const { eventId } = await searchParams

  if (!eventId) {
    return <EmptyState title="No Event Selected" description="Please select or create an economic event first." />
  }

  const event = await prisma.economicEvent.findUnique({ where: { id: eventId } })
  if (!event) return <EmptyState title="Event Not Found" description="The selected event does not exist." />

  const comparableProjects = await prisma.comparableProject.findMany({
    where: { sector: event.sector }
  })

  // Mock fraction based on M2 requirements
  const occupationFractions = [
    { occupationId: 'Technicians', fraction: 31/120 },
    { occupationId: 'Operators', fraction: 1/5 },
    { occupationId: 'Engineers', fraction: 31/240 },
    { occupationId: 'Maintenance', fraction: 29/240 },
    { occupationId: 'Other', fraction: 7/24 }
  ]

  const modelVersion = await prisma.modelVersion.findFirst({
    where: { name: 'Demand', version: 'v0.4' }
  })
  const params = modelVersion ? JSON.parse(modelVersion.params) : { calibration: 0.7 }

  const forecast = forecastDemand({
    investmentCr: event.investmentCr,
    comparableProjects: comparableProjects.map(p => ({ investmentCr: p.investmentCr, workers: p.workers })),
    regionalFactor: 1.0,
    occupationFractions,
    confidenceCalibrator: params.calibration
  })

  // Save evidence
  const evidenceRecord = recordEvidence(
    'Forecast',
    event.id,
    { comparableCount: comparableProjects.length },
    { regionalFactor: 1.0 },
    forecast.confidence,
    'v0.4'
  )

  const evidence = await prisma.evidence.create({
    data: {
      entityType: evidenceRecord.entityType,
      entityId: evidenceRecord.entityId,
      sources: JSON.stringify(evidenceRecord.sources),
      assumptions: JSON.stringify(evidenceRecord.assumptions),
      confidence: evidenceRecord.confidence,
      modelVersionId: evidenceRecord.modelVersionId
    }
  })

  const chartData = forecast.components.map(c => ({
    name: c.occupationId,
    count: c.count
  }))

  const skillsList = ['PLC', 'Industrial Safety', 'Equipment Maintenance', 'Automation', 'Quality Control', 'Process Operations']

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Analysis: {event.name}</h2>
          <p className="text-muted-foreground mt-1">{event.sector} • ₹{event.investmentCr.toLocaleString('en-IN')} Cr</p>
        </div>
        <WhyDrawer 
          entityType="Forecast" 
          entityId={event.id}
          triggerLabel="Why this forecast?"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Low Estimate" value={forecast.low.toLocaleString('en-IN')} />
        <KpiCard title="Base Forecast" value={forecast.base.toLocaleString('en-IN')} />
        <KpiCard title="High Estimate" value={forecast.high.toLocaleString('en-IN')} />
        <KpiCard title="Confidence" value={`${(forecast.confidence * 100).toFixed(0)}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Occupation Breakdown</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                <Bar dataKey="count" fill="#0B2A4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Required Skills Profile</h3>
          <ul className="space-y-3">
            {skillsList.map(skill => (
              <li key={skill} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-saffron" />
                <span className="text-sm font-medium">{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
