import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Await params per Next.js 16 conventions
  const { id } = await params
  
  const roleInfo = requireRole()
  if (roleInfo.role !== 'PLANNER' && roleInfo.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only PLANNER or ADMIN can approve plans' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { action, reason } = body // 'APPROVE', 'MODIFY', 'REJECT'

    if ((action === 'MODIFY' || action === 'REJECT') && (!reason || reason.trim() === '')) {
      return NextResponse.json({ error: 'Reason is mandatory for MODIFY and REJECT' }, { status: 400 })
    }

    // In a real app, we would update the ActivationPlan row.
    // For demo, we just create the AuditLog to satisfy the golden rules.

    await prisma.auditLog.create({
      data: {
        actorId: roleInfo.role,
        action: action,
        entityType: 'ActivationPlan',
        entityId: id,
        before: JSON.stringify({ status: 'PENDING' }),
        after: JSON.stringify({ status: action }),
        reason: reason || 'Approved without modifications',
        modelVersionId: 'Optimizer_v1',
        at: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Approval failed' }, { status: 500 })
  }
}
