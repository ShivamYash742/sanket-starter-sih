# SANKET Engines

## Demand Engine (`demand.ts`)
Calculates workforce demand based on comparable projects.
- `projectRatio = workers / investmentCr` for each comparable project.
- Finds p10, p50, and p90 of `projectRatio`.
- `forecast = event.investmentCr * ratio * regionalFactor * demandFactor`.
- Component breakdown is exact fractions of the base forecast, rounded by largest remainder.

## Capability Engine (`capability.ts`)
Classifies a worker against a target occupation:
- `DIRECT`: Worker has all core skills of the target occupation with `profLow >= DIRECT_MIN`.
- `ONE_STEP`: Worker is missing exactly one core skill cluster, and a bridge path exists.
- `TWO_STEP`: Two steps needed.
- `NONE`: Otherwise.

## Gap Engine (`gap.ts`)
- `feasibleTransformable = min(classifiedTransformable, capacityBound)`
- `residual = max(0, demand - direct - feasibleTransformable)`

## Optimizer Engine (`optimizer.ts`)
*(To be implemented in M3)*

## Scenario Levers
- `demandFactor = (1 + demandPct) * investmentScale * hiringVelocityFactor`
- `migrationPct` scales available worker pool by `(1 + migrationPct)`
- `trainingCapacityPct` scales `seatsPerCycle`
- `delayWeeks` extends the `horizonWeeks`
