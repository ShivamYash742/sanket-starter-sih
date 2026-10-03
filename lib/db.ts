import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.DATABASE_URL?.includes('prisma.io') && process.env.DATABASE_URL?.startsWith('prisma://')) {
  // It's a Prisma Accelerate URL
  prisma = globalForPrisma.prisma ?? new PrismaClient({ accelerateUrl: process.env.DATABASE_URL })
} else {
  // Direct postgres or pooled via pg
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
