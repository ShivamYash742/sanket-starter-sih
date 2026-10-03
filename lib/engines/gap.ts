import { GapResult } from './types'

export function computeGap(
  demand: number,
  direct: number,
  classifiedTransformable: number,
  capacityBound: number
): GapResult {
  const feasibleTransformable = Math.min(classifiedTransformable, capacityBound)
  const residual = Math.max(0, demand - direct - feasibleTransformable)

  return {
    demand,
    direct,
    classifiedTransformable,
    feasibleTransformable,
    residual,
    capacityBound
  }
}
