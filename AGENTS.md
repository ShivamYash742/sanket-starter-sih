# SANKET: Workforce Command Centre (SIH26246)

Web application only. No mobile app. One Next.js codebase containing UI, backend, database layer, seed data and engines.

## 1. Product x 

SANKET converts an economic signal (a new factory, an investment, a technology shift) into an evidence-backed workforce plan, then tracks real outcomes and recalibrates.

Loop: Economic event > Demand forecast > Capability map > Workforce gap > Transformation paths > Training capacity > Optimized activation plan > Scenario stress test > Human approval > Implementation monitoring > Outcome vs forecast > Recalibration.

Principles:
- AI recommends, an authorized human decides.
- Every number traces to the database or an engine. No KPI is hardcoded in a component.
- LLM interprets. Statistics predict. Ontology maps. Optimizer allocates.
- Forecasting is a transparent comparable-projects model with ranges. It is not a trained neural model. Do not describe it as one in UI copy.

## 2. Agent rules (non-negotiable)

1. Read this file and the active milestone in MILESTONES.md before acting. Work on one milestone only.
2. Plan first. Output the plan (files to create or change, risks, open questions). Write no code until the plan is approved.
3. Before using any API of Next.js 16, Prisma 7, Better Auth, react-leaflet or highs, check the current official docs. Do not code these from memory.
4. Never hardcode golden numbers (section 8) in engines, components or seed counts. Never edit golden tests or archetype counts to make a test pass. Fix the engine or the archetypes.
5. Never fabricate a missing asset (India GeoJSON, API key, design reference, connection string). Stop and ask.
6. Every state-changing route handler: Zod validation, requireRole(), an AuditLog row, and an Evidence row when the result is AI-derived.
7. At milestone end: run `npm run typecheck && npm run lint && npm test`, run the sanket-verify skill, print an acceptance checklist with PASS or FAIL per item, commit, and stop. Do not start the next milestone.
8. No Python services. No Server Actions for mutations. No libraries beyond section 3 without asking.
9. Small commits with conventional messages.

## 3. Stack (fixed; use latest stable and verify against current docs)

- Next.js 16, App Router, TypeScript strict. Use `proxy.ts` (not `middleware.ts`) for session gating. Also call `requireRole()` inside every route handler and every server-side data function. In Next.js 16, `params`, `cookies()` and `headers()` are async.
- Backend: Route Handlers only, under `app/api`.
- Tailwind CSS v4 (CSS-first config) + shadcn/ui + lucide-react.
- PostgreSQL + Prisma 7. Local development uses the Postgres container in `docker-compose.yml` (`DATABASE_URL` and `DIRECT_URL` both point to it). Neon is optional later for deployment, with the pooled URL in `DATABASE_URL` and the direct URL in `DIRECT_URL`. Prisma 7 setup: `@prisma/adapter-pg` + `pg`, `prisma.config.ts` holding the datasource and `seed: "tsx prisma/seed.ts"`, explicit dotenv loading, the `prisma-client` generator per current docs. `DATABASE_URL` is the pooled URL used at runtime. `DIRECT_URL` is the direct URL used for migrations. No PostGIS: store `lat` and `lng` as floats and compute distance with Haversine.
- Auth: Better Auth, email + password, Prisma adapter, `role` as an additional user field. Sessions in cookies. Roles per section 5.
- Validation: Zod on every request body and query.
- Charts: Recharts.
- Maps: react-leaflet loaded with `next/dynamic({ ssr: false })`. State-level choropleth from `public/geo/india-states.geojson` (already in the repo: 36 states and UTs, simplified, DataMeet, CC BY 4.0; keep the attribution visible in the map footer and in README). Join on the `name` property. Do not replace or edit the outlines. Add district and centre markers on top. No district polygons. Use a plain light background instead of third-party tiles for the Control Room map.
- Optimization: `highs` (HiGHS, WASM). Routes using it set `runtime = 'nodejs'`, pass `locateFile` for the wasm, set a solver time limit of 8 seconds, and use cohort-level variables.
- LLM: OpenAI-compatible wrapper `lib/llm.ts` using the `openai` npm package with env `LLM_BASE_URL` (default `https://integrate.api.nvidia.com/v1`), `LLM_API_KEY` (NVIDIA key from build.nvidia.com), `LLM_MODEL` (default `nvidia/nemotron-3-super-120b-a12b`). Nemotron 3 Super is a reasoning model: send `extra_body: { chat_template_kwargs: { enable_thinking: false } }` for extraction and explanation calls, read only `message.content` (never `reasoning_content`), strip any think tags, set a 30s timeout, and request JSON for extraction then validate it with Zod. Verify the current request format in NVIDIA's docs before coding. Used ONLY for (a) parsing a pasted or uploaded event description into form fields and (b) writing the "Why this forecast?" explanation text. Deterministic template fallback when no key is set. Never use an LLM for forecasting, matching, scoring or optimization.
- Tests: Vitest for engines and golden tests. Playwright smoke test of the demo flow in M5.
- Number formatting: `en-IN` locale (lakh/crore grouping) for large figures; currency in rupees.

