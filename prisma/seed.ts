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

  // 2. Comparable Projects
  const sectors = ['SEMICONDUCTOR', 'EV', 'SOLAR']
  for (let i = 0; i < 12; i++) {
    // just dummy projects
  }

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

  // 7. Demo Event
  const employer = await prisma.employer.create({ data: { name: 'Demo Employer' } })
  const event = await prisma.economicEvent.create({
    data: {
      name: 'Semiconductor Facility',
      employerId: employer.id,
      sector: 'SEMICONDUCTOR',
      state: 'Gujarat',
      district: 'Sanand',
      investmentCr: 10000,
      projectType: 'Greenfield',
      technology: 'Advanced Node',
      startDate: new Date(),
      operationalDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000), // 18 months
      expectedHiring: 2500,
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

  await prisma.alert.create({
    data: {
      severity: 'HIGH',
      title: 'Semiconductor workforce gap in Gujarat',
      state: 'Gujarat',
      district: 'Sanand'
    }
  })

  // 9. Historical Outcome
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
      drivers: JSON.stringify(['training bottleneck'])
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
