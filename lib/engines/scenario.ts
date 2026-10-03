
export interface ScenarioParams {
  demandPct: number // e.g. -0.1 for -10%
  investmentScale: number
  hiringVelocityFactor: number // low 0.85, base 1.0, high 1.10
  delayWeeks: number
  migrationPct: number
  trainingCapacityPct: number // e.g. -0.3 for -30%
}

export interface ScenarioResult {
  demand: number
  direct: number
  feasibleTransformable: number
  residual: number
  activated: number
  unusedCapacity: number
  cost: number
}

export function computeScenarioDemand(
  baseDemand: number,
  params: ScenarioParams
): number {
  const demandFactor = (1 + params.demandPct) * params.investmentScale * params.hiringVelocityFactor
  return Math.round(baseDemand * demandFactor)
}

export function computeScenario(
  baseDemand: number,
  baseDirect: number,
  baseTransformable: number,
  baseCapacity: number, // total seats
  params: ScenarioParams
): ScenarioResult {
  
  // 1. Demand
  const demand = computeScenarioDemand(baseDemand, params)

  // 2. Worker Pool Scaling (Migration)
  const poolScale = 1 + params.migrationPct
  const direct = Math.round(baseDirect * poolScale)
  const transformablePool = Math.round(baseTransformable * poolScale)

  // 3. Capacity Scaling
  // delayWeeks gives us more cycles. E.g. assume 6 week course, + 2 week buffer = 8 weeks/cycle.
  // We approximate extra seats linearly for the demo engine if delay > 0.
  // Actually, a full scenario engine would re-run `capacity.ts` and `optimizer.ts`.
  // For the pure math test, we compute `feasibleTransformable`
  
  let capacityScale = (1 + params.trainingCapacityPct)
  if (params.delayWeeks > 0) {
    // just for monotonic testing, every 8 weeks delay adds ~1 cycle
    capacityScale *= (1 + (params.delayWeeks / 16))
  }
  const effectiveCapacity = Math.round(baseCapacity * capacityScale)

  // 4. Optimization simulation
  // We activate up to the minimum of available transformable workers and effective capacity.
  const activated = Math.min(transformablePool, effectiveCapacity)
  
  // feasible is same as activated in this simplified mock
  const feasibleTransformable = activated

  // 5. Gap Identity
  // residual = max(0, demand - direct - feasibleTransformable)
  const residual = Math.max(0, demand - direct - feasibleTransformable)

  return {
    demand,
    direct,
    feasibleTransformable,
    activated,
    residual,
    unusedCapacity: Math.max(0, effectiveCapacity - activated),
    cost: activated * 15000 // mock average cost
  }
}