## 4. Design system (minimal, government-grade)

Visual reference: if images exist in `design/reference/`, match their layout, spacing and colour first. Otherwise use the tokens below.

- Light theme only. Background `#F8FAFC`, surface `#FFFFFF`, border `#E2E8F0`.
- Primary navy `#0B2A4A`. Accent saffron `#E8761A` (primary buttons, active nav bar, key alerts only). Success `#138808`. Warning `#B7791F`. Danger `#C53030`. Text `#0F172A`, muted `#64748B`.
- Font Inter. Scale 12 / 14 / 16 / 20 / 28. KPI numbers 28 semibold.
- Layout: fixed left sidebar 240px (navy, white text, saffron active bar), top bar with page title, role badge, user menu. Content max-width 1280, 24px gutters.
- Cards: white, 1px border, 8px radius, no shadow (modals only). Tables: dense, sticky header, no zebra. Charts: navy, saffron and slate only. No gradients, no illustrations, no animation beyond 150ms transitions.
- Every AI-derived value has a "Why?" link that opens a right-side drawer: evidence, assumptions, confidence, model name and version, timestamp.
- Every seeded record shows a gray SYNTHETIC badge wherever provenance is displayed.
- Every page implements loading skeleton, empty state and error state.
- Desktop-first, usable down to 1024px. WCAG AA contrast, visible focus rings, keyboard navigable, text alternatives for charts. Lighthouse accessibility >= 90 on the Control Room.

## 5. Roles and access

Enforced in `proxy.ts` AND in every route handler and server data function.

- PLANNER: all planning screens; create events; generate plans; run scenarios; approve, modify, reject.
- TRAINING_AUTHORITY: Training Capacity; Activation Plans (read); assigned cohorts.
- EMPLOYER: own Economic Events; aggregated capability only; no individual worker records.
- ADMIN: everything, plus Administration and Audit.
- Individual worker records: PLANNER and ADMIN only. Default views are aggregated.
- Login requires an email, a password and a role; the chosen role must match the account role.

Navigation: Control Room | Economic Signals | Workforce Demand | Capability Map | Transformation Lab | Training Capacity | Activation Plans | Scenario Lab | Outcomes | Evidence & Audit | Administration. Hide items the role cannot access.

## 6. Data model (Prisma; enums, relations, indexes, createdAt, updatedAt)

