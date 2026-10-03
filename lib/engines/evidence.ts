export interface EvidenceRecord {
  entityType: string
  entityId: string
  sources: Record<string, unknown>
  assumptions: Record<string, unknown>
  confidence: number
  modelVersionId: string
}

export function recordEvidence(
  entityType: string,
  entityId: string,
  sources: Record<string, unknown>,
  assumptions: Record<string, unknown>,
  confidence: number,
  modelVersionId: string
): EvidenceRecord {
  // In a real app, this would write to the database.
  // For the pure engine, it just returns the record to be written by the service layer.
  return {
    entityType,
    entityId,
    sources,
    assumptions,
    confidence,
    modelVersionId
  }
}
