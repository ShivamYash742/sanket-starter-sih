import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function POST() {
  const roleInfo = requireRole()
  if (roleInfo.role !== 'PLANNER' && roleInfo.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // 1. Fetch current model version
    const currentVersion = await prisma.modelVersion.findFirst({
      where: { name: 'Demand', version: 'v0.4' }
    })

    const oldParams = currentVersion ? JSON.parse(currentVersion.params as string) : {}
    
    // Recalibration math: new = old * (1 + 0.5 * (actual/forecast - 1))
    // Example: actual 430, forecast 500 => ratio 0.86 => -14% error => damp by 7% => 0.93 multiplier
    const errorPct = (430 / 500) - 1
    const dampMultiplier = 1 + 0.5 * errorPct
    
    const newParams = {
      ...oldParams,
      evComparableRatio: (oldParams.evComparableRatio || 1.0) * dampMultiplier
    }

    // 2. Create new ModelVersion
    const newVersion = await prisma.modelVersion.create({
      data: {
        name: 'Demand',
        version: 'v0.5',
        params: JSON.stringify(newParams)
      }
    })

    // 3. Write AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: roleInfo.role,
        action: 'CREATE',
        entityType: 'ModelVersion',
        entityId: newVersion.id,
        before: JSON.stringify(oldParams),
        after: JSON.stringify(newParams),
        reason: `Recalibrated based on -14% variance in EV Technician outcomes`,
        modelVersionId: newVersion.version,
        at: new Date()
      }
    })

    return NextResponse.json({ success: true, version: newVersion.version })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Recalibration failed' }, { status: 500 })
  }
}
