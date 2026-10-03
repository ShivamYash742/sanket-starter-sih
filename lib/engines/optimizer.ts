import { ENGINE_CONFIG } from './config'

export interface OptimizerCohort {
  id: string
  workers: number
  courseKey: string
  district: string
  lat: number
  lng: number
  durationWeeks: number
}

export interface OptimizerCentre {
  id: string
  courseKey: string
  seatsPerCycle: number
  costPerSeat: number
  cycles: number
  lat: number
  lng: number
}

export interface OptimizerResult {
  assignments: {
    cohortId: string
    centreId: string
    cycle: number
    workers: number
    cost: number
  }[]
  totalCost: number
  unactivated: Record<string, number>
}

// Distance helper since we need it for movement cost
function getDist(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function optimizeActivation(
  highsInstance: unknown,
  cohorts: OptimizerCohort[],
  centres: OptimizerCentre[],
  radiusKm: number = 60
): Promise<OptimizerResult> {
  const result: OptimizerResult = {
    assignments: [],
    totalCost: 0,
    unactivated: {}
  }

  // 1. Build string representation for CPLEX LP format to pass to HiGHS.
  // Using LP format:
  // Minimize
  //   obj: 100 x_c1_cen1_cyc0 + ... + 1000000 u_c1
  // Subject To
  //   cohort_c1: x_c1_cen1_cyc0 + ... + u_c1 = 100
  //   cap_cen1_cyc0: x_c1_cen1_cyc0 + x_c2_cen1_cyc0 <= 50
  // Bounds
  //   0 <= x_c1_cen1_cyc0 <= 100
  //   0 <= u_c1 <= 100
  // General
  //   x_c1_cen1_cyc0
  //   u_c1
  // End

  let obj = 'Minimize\n  obj: '
  const st: string[] = []
  const bounds: string[] = []
  const integerVars: string[] = []
  
  // Maps to track terms for constraints
  const cohortTerms: Record<string, string[]> = {}
  const capacityTerms: Record<string, string[]> = {}
  
  // Map back var names to data
  const varMap: Record<string, { cohortId: string, centreId: string, cycle: number, cost: number }> = {}

  cohorts.forEach(c => {
    cohortTerms[c.id] = []
    
    // Unactivated variable for this cohort
    const uVar = `u_${c.id.replace(/-/g, '_')}`
    cohortTerms[c.id].push(uVar)
    bounds.push(`  0 <= ${uVar} <= ${c.workers}`)
    integerVars.push(`  ${uVar}`)
    
    // It's the first term in obj
    obj += `${ENGINE_CONFIG.LAMBDA_GAP} ${uVar} + `
    
    // Find valid centres for this cohort's course within radius
    const validCentres = centres.filter(cen => 
      cen.courseKey === c.courseKey && 
      getDist(c.lat, c.lng, cen.lat, cen.lng) <= radiusKm
    )

    validCentres.forEach(cen => {
      const dist = getDist(c.lat, c.lng, cen.lat, cen.lng)
      const movementCost = dist * 10 // Arbitrary cost factor per km
      
      for (let cyc = 0; cyc < cen.cycles; cyc++) {
        const xVar = `x_${c.id.replace(/-/g, '_')}_${cen.id.replace(/-/g, '_')}_${cyc}`
        varMap[xVar] = { cohortId: c.id, centreId: cen.id, cycle: cyc, cost: cen.costPerSeat + movementCost }
        
        cohortTerms[c.id].push(xVar)
        
        const capKey = `${cen.id}_${cyc}`
        if (!capacityTerms[capKey]) capacityTerms[capKey] = []
        capacityTerms[capKey].push(xVar)
        
        bounds.push(`  0 <= ${xVar} <= ${c.workers}`)
        integerVars.push(`  ${xVar}`)
        
        const timeWeight = cyc * 100 // Prefer earlier cycles
        const totalVarCost = cen.costPerSeat + movementCost + timeWeight
        
        obj += `${totalVarCost} ${xVar} + `
      }
    })
  })

  // Strip trailing " + " from obj
  obj = obj.replace(/ \+ $/, '\n')

  // Build Subject To
  st.push('Subject To')
  
  // Cohort constraints
  cohorts.forEach(c => {
    const terms = cohortTerms[c.id]
    if (terms.length > 0) {
      st.push(`  coh_${c.id.replace(/-/g, '_')}: ${terms.join(' + ')} = ${c.workers}`)
    }
  })

  // Capacity constraints
  centres.forEach(cen => {
    for (let cyc = 0; cyc < cen.cycles; cyc++) {
      const capKey = `${cen.id}_${cyc}`
      const terms = capacityTerms[capKey]
      if (terms && terms.length > 0) {
        st.push(`  cap_${cen.id.replace(/-/g, '_')}_${cyc}: ${terms.join(' + ')} <= ${cen.seatsPerCycle}`)
      }
    }
  })

  const lpString = [
    obj,
    st.join('\n'),
    'Bounds',
    bounds.join('\n'),
    'General',
    integerVars.join('\n'),
    'End'
  ].join('\n')

  try {
    const solution = await highsInstance.solve(lpString)
    
    // Parse HiGHS solution
    if (solution.IsOptimal || solution.Status === 'Optimal') {
      const vals = solution.Columns
      for (const [vName, vObj] of Object.entries(vals)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = Math.round((vObj as any).Primal)
        if (count > 0) {
          if (vName.startsWith('u_')) {
            const cohId = vName.substring(2).replace(/_/g, '-')
            result.unactivated[cohId] = count
          } else if (vName.startsWith('x_')) {
            const data = varMap[vName]
            if (data) {
              result.assignments.push({
                cohortId: data.cohortId,
                centreId: data.centreId,
                cycle: data.cycle,
                workers: count,
                cost: data.cost * count
              })
              result.totalCost += data.cost * count
            }
          }
        }
      }
    } else {
      console.warn('HiGHS did not find optimal solution, falling back to greedy')
      return fallbackGreedy(cohorts, centres, radiusKm)
    }
  } catch (err) {
    console.error('HiGHS failed, falling back to greedy', err)
    return fallbackGreedy(cohorts, centres, radiusKm)
  }

  return result
}

function fallbackGreedy(cohorts: OptimizerCohort[], centres: OptimizerCentre[], radiusKm: number): OptimizerResult {
  const result: OptimizerResult = { assignments: [], totalCost: 0, unactivated: {} }
  // Keep track of remaining seats
  const seats: Record<string, number[]> = {}
  centres.forEach(c => {
    seats[c.id] = new Array(c.cycles).fill(c.seatsPerCycle)
  })

  cohorts.forEach(coh => {
    let unactivated = coh.workers
    
    const valid = centres.filter(c => c.courseKey === coh.courseKey && getDist(coh.lat, coh.lng, c.lat, c.lng) <= radiusKm)
    
    // Sort by cost
    valid.sort((a, b) => a.costPerSeat - b.costPerSeat)

    for (const cen of valid) {
      if (unactivated <= 0) break
      for (let cyc = 0; cyc < cen.cycles; cyc++) {
        if (unactivated <= 0) break
        const avail = seats[cen.id][cyc]
        if (avail > 0) {
          const assign = Math.min(avail, unactivated)
          seats[cen.id][cyc] -= assign
          unactivated -= assign
          const movementCost = getDist(coh.lat, coh.lng, cen.lat, cen.lng) * 10
          result.assignments.push({
            cohortId: coh.id,
            centreId: cen.id,
            cycle: cyc,
            workers: assign,
            cost: (cen.costPerSeat + movementCost) * assign
          })
          result.totalCost += (cen.costPerSeat + movementCost) * assign
        }
      }
    }
    
    if (unactivated > 0) {
      result.unactivated[coh.id] = unactivated
    }
  })

  return result
}
