import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import { z } from 'zod'
import { rankTransformationPaths } from '@/lib/engines/transformation'

const transformSchema = z.object({
  fromOccupationId: z.string(),
  toOccupationId: z.string(),
})

export async function POST(req: Request) {
  requireRole()

  try {
    const body = await req.json()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fromOccupationId, toOccupationId } = transformSchema.parse(body)

    // For demo API we mock the DB lookup and just rank dummy paths
    const paths = rankTransformationPaths([])

    // Note: This is an engine read/generation route, not a state-changing DB mutation
    // so it doesn't strictly need an AuditLog, but Evidence might be useful if we persist paths.
    // For now, we return the generated paths dynamically.

    return NextResponse.json({ paths })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate transformation paths' }, { status: 400 })
  }
}
