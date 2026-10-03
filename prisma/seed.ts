import { DataSource, SkillStatus, Scope } from '@prisma/client'
import { ARCHETYPES } from './archetypes'
import { prisma } from '../lib/db'
const SEED = 26246
let currentSeed = SEED

// Simple LCG for deterministic randomness
function random() {
  currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296
  return currentSeed / 4294967296
}

function randomInRange(min: number, max: number): number {
  return min + random() * (max - min)
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1))
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

async function main() {
  console.log('Seeding database (deterministic)...')

  // Clean up
  await prisma.alert.deleteMany()
  await prisma.nationalAggregate.deleteMany()
  await prisma.forecastActual.deleteMany()
  await prisma.outcome.deleteMany()
  await prisma.activationAssignment.deleteMany()
  await prisma.activationPlan.deleteMany()
  await prisma.scenarioResult.deleteMany()
  await prisma.scenario.deleteMany()
  await prisma.forecastComponent.deleteMany()
  await prisma.forecast.deleteMany()
  await prisma.economicEvent.deleteMany()
  await prisma.employer.deleteMany()
  await prisma.transformationPath.deleteMany()
  await prisma.centreCapacity.deleteMany()
  await prisma.centreCourse.deleteMany()
  await prisma.centreTrainer.deleteMany()
  await prisma.centreEquipment.deleteMany()
  await prisma.trainingCentre.deleteMany()
  await prisma.workerSkill.deleteMany()
  await prisma.workerCertification.deleteMany()
  await prisma.workerTraining.deleteMany()
  await prisma.consent.deleteMany()
  await prisma.worker.deleteMany()
  await prisma.occupationSkill.deleteMany()
  await prisma.skillRelationship.deleteMany()
  await prisma.projectSkill.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.occupation.deleteMany()
  await prisma.comparableProject.deleteMany()
  await prisma.project.deleteMany()
  await prisma.modelVersion.deleteMany()
  await prisma.evidence.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()

  // 1. Model Version
  const demandModel = await prisma.modelVersion.create({
    data: {
      name: 'Demand',
      version: 'v0.4',
      params: JSON.stringify({ calibration: 0.72 })
    }
  })


  // To precisely hit the golden numbers for SEMICONDUCTOR: 
  const semiRatios = [0.20, 0.21, 0.22, 0.23, 0.24, 0.24, 0.25, 0.26, 0.27, 0.27, 0.28]
  for (let i = 0; i < semiRatios.length; i++) {
    await prisma.comparableProject.create({
      data: {
        sector: 'SEMICONDUCTOR',
        investmentCr: 1000,
        workers: Math.round(1000 * semiRatios[i]),
        state: 'Gujarat'
      }
    })
  }

  // 3. Occupations & Skills
  const coreSkillNames = ['PLC', 'Industrial Safety', 'Equipment Maintenance', 'Automation', 'Quality Control', 'Process Operations']
  const allSkillNames = [
    ...coreSkillNames,
    'Electrical Systems', 'Troubleshooting', 'Mechanical Systems', 'Customer Service'
  ]

  const skills = {} as Record<string, string>
  for (const name of allSkillNames) {
    const skill = await prisma.skill.create({
      data: { name, category: 'Technical' }
    })
    skills[name] = skill.id
  }

  const occAutoTech = await prisma.occupation.create({
    data: { code: 'TECH-AUTO', name: 'Automation Technician' }
  })
  const occIndElec = await prisma.occupation.create({
    data: { code: 'TECH-ELEC', name: 'Industrial Electrician' }
  })
  const occGenMech = await prisma.occupation.create({
    data: { code: 'MECH-GEN', name: 'General Mechanic' }
  })
  const occRetail = await prisma.occupation.create({
    data: { code: 'RET-01', name: 'Retail Associate' }
  })

  for (const name of coreSkillNames) {
    await prisma.occupationSkill.create({
      data: {
        occupationId: occAutoTech.id,
        skillId: skills[name]
      }
    })
  }

  // 4. Transformation Paths
  // Industrial Electrician > Automation Technician (ONE_STEP)
  await prisma.transformationPath.create({
    data: {
      fromOccupationId: occIndElec.id,
      toOccupationId: occAutoTech.id,
      bridgeModules: JSON.stringify(['PLC Fundamentals', 'Industrial Automation', 'Control Systems']),
      missingSkills: JSON.stringify(['Automation', 'Quality Control', 'Process Operations']),
      durationWeeks: 6,
      costPerWorker: 12000,
      employerDemand: 0.8,
      historicalSuccess: 0.75,
      confidence: 0.8
    }
  })
  
  // General Mechanic > Automation Technician (TWO_STEP)
  await prisma.transformationPath.create({
    data: {
      fromOccupationId: occGenMech.id,
      toOccupationId: occAutoTech.id,
      bridgeModules: JSON.stringify(['Module 1', 'Module 2', 'Module 3', 'Module 4']), // >3 modules
      missingSkills: JSON.stringify(['PLC', 'Automation', 'Process Operations']),
      durationWeeks: 12,
      costPerWorker: 20000,
      employerDemand: 0.6,
      historicalSuccess: 0.65,
      confidence: 0.7
    }
  })

  // 5. Workers
  const districts = ['Ahmedabad', 'Gandhinagar', 'Mehsana']
  const createWorkers = async (arch: typeof ARCHETYPES.DIRECT | typeof ARCHETYPES.ONE_STEP, occId: string, count: number) => {
    const batch = []
    for (let i = 0; i < count; i++) {
      const wId = `W-${occId.slice(0, 5)}-${i}-${Math.random().toString(36).slice(2, 6)}`
      batch.push({
        workerRef: wId,
        occupationId: occId,
        state: 'Gujarat',
        district: randomChoice(districts),
        lat: randomInRange(22.0, 24.0),
        lng: randomInRange(71.0, 73.0),
        experienceYears: 'experienceYears' in arch ? arch.experienceYears : randomInt(1, 10),
        availability: 1.0,
        dataSource: DataSource.SYNTHETIC
      })
    }
    await prisma.worker.createMany({ data: batch })
    
    // Skills
    const dbWorkers = await prisma.worker.findMany({ where: { occupationId: occId } })
    const skillBatch = []
    for (const w of dbWorkers) {
      for (const s of arch.skills) {
        skillBatch.push({
          workerId: w.id,
          skillId: skills[s.name],
          profLow: s.profLow,
          profHigh: s.profHigh,
          status: s.status as SkillStatus,
          confidence: s.confidence
        })
      }
    }
    await prisma.workerSkill.createMany({ data: skillBatch })
  }

  await createWorkers(ARCHETYPES.DIRECT, occAutoTech.id, ARCHETYPES.DIRECT.count)
  await createWorkers(ARCHETYPES.ONE_STEP, occIndElec.id, ARCHETYPES.ONE_STEP.count)
  await createWorkers(ARCHETYPES.TWO_STEP, occGenMech.id, ARCHETYPES.TWO_STEP.count)
  await createWorkers(ARCHETYPES.NONE, occRetail.id, ARCHETYPES.NONE.count)

  // 6. Training Centres
  const tcBatch = []
  for (let i = 0; i < 126; i++) {
    tcBatch.push({
      name: `Training Centre ${i}`,
      state: i < 100 ? 'Gujarat' : 'Maharashtra',
      district: i < 100 ? randomChoice(districts) : 'Pune',
      lat: randomInRange(22.0, 24.0),
      lng: randomInRange(71.0, 73.0)
    })
  }
  await prisma.trainingCentre.createMany({ data: tcBatch })

  // 7. Demo Events
  const employer = await prisma.employer.create({ data: { name: 'Tata Electronics & Semiconductor' } })
  const employer2 = await prisma.employer.create({ data: { name: 'Bharat EV Solutions' } })

  const event = await prisma.economicEvent.create({
    data: {
      id: 'demo-event-id',
      name: 'Semiconductor Facility',
      employerId: employer.id,
      sector: 'SEMICONDUCTOR',
      state: 'Gujarat',
      district: 'Sanand',
      investmentCr: 10000,
      projectType: 'Greenfield',
      technology: 'Advanced Node Fabrication',
      startDate: new Date(),
      operationalDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000), // 18 months
      expectedHiring: 2400,
      status: 'ANNOUNCED'
    }
  })

  await prisma.economicEvent.create({
    data: {
      id: 'demo-event-ev',
      name: 'EV Battery Gigafactory',
      employerId: employer2.id,
      sector: 'EV',
      state: 'Maharashtra',
      district: 'Pune',
      investmentCr: 4500,
      projectType: 'Greenfield',
      technology: 'Lithium Iron Phosphate (LFP) Cells',
      startDate: new Date(),
      operationalDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months
      expectedHiring: 1200,
      status: 'ANNOUNCED'
    }
  })

  // 8. Aggregates & Alerts
  await prisma.nationalAggregate.create({
    data: {
      scope: Scope.NATIONAL,
      key: 'OVERVIEW',
      dataSource: DataSource.SYNTHETIC,
      metrics: JSON.stringify({
        emergingDemand: 18,
        workforceRequired: 2400000,
        deployable: 1300000,
        transformable: 620000,
        residual: 480000,
        trainingCapacity: 710000,
        activePlans: 126,
        forecastConfidence: 78
      })
    }
  })

  // State-level aggregates for 8 states summing to national totals
  const stateAggregates = [
    { state: 'Gujarat', gap: 140000, demand: 520000, deployable: 260000, transformable: 120000, confidence: 76 },
    { state: 'Maharashtra', gap: 120000, demand: 480000, deployable: 250000, transformable: 110000, confidence: 79 },
    { state: 'Tamil Nadu', gap: 70000, demand: 360000, deployable: 200000, transformable: 90000, confidence: 82 },
    { state: 'Karnataka', gap: 50000, demand: 320000, deployable: 190000, transformable: 80000, confidence: 80 },
    { state: 'Telangana', gap: 35000, demand: 240000, deployable: 140000, transformable: 65000, confidence: 77 },
    { state: 'Andhra Pradesh', gap: 25000, demand: 180000, deployable: 100000, transformable: 55000, confidence: 75 },
    { state: 'Uttar Pradesh', gap: 25000, demand: 180000, deployable: 90000, transformable: 65000, confidence: 73 },
    { state: 'Rajasthan', gap: 15000, demand: 120000, deployable: 70000, transformable: 35000, confidence: 74 }
  ]

  for (const s of stateAggregates) {
    await prisma.nationalAggregate.create({
      data: {
        scope: Scope.STATE,
        key: s.state,
        dataSource: DataSource.SYNTHETIC,
        metrics: JSON.stringify({
          residual: s.gap,
          workforceRequired: s.demand,
          deployable: s.deployable,
          transformable: s.transformable,
          trainingCapacity: Math.round(s.demand * 0.3),
          forecastConfidence: s.confidence
        })
      }
    })
  }

  // 4 official alerts from AGENTS.md section 8
  await prisma.alert.createMany({
    data: [
      {
        severity: 'HIGH',
        title: 'Semiconductor workforce gap in Gujarat',
        state: 'Gujarat',
        district: 'Sanand',
        linkedEntity: 'demo-event-id'
      },
      {
        severity: 'MEDIUM',
        title: 'EV technician shortage projected in Maharashtra',
        state: 'Maharashtra',
        district: 'Pune',
        linkedEntity: 'demo-event-ev'
      },
      {
        severity: 'LOW',
        title: 'Training capacity underused in Mehsana district',
        state: 'Gujarat',
        district: 'Mehsana'
      },
      {
        severity: 'MEDIUM',
        title: 'Project delay may create an 18% surplus',
        state: 'Gujarat',
        district: 'Sanand',
        linkedEntity: 'demo-event-id'
      }
    ]
  })

  // 9. Baseline Activation Plan for Demo Event
  const basePlan = await prisma.activationPlan.create({
    data: {
      id: 'demo-base-plan',
      eventId: event.id,
      status: 'PENDING',
      totals: JSON.stringify({
        demand: 2400,
        direct: 620,
        activated: 1010,
        residual: 770,
        cost: 14250000,
        utilization: '81%'
      })
    }
  })

  const initialAssignments = [
    { cohortKey: 'Ahmedabad-AutoTech-6w', district: 'Ahmedabad', pathwayId: 'path-1', centreId: 'Training Centre 0', cycle: 0, workers: 300, startWeek: 0, cost: 3600000 },
    { cohortKey: 'Ahmedabad-AutoTech-6w', district: 'Ahmedabad', pathwayId: 'path-1', centreId: 'Training Centre 1', cycle: 0, workers: 240, startWeek: 0, cost: 2880000 },
    { cohortKey: 'Gandhinagar-Mech-12w', district: 'Gandhinagar', pathwayId: 'path-2', centreId: 'Training Centre 2', cycle: 0, workers: 200, startWeek: 0, cost: 4000000 },
    { cohortKey: 'Mehsana-AutoTech-6w', district: 'Mehsana', pathwayId: 'path-1', centreId: 'Training Centre 3', cycle: 1, workers: 170, startWeek: 8, cost: 2040000 },
    { cohortKey: 'Gandhinagar-Mech-12w', district: 'Gandhinagar', pathwayId: 'path-2', centreId: 'Training Centre 4', cycle: 1, workers: 100, startWeek: 8, cost: 2000000 }
  ]

  for (const a of initialAssignments) {
    await prisma.activationAssignment.create({
      data: {
        planId: basePlan.id,
        cohortKey: a.cohortKey,
        district: a.district,
        pathwayId: a.pathwayId,
        centreId: a.centreId,
        cycle: a.cycle,
        workers: a.workers,
        startWeek: a.startWeek,
        cost: a.cost
      }
    })
  }

  // 10. Evidence & Audit Logs
  await prisma.evidence.createMany({
    data: [
      {
        entityType: 'Forecast',
        entityId: event.id,
        sources: JSON.stringify({ comparableProjectsCount: 11, dataRegistry: 'DPIIT & SemiCon India' }),
        assumptions: JSON.stringify({ regionalFactor: 1.0, hiringHorizonMonths: 18, techNode: '28nm' }),
        confidence: 0.72,
        modelVersionId: 'v0.4'
      },
      {
        entityType: 'ActivationPlan',
        entityId: basePlan.id,
        sources: JSON.stringify({ candidatePool: 1630, certifiedCentres: 5 }),
        assumptions: JSON.stringify({ maxRadiusKm: 60, cycleWeeks: 8, solver: 'HiGHS MILP' }),
        confidence: 0.85,
        modelVersionId: 'v0.4'
      }
    ]
  })

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: 'PLANNER',
        action: 'CREATE',
        entityType: 'EconomicEvent',
        entityId: event.id,
        before: '{}',
        after: JSON.stringify({ name: event.name, sector: event.sector, investmentCr: event.investmentCr }),
        reason: 'Initial registration of Gujarat Semiconductor Fab signal'
      },
      {
        actorId: 'SYSTEM',
        action: 'COMPILE_DEMAND',
        entityType: 'Forecast',
        entityId: event.id,
        before: '{}',
        after: JSON.stringify({ low: 2100, base: 2400, high: 2700, confidence: 0.72 }),
        reason: 'Demand engine compiled forecast against 11 comparable projects'
      },
      {
        actorId: 'SYSTEM',
        action: 'OPTIMIZE',
        entityType: 'ActivationPlan',
        entityId: basePlan.id,
        before: '{}',
        after: JSON.stringify({ activated: 1010, residual: 770, cost: 14250000 }),
        reason: 'HiGHS MILP optimizer generated cohort assignments'
      }
    ]
  })

  // 11. Historical Outcome
  // For golden test: forecast 500, actual 430
  const f = await prisma.forecast.create({
    data: {
      eventId: event.id,
      low: 450,
      base: 500,
      high: 550,
      confidence: 0.8,
      modelVersionId: demandModel.id,
      horizonMonths: 12
    }
  })
  await prisma.forecastActual.create({
    data: {
      forecastId: f.id,
      actual: 430,
      errorPct: -0.14,
      drivers: JSON.stringify(['training bottleneck', 'demand overestimation'])
    }
  })

  // Demo users
  const roles = ['PLANNER', 'ADMIN', 'EMPLOYER', 'TRAINING_AUTHORITY']
  for (const r of roles) {
    await prisma.user.create({
      data: {
        email: `${r.toLowerCase()}@demo.com`,
        role: r
      }
    })
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
