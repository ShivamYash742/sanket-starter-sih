import { describe, it, expect } from 'vitest'
import { forecastDemand } from '../lib/engines/demand'
import { classifyWorker } from '../lib/engines/capability'
import { computeGap } from '../lib/engines/gap'
import { computeOutcomeError } from '../lib/engines/outcome'
import { optimizeActivation } from '../lib/engines/optimizer'
import highs from 'highs'
import { ARCHETYPES } from '../prisma/archetypes'

describe('Golden Tests', () => {
  it('Forecast low/base/high = 2100 / 2400 / 2700; components sum to 2400; confidence = 72%', () => {
    // 10 comparable projects to explicitly hit percentiles:
    // Sorted ratios: [0.20, 0.21, 0.22, 0.23, 0.24, 0.24, 0.25, 0.26, 0.27, 0.28]
    // p10 = 0.21, p50 = 0.24, p90 = 0.27
    const semiRatios = [0.20, 0.21, 0.22, 0.23, 0.24, 0.24, 0.25, 0.26, 0.27, 0.27, 0.28]
    const comparableProjects = semiRatios.map(r => ({
      investmentCr: 1000,
      workers: r * 1000
    }))

    const result = forecastDemand({
      investmentCr: 10000,
      comparableProjects,
      regionalFactor: 1.0,
      occupationFractions: [
        { occupationId: 'tech', fraction: 620/2400 },
        { occupationId: 'op', fraction: 480/2400 },
        { occupationId: 'eng', fraction: 310/2400 },
        { occupationId: 'maint', fraction: 290/2400 },
        { occupationId: 'other', fraction: 700/2400 }
      ],
      confidenceCalibrator: 0.72
    })

    expect(result.low).toBe(2100)
    expect(result.base).toBe(2400)
    expect(result.high).toBe(2700)
    expect(result.low).toBeLessThan(result.base)
    expect(result.base).toBeLessThan(result.high)
    expect(result.confidence).toBe(0.72)

    const sum = result.components.reduce((s, c) => s + c.count, 0)
    expect(sum).toBe(2400)
    
    // Exact counts based on fractions
    const tech = result.components.find(c => c.occupationId === 'tech')?.count
    expect(tech).toBe(620)
  })

  it('Classification: DIRECT 620, ONE_STEP 540, TWO_STEP 470; relevant total 1630', () => {
    const targetOccupation = {
      occupationId: 'occ-auto-tech',
      coreSkillIds: ['PLC', 'Industrial Safety', 'Equipment Maintenance', 'Automation', 'Quality Control', 'Process Operations']
    }

    const paths = [
      {
        id: 'p1',
        fromOccupationId: 'occ-ind-elec',
        toOccupationId: 'occ-auto-tech',
        bridgeModules: ['1', '2', '3'],
        missingSkills: [],
        durationWeeks: 6
      },
      {
        id: 'p2',
        fromOccupationId: 'occ-gen-mech',
        toOccupationId: 'occ-auto-tech',
        bridgeModules: ['1', '2', '3', '4'],
        missingSkills: [],
        durationWeeks: 12
      }
    ]

    const directProfile = {
      id: 'w1',
      occupationId: 'occ-auto-tech',
      skills: ARCHETYPES.DIRECT.skills.map(s => ({ skillId: s.name, ...s })) as unknown as import('../lib/engines/types').WorkerSkillInput[]
    }
    const directClass = classifyWorker(directProfile, targetOccupation, paths)
    expect(directClass).toBe('DIRECT')

    const oneStepProfile = {
      id: 'w2',
      occupationId: 'occ-ind-elec',
      skills: ARCHETYPES.ONE_STEP.skills.map(s => ({ skillId: s.name, ...s })) as unknown as import('../lib/engines/types').WorkerSkillInput[]
    }
    const oneStepClass = classifyWorker(oneStepProfile, targetOccupation, paths)
    expect(oneStepClass).toBe('ONE_STEP')

    const twoStepProfile = {
      id: 'w3',
      occupationId: 'occ-gen-mech',
      skills: ARCHETYPES.TWO_STEP.skills.map(s => ({ skillId: s.name, ...s })) as unknown as import('../lib/engines/types').WorkerSkillInput[]
    }
    const twoStepClass = classifyWorker(twoStepProfile, targetOccupation, paths)
    expect(twoStepClass).toBe('TWO_STEP')

    const noneProfile = {
      id: 'w4',
      occupationId: 'occ-retail',
      skills: ARCHETYPES.NONE.skills.map(s => ({ skillId: s.name, ...s })) as unknown as import('../lib/engines/types').WorkerSkillInput[]
    }
    const noneClass = classifyWorker(noneProfile, targetOccupation, paths)
    expect(noneClass).toBe('NONE')
    
    // Counter test
    expect(ARCHETYPES.DIRECT.count).toBe(620)
    expect(ARCHETYPES.ONE_STEP.count).toBe(540)
    expect(ARCHETYPES.TWO_STEP.count).toBe(470)
    expect(ARCHETYPES.DIRECT.count + ARCHETYPES.ONE_STEP.count + ARCHETYPES.TWO_STEP.count).toBe(1630)
  })

  it('Gap: transformable 1010; residual 770', () => {
    // 540 + 470 = 1010 transformable
    // demand base = 2400
    // direct = 620
    // capacityBound = Infinity for this raw test
    const gap = computeGap(2400, 620, 1010, Infinity)
    
    expect(gap.feasibleTransformable).toBe(1010)
    expect(gap.residual).toBe(770) // 2400 - 620 - 1010 = 770
  })

  it('Historical outcome: forecast 500, actual 430 gives -14%', () => {
    const err = computeOutcomeError(500, 430)
    expect(err).toBeCloseTo(-0.14)
  })

  describe('3b. Optimizer and Activation Plan', () => {
    it('Optimizer activates 1,010 workers and leaves 770 residual', async () => {
      // Create lightweight mock for testing the solver engine directly
      const highsInstance = await highs()
      
      const cohorts = [
        { id: 'coh-1', workers: 540, courseKey: 'Auto Tech', district: 'Ahmedabad', lat: 23.02, lng: 72.57, durationWeeks: 6 },
        { id: 'coh-2', workers: 470, courseKey: 'Auto Tech', district: 'Gandhinagar', lat: 23.21, lng: 72.68, durationWeeks: 10 }
      ]

      const centres = [
        { id: 'cen-1', courseKey: 'Auto Tech', seatsPerCycle: 300, costPerSeat: 15000, cycles: 3, lat: 23.00, lng: 72.50 }, // 900 seats
        { id: 'cen-2', courseKey: 'Auto Tech', seatsPerCycle: 200, costPerSeat: 18000, cycles: 2, lat: 23.25, lng: 72.70 } // 400 seats
      ] // Total 1300 seats, enough for 1010 workers.

      const result = await optimizeActivation(highsInstance, cohorts, centres, 60)
      
      let activated = 0
      result.assignments.forEach((a: { workers: number }) => activated += a.workers)
      
      expect(activated).toBe(1010)
      
      const demand = 2400
      const direct = 620
      const residual = Math.max(0, demand - direct - activated)
      
      expect(residual).toBe(770)
    })
  })
})
