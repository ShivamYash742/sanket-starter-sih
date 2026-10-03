export type Classification = 'DIRECT' | 'ONE_STEP' | 'TWO_STEP' | 'NONE'
export type SkillStatus = 'VERIFIED' | 'INFERRED'

export interface WorkerSkillInput {
  skillId: string
  profLow: number
  profHigh: number
  status: SkillStatus
  confidence: number
}

export interface WorkerProfile {
  id: string
  occupationId: string
  skills: WorkerSkillInput[]
}

export interface OccupationRequirement {
  occupationId: string
  coreSkillIds: string[]
}

export interface TransformationPathInput {
  id: string
  fromOccupationId: string
  toOccupationId: string
  bridgeModules: string[]
  missingSkills: string[]
  durationWeeks: number
}

export interface ForecastResult {
  low: number
  base: number
  high: number
  confidence: number
  components: { occupationId: string; count: number }[]
  evidenceRefs: string[]
}

export interface ClassificationResult {
  workerId: string
  classification: Classification
  targetOccupationId?: string
  pathwayId?: string
}

export interface GapResult {
  demand: number
  direct: number
  classifiedTransformable: number
  feasibleTransformable: number
  residual: number
  capacityBound: number
}