- Auth and access: User (role enum), Consent (workerId, purpose, granted).
- Ontology: Occupation (code, name, aliases[]), Skill (name, category, isEmerging), OccupationSkill, SkillRelationship (fromSkillId, toSkillId, similarity).
- Workforce: Worker (workerRef, occupationId, state, district, lat, lng, experienceYears, availability, dataSource enum PUBLIC|PARTNER|SYNTHETIC), WorkerSkill (skillId, profLow, profHigh, status enum VERIFIED|INFERRED, evidence, confidence), WorkerCertification, WorkerTraining.
- Demand: Employer, EconomicEvent (name, sector, state, district, investmentCr, projectType, technology, startDate, operationalDate, expectedHiring, status), Project, ComparableProject (sector, investmentCr, workers, state), Forecast (eventId, low, base, high, confidence, modelVersionId, horizonMonths), ForecastComponent (occupationId, count), ProjectSkill.
- Training: TrainingCentre (name, state, district, lat, lng), CentreCourse (centreId, courseKey, seatsPerCycle, seatsUsed, durationWeeks, costPerSeat), CentreCapacity (convertible json), CentreTrainer, CentreEquipment.
- Transformation: TransformationPath (fromOccupationId, toOccupationId, bridgeModules json, missingSkills json, durationWeeks, costPerWorker, employerDemand, historicalSuccess, confidence).
- Planning: ActivationPlan (eventId, status enum DRAFT|PENDING|APPROVED|MODIFIED|REJECTED, totals json, scenarioId?), ActivationAssignment (planId, cohortKey, district, pathwayId, centreId, cycle, workers, startWeek, cost), Scenario (baseEventId, params json), ScenarioResult (metrics json).
- Trust and learning: Evidence (entityType, entityId, sources json, assumptions json, confidence, modelVersionId), Assumption, ModelVersion (name, version, params json), Application, Outcome (workerId, planId, stage enum ENROLLED|COMPLETED|CERTIFIED|APPLIED|PLACED, wageBand, retained, at), ForecastActual (forecastId, actual, errorPct, drivers json), AuditLog (actorId, action, entityType, entityId, before json, after json, reason, modelVersionId, at).
- Aggregates and alerts: NationalAggregate (scope NATIONAL|STATE, key, metrics json, dataSource), Alert (severity, title, state, district, linkedEntity).

## 7. Modeling rules

- Engines are pure functions in `lib/engines`. Database access lives in `lib/services`. Shared types in `lib/engines/types.ts`. Tunable constants in `lib/engines/config.ts`.
- Capacity is time-based. `horizonWeeks` = weeks from plan date to the operational date, plus `delayWeeks`. `cycles = floor(horizonWeeks / (durationWeeks + CYCLE_BUFFER_WEEKS))` with `CYCLE_BUFFER_WEEKS = 2`. `seatsPerCycle` applies per centre per course per cycle.
- Classification (config thresholds): DIRECT when every core skill required by the target occupation has `profLow >= DIRECT_MIN` and the evidence meets the verified rule below. ONE_STEP when one core skill cluster is missing and one bridge path exists. TWO_STEP when two steps are needed. NONE otherwise (excluded from "relevant").
- Verified versus inferred: never present an INFERRED skill as certified. Show both with ranges and confidence. DIRECT may rely on INFERRED skills only when confidence is High; mark such workers "inferred-ready" in the UI.
- Gap: `feasibleTransformable = min(classifiedTransformable, capacityBound)`. `residual = max(0, demand - direct - feasibleTransformable)`. Report any surplus separately. After optimization, `residual = max(0, demand - direct - activated)`.
- Scenario levers: `demandFactor = (1 + demandPct) * investmentScale * hiringVelocityFactor` (low 0.85, base 1.00, high 1.10). `delayWeeks` extends the horizon. `migrationPct` scales the available worker pool by `(1 + migrationPct)`. `trainingCapacityPct` scales `seatsPerCycle`. Document every formula in `lib/engines/README.md`.
- Control Room KPIs for India and states come from `NationalAggregate` rows (SYNTHETIC). Event-level numbers come only from engines.
- Demo districts: Ahmedabad, Gandhinagar, Mehsana. Do not use the labels District A/B/C.

## 8. Seed and golden numbers

`prisma/seed.ts`: deterministic (seeded PRNG, seed 26246), idempotent (safe to rerun), everything `dataSource = SYNTHETIC`. Worker IDs like `W-000001`; no names or real personal data. Provide `npm run db:reset`.

