import React from 'react'
import { prisma } from '@/lib/db'
import { classifyWorker } from '@/lib/engines/capability'
import { KpiCard } from '@/components/shared/KpiCard'
import { DataTable } from '@/components/shared/DataTable'
import { WorkerProfileDrawer } from '@/components/shared/WorkerProfileDrawer'
import { requireRole } from '@/lib/rbac'

export default async function CapabilityPage() {
  const roleInfo = requireRole()

  const workers = await prisma.worker.findMany({
    include: {
      occupation: true,
      skills: {
        include: { skill: true }
      }
    }
  })

  // Mock target occupation based on M2 requirements
  const targetOccupation = {
    occupationId: 'occ-auto-tech', // ID doesn't matter for the mock paths
    coreSkillIds: ['PLC', 'Industrial Safety', 'Equipment Maintenance', 'Automation', 'Quality Control', 'Process Operations']
  }

  // Find actual skill IDs for these core skills
  const coreSkills = await prisma.skill.findMany({
    where: { name: { in: targetOccupation.coreSkillIds } }
  })
  const coreSkillIds = coreSkills.map(s => s.id)

  const paths = [
    {
      id: 'p1',
      fromOccupationId: (await prisma.occupation.findFirst({ where: { name: 'Industrial Electrician' } }))?.id || '',
      toOccupationId: 'occ-auto-tech',
      bridgeModules: ['1', '2', '3'],
      missingSkills: [],
      durationWeeks: 6
    },
    {
      id: 'p2',
      fromOccupationId: (await prisma.occupation.findFirst({ where: { name: 'General Mechanic' } }))?.id || '',
      toOccupationId: 'occ-auto-tech',
      bridgeModules: ['1', '2', '3', '4'],
      missingSkills: [],
      durationWeeks: 12
    }
  ]

  let directCount = 0
  let oneStepCount = 0
  let twoStepCount = 0

  const processedWorkers = workers.map(w => {
    const profile = {
      id: w.id,
      occupationId: w.occupationId,
      skills: w.skills.map(s => ({
        skillId: s.skillId,
        profLow: s.profLow,
        profHigh: s.profHigh,
        status: s.status,
        confidence: s.confidence
      }))
    }
    
    const classification = classifyWorker(profile, { occupationId: targetOccupation.occupationId, coreSkillIds }, paths)
    
    if (classification === 'DIRECT') directCount++
    if (classification === 'ONE_STEP') oneStepCount++
    if (classification === 'TWO_STEP') twoStepCount++
    
    return {
      ...w,
      classification
    }
  }).filter(w => w.classification !== 'NONE')

  const totalRelevant = directCount + oneStepCount + twoStepCount

  const districtMap: Record<string, { district: string; direct: number; transformable: number }> = {}
  processedWorkers.forEach(w => {
    if (!districtMap[w.district]) {
      districtMap[w.district] = { district: w.district, direct: 0, transformable: 0 }
    }
    if (w.classification === 'DIRECT') districtMap[w.district].direct++
    else districtMap[w.district].transformable++
  })

  const districtData = Object.values(districtMap)

  const districtCols = [
    { key: 'district', title: 'District' },
    { key: 'direct', title: 'Directly Ready' },
    { key: 'transformable', title: 'Transformable' },
  ]

  const workerCols = [
    { key: 'workerRef', title: 'Worker ID', render: (r: { workerRef: string, district: string, state: string, experienceYears: number, occupation: { name: string }, skills: { skill: { name: string }, status: 'VERIFIED'|'INFERRED', profLow: number, profHigh: number, confidence: number }[] }) => (
      roleInfo.role === 'EMPLOYER' ? (
        <span className="text-muted-foreground line-through" title="Access Denied">{r.workerRef}</span>
      ) : (
        <WorkerProfileDrawer 
          workerId={r.workerRef}
          occupation={r.occupation.name}
          location={`${r.district}, ${r.state}`}
          experience={r.experienceYears}
          skills={r.skills.map(s => ({
            name: s.skill.name,
            status: s.status,
            profLow: s.profLow,
            profHigh: s.profHigh,
            confidence: s.confidence
          }))}
        />
      )
    )},
    { key: 'occupation', title: 'Current Occupation', render: (r: { occupation: { name: string } }) => r.occupation.name },
    { key: 'district', title: 'District' },
    { key: 'classification', title: 'Classification', render: (r: { classification: string }) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${
        r.classification === 'DIRECT' ? 'bg-success/10 text-success border-success/20' : 
        r.classification === 'ONE_STEP' ? 'bg-saffron/10 text-saffron border-saffron/20' : 
        'bg-navy/10 text-navy border-navy/20'
      }`}>
        {r.classification}
      </span>
    )}
  ]

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Capability Map</h2>
        <button className="px-4 py-2 bg-saffron text-white rounded-md text-sm font-medium hover:bg-saffron/90">
          Find Existing Workforce
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Total Relevant" value={totalRelevant.toLocaleString('en-IN')} />
        <KpiCard title="Directly Ready" value={directCount.toLocaleString('en-IN')} />
        <KpiCard title="1-Step Transformable" value={oneStepCount.toLocaleString('en-IN')} />
        <KpiCard title="2-Step Transformable" value={twoStepCount.toLocaleString('en-IN')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold">District Summary</h3>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable columns={districtCols} data={districtData} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Worker Details (Sample)</h3>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable columns={workerCols} data={processedWorkers.slice(0, 10)} />
          </div>
        </div>
      </div>
    </div>
  )
}
