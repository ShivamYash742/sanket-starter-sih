import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { z } from 'zod'

const eventSchema = z.object({
  name: z.string(),
  sector: z.string(),
  location: z.string(),
  investmentCr: z.coerce.number().min(0),
  projectType: z.string().optional(),
  startDate: z.string(),
  operationalDate: z.string(),
  technology: z.string().optional(),
  employer: z.string(),
  expectedHiring: z.coerce.number().optional()
})

export async function POST(req: Request) {
  requireRole()
  
  try {
    const body = await req.json()
    const parsed = eventSchema.parse(body)
    
    // Check if employer exists, else create
    let employer = await prisma.employer.findFirst({ where: { name: parsed.employer } })
    if (!employer) {
      employer = await prisma.employer.create({ data: { name: parsed.employer } })
    }

    const event = await prisma.economicEvent.create({
      data: {
        name: parsed.name,
        sector: parsed.sector,
        state: 'Gujarat', // Simplified for demo
        district: parsed.location,
        investmentCr: parsed.investmentCr,
        projectType: parsed.projectType || 'Greenfield',
        technology: parsed.technology || 'Standard',
        startDate: new Date(parsed.startDate),
        operationalDate: new Date(parsed.operationalDate),
        expectedHiring: parsed.expectedHiring || 0,
        status: 'ANNOUNCED',
        employerId: employer.id
      }
    })

    await prisma.auditLog.create({
      data: {
        actorId: 'system', // or from session if available
        action: 'CREATE',
        entityType: 'EconomicEvent',
        entityId: event.id,
        before: '{}',
        after: JSON.stringify(event),
        reason: 'User created economic event',
        at: new Date()
      }
    })

    return NextResponse.json({ id: event.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
