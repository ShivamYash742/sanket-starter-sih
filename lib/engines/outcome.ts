export function computeOutcomeError(forecast: number, actual: number): number {
  if (forecast === 0) return 0
  return (actual - forecast) / forecast
}
