import { optimizeActivation } from './lib/engines/optimizer'
import highs from 'highs'

async function run() {
  const h = await highs()
  // let's monkey patch highs to log the exact LP string and output
  const originalSolve = h.solve
  h.solve = async function(lp) {
    console.log("LP String:\n", lp)
    const sol = await originalSolve.call(h, lp)
    console.log("Solution:\n", sol)
    return sol
  }
  const cohorts = [
    { id: 'coh-1', workers: 540, courseKey: 'Auto Tech', district: 'Ahmedabad', lat: 23.02, lng: 72.57, durationWeeks: 6 },
    { id: 'coh-2', workers: 470, courseKey: 'Auto Tech', district: 'Gandhinagar', lat: 23.21, lng: 72.68, durationWeeks: 10 }
  ]
  const centres = [
    { id: 'cen-1', courseKey: 'Auto Tech', seatsPerCycle: 300, costPerSeat: 15000, cycles: 3, lat: 23.00, lng: 72.50 },
    { id: 'cen-2', courseKey: 'Auto Tech', seatsPerCycle: 200, costPerSeat: 18000, cycles: 2, lat: 23.25, lng: 72.70 }
  ]
  const result = await optimizeActivation(h, cohorts, centres, 60)
  console.log(JSON.stringify(result, null, 2))
}
run()
