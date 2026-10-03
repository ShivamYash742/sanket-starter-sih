import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entityType: string; id: string }> }
) {
  // Enforce access control
  requireRole()
  
  const { entityType, id } = await params

  const evidence = await prisma.evidence.findFirst({
    where: {
      entityType,
      entityId: id,
    }
  })

  if (!evidence) {
    return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
  }

  return NextResponse.json(evidence)
}
