import { ENGINE_CONFIG } from './config'

export interface CourseCapacity {
  centreId: string
  courseKey: string
  durationWeeks: number
  seatsPerCycle: number
}

export function computeCapacityCycles(
  horizonWeeks: number,
  durationWeeks: number
): number {
  if (horizonWeeks <= 0 || durationWeeks <= 0) return 0
  return Math.floor(horizonWeeks / (durationWeeks + ENGINE_CONFIG.CYCLE_BUFFER_WEEKS))
}

export function calculateTotalCapacity(
  capacities: CourseCapacity[],
  horizonWeeks: number
): number {
  let totalSeats = 0
  for (const cap of capacities) {
    const cycles = computeCapacityCycles(horizonWeeks, cap.durationWeeks)
    totalSeats += cycles * cap.seatsPerCycle
  }
  return totalSeats
}