- Demo event: Semiconductor Facility, Sanand, Gujarat. Sector SEMICONDUCTOR. `investmentCr = 10000` (illustrative). Operational in 18 months.
- Comparable projects: at least 12 synthetic projects across SEMICONDUCTOR, EV, SOLAR. SEMICONDUCTOR workers per rupee crore: p10 / p50 / p90 = 0.21 / 0.24 / 0.27. Gujarat regional factor 1.00. Result: 2,100 / 2,400 / 2,700.
- Occupation mix as exact fractions of the base: Technicians 620/2400, Operators 480/2400, Engineers 310/2400, Maintenance 290/2400, Other 700/2400, rounded by largest remainder so components sum to the base.
- Confidence comes from a formula over comparable count and spread, with constants stored in ModelVersion `Demand` v0.4 params, calibrated so the demo event returns 72%.
- Skills needed: PLC, Industrial Safety, Equipment Maintenance, Automation, Quality Control, Process Operations.
- Workers: 2,000 across Ahmedabad, Gandhinagar, Mehsana, built from fixed archetypes in `prisma/archetypes.ts`. 1,630 relevant = 620 DIRECT + 540 ONE_STEP + 470 TWO_STEP. 370 are NONE. Include the archetype: Industrial Electrician, 7 years, verified Electrical Systems / Industrial Safety / Troubleshooting, inferred PLC 48-57%, ONE_STEP to Automation Technician. Archetypes are designed against `config.ts` thresholds.
- Training: 126 centres across Gujarat and Maharashtra (generated; real district names; coordinates inside state bounds). Courses: PLC, Automation, EV Technician, Solar Technician, Welding, Fitter. Network current capacity per cycle: Electrician 300, Fitter 200, Welder 100. Convertible per cycle: EV Technician 200, Solar Technician 150, Automation 100. Seed seats so the base-case plan fully activates all feasible transformable workers within the horizon at no more than 85% overall utilization, and so capacity -30% leaves some unactivated.
- Transformation paths: Industrial Electrician > Automation Technician, 6 weeks, bridge modules PLC Fundamentals, Industrial Automation, Control Systems, Medium/High confidence; an alternative 10-week path with higher wage potential and Medium confidence. Also Industrial Electrician > EV Technician and > Industrial Maintenance.
- NationalAggregate: national row with emerging demand +18%, workforce required 2.4M, deployable 1.3M, transformable 620K, residual 480K, training capacity 710K, active plans 126, forecast confidence 78%. State rows for at least 8 states summing to the national row.
- Alerts: semiconductor workforce gap in Gujarat; EV technician shortage projected in Maharashtra; training capacity underused in one district; project delay may create an 18% surplus.
- Historical: EV Technicians, Maharashtra: forecast 500, actual 430, error -14%.
- Demo users: one per role. Passwords documented in README.

Golden tests (`tests/golden.test.ts`, required to pass at every milestone from M2a on):
- Forecast low/base/high = 2100 / 2400 / 2700; low < base < high; occupation components sum to 2400; confidence = 72%.
- Classification: DIRECT 620, ONE_STEP 540, TWO_STEP 470; relevant total 1630.
- Gap: transformable 1010; residual 770.
- Scenario demand -10% alone: demand 2160, direct 620, transformable 1010, residual 530.
- Scenario training capacity -30%: activated < 1010 and residual > 770.
- Scenario identity: `residual = max(0, demand - direct - feasible)` holds for every scenario run.
- Scenario delay: feasible transformable never decreases as `delayWeeks` increases.
- Historical outcome: forecast 500, actual 430 gives -14%.
- Funnel preset (from M4c): 1630 / 890 / 620 / 570 / 490 / 410.

## 9. Engines (`lib/engines/*.ts`, each with Vitest tests)

