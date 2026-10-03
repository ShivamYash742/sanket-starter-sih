export const ENGINE_CONFIG = {
  // Classification
  DIRECT_MIN: 0.8, // Minimum proficiency required for DIRECT classification

  // Training
  RADIUS_KM: 60,
  CYCLE_BUFFER_WEEKS: 2,

  // Optimization
  LAMBDA_GAP: 1000000, // Large penalty for unactivated workers

  // Scenario Levers (defaults)
  SCENARIO_DEFAULTS: {
    demandPct: 0,
    hiringVelocityFactor: 1.0,
    delayWeeks: 0,
    migrationPct: 0,
    trainingCapacityPct: 1.0,
  }
}
