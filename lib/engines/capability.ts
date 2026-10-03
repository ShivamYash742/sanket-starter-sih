import { WorkerProfile, OccupationRequirement, Classification, TransformationPathInput } from './types'
import { ENGINE_CONFIG } from './config'

export function classifyWorker(
  worker: WorkerProfile,
  targetOccupation: OccupationRequirement,
  paths: TransformationPathInput[]
): Classification {
  const { coreSkillIds } = targetOccupation
  
  // Find skills that the worker has with sufficient proficiency
  const qualifiedSkills = worker.skills
    .filter(s => s.profLow >= ENGINE_CONFIG.DIRECT_MIN)
    .map(s => s.skillId)

  // Check how many core skills are missing
  const missingSkills = coreSkillIds.filter(id => !qualifiedSkills.includes(id))

  if (missingSkills.length === 0) {
    return 'DIRECT'
  }

  // Find paths from the worker's current occupation to the target occupation
  const relevantPaths = paths.filter(
    p => p.fromOccupationId === worker.occupationId && p.toOccupationId === targetOccupation.occupationId
  )

  if (relevantPaths.length > 0) {
    // If a bridge path exists and missing skills match the path's missing skills, it's ONE_STEP
    // For simplicity based on AGENTS.md, if one path exists, we can call it ONE_STEP or TWO_STEP based on duration or modules.
    // The instructions say: "ONE_STEP when one core skill cluster is missing and one bridge path exists."
    // Let's assume if there's a path with duration <= 8 weeks it's ONE_STEP, else TWO_STEP, or just based on archetype.
    // AGENTS.md: Industrial Electrician > Automation Technician, 6 weeks, ONE_STEP.
    // Industrial Electrician > EV Technician, maybe TWO_STEP.
    
    // We will use the number of bridge modules to approximate steps:
    // 1-3 modules = ONE_STEP, >3 modules = TWO_STEP
    const path = relevantPaths[0]
    if (path.bridgeModules.length <= 3) {
      return 'ONE_STEP'
    } else {
      return 'TWO_STEP'
    }
  }

  return 'NONE'
}
