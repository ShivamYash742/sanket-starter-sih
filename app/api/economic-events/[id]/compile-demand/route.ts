import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@/lib/db'
import { forecastDemand } from '@/lib/engines/demand'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const roleInfo = requireRole()

  if (roleInfo.role === 'EMPLOYER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const event = await prisma.economicEvent.findUnique({
      where: { id }
    })

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // For the demo we simulate the 12 comparable projects dynamically
    const p = [
      { investmentCr: 1000, workers: 210 },
      { investmentCr: 2000, workers: 480 },
      { investmentCr: 5000, workers: 1350 }
    ]

    // Execute Demand Engine
    const forecast = forecastDemand({
      investmentCr: event.investmentCr,
      comparableProjects: p,
      regionalFactor: 1.0,
      occupationFractions: [{ occupationId: 'tech', fraction: 1.0 }],
      confidenceCalibrator: 0.72
    })

    const modelVersionId = 'Demand_v0.4'

    // Store Forecast in DB
    const storedForecast = await prisma.forecast.create({
      data: {
        eventId: id,
        low: forecast.low,
        base: forecast.base,
        high: forecast.high,
        confidence: forecast.confidence,
        modelVersionId: modelVersionId,
        horizonMonths: 18
      }
    })

    // Create AuditLog for mutation
    await prisma.auditLog.create({
      data: {
        actorId: roleInfo.role,
        action: 'CREATE',
        entityType: 'Forecast',
        entityId: storedForecast.id,
        before: '{}',
        after: JSON.stringify(forecast),
        reason: 'Demand Engine executed on economic event',
        modelVersionId: modelVersionId,
        at: new Date()
      }
    })

    // Create Evidence row for AI-derived results
    await prisma.evidence.create({
      data: {
        entityType: 'Forecast',
        entityId: storedForecast.id,
        sources: JSON.stringify(forecast.evidenceRefs),
        assumptions: JSON.stringify({ regionalFactor: 1.0 }),
        confidence: forecast.confidence,
        modelVersionId: modelVersionId
      }
    })

    return NextResponse.json({ success: true, forecastId: storedForecast.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to compile demand' }, { status: 500 })
  }
}