1. `demand.ts`: sector + investment + project type > comparable ratios (p10/p50/p90) > regional factor > range, occupation components, skills, evidence refs. Always returns a range.
2. `capability.ts`: classify workers per section 7. Keep VERIFIED and INFERRED separate.
3. `gap.ts`: per section 7.
4. `transformation.ts`: for a source and target occupation return existing skills, missing skills, bridge modules, duration, cost, nearest centres (Haversine within `RADIUS_KM`, default 60), employer demand, historical success, confidence. Rank and compare multiple paths.
5. `capacity.ts`: seats per centre and course per cycle, utilization, convertible capacity, capacity bound over the horizon.
6. `optimizer.ts`: group workers into cohorts (district x pathway). MILP in HiGHS. Variables: integer `x[cohort, centre, cycle]` (workers trained) and `u[cohort]` (unactivated). Constraints: all workers of a cohort are trained or unactivated; seats per centre per cycle; trainers; equipment; budget; training must complete within the horizon; centre within radius. Objective: training cost + movement cost + time weight x cycle index + `LAMBDA_GAP` x `u`, with `LAMBDA_GAP` larger than any per-worker cost so the solver activates whenever feasible. Fall back to a greedy allocator if the solver fails or times out. Return assignments, total cost, activation time, remaining gap, utilization.
7. `scenario.ts`: re-run demand, capability, transformation, capacity, optimizer with the levers in section 7. Return required, deployable, transformable, residual, utilization, activation time, cost, unfilled demand, unused capacity, plus deltas against base.
8. `evidence.ts`: every engine result writes Evidence (sources, assumptions, confidence, model version, timestamp).
9. `outcome.ts`: compare forecast with actual, compute error percent, attribute likely drivers (project delay, hiring velocity, migration, training bottleneck, demand assumption). On recalibration create a new ModelVersion (v0.4 to v0.5) by moving the comparable ratio for the affected sector toward actual with damping `new = old * (1 + 0.5 * (actual/forecast - 1))`. Keep the old version. Write an AuditLog row.

## 10. API (Route Handlers, Zod, session + role checked)

- `POST /api/economic-events`; `POST /api/economic-events/[id]/compile-demand`
- `POST /api/workforce/match`
- `POST /api/transformation/generate`
- `POST /api/activation/optimize`
- `POST /api/scenarios/run`
- `POST /api/plans/[id]/approve` (action: approve | modify | reject; reason required for modify and reject)
- `POST /api/outcomes`; `POST /api/outcomes/recalibrate`
- `GET /api/evidence/[entityType]/[id]`; `GET /api/audit`
- GET endpoints for each screen's data; list endpoints paginate.
- Optimizer and scenario routes: `export const runtime = 'nodejs'` and an explicit `maxDuration`.

## 11. Privacy and governance

Role-based access everywhere. Aggregated views by default. Individual worker data only for PLANNER and ADMIN, and only where Consent is granted. Every approval, modification, rejection and model version is written to AuditLog with actor, timestamp, before, after, reason and model version. Seeded data is labelled SYNTHETIC. No secrets in the repo; `.env.example` lists every variable.

## 12. Project structure

```
app/(auth)/login
app/(dashboard)/{control-room,economic-signals,demand,capability,transformation,capacity,plans,scenarios,outcomes,evidence,admin}
app/api/...
components/{ui,layout,charts,maps,evidence}
lib/{db,auth,rbac,llm,engines,services,validators}
prisma/{schema.prisma,seed.ts,archetypes.ts}
public/geo/
design/reference/
tests/{engines,golden}
docs/
```

## 13. Definition of done

- `npm run dev` works from a clean clone after `npm i`, `prisma migrate deploy`, `prisma db seed`.
- The demo story runs end to end: create event > 2,100-2,700 forecast > 620 / 1,010 / 770 split > transformation paths > centre capacity > optimized plan > scenario run > approve > simulate outcomes > forecast error > recalibrate.
- No hardcoded KPI numbers in components. No TypeScript errors. No console errors. All tests pass, including golden tests.
- Lighthouse accessibility >= 90 on the Control Room.
- README covers setup, environment variables, demo credentials, and the 10-step demo script.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
