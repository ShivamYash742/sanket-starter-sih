import { TransformationPathInput } from './types'

export interface Coords {
  lat: number
  lng: number
}

export interface CentreWithDistance {
  id: string
  name: string
  distanceKm: number
}

// Haversine formula
export function getDistanceKm(coord1: Coords, coord2: Coords): number {
  const R = 6371 // Earth radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180)
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function rankTransformationPaths(paths: TransformationPathInput[]): TransformationPathInput[] {
  // Rank based on shortest duration, then lowest cost.
  // We can add employer demand or historical success later.
  return [...paths].sort((a, b) => {
    if (a.durationWeeks !== b.durationWeeks) {
      return a.durationWeeks - b.durationWeeks
    }
    // Assume paths have costPerWorker if we extend the type
    const costA = (a as TransformationPathInput & { costPerWorker?: number }).costPerWorker || 0
    const costB = (b as TransformationPathInput & { costPerWorker?: number }).costPerWorker || 0
    return costA - costB
  })
}
