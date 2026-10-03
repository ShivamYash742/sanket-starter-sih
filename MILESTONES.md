# SANKET milestones

Rules are in AGENTS.md section 2. Each milestone: plan first, wait for approval, build, verify, commit, stop. Execute only the milestone named in the user's prompt.

Screens are numbered 1 to 13: 1 Login, 2 Control Room, 3 Economic Event, 4 Event Analysis, 5 Capability Map, 6 Worker Profile, 7 Transformation Lab, 8 Training Capacity, 9 Activation Plan, 10 Scenario Lab, 11 Approval, 12 Outcomes (monitoring + outcome loop), 13 Evidence & Audit.

---

## M0: Spike (no UI)

Goal: prove the three risky integrations before feature work.

Build:
- Scaffold Next.js 16 (TypeScript, Tailwind v4, App Router) into the current directory. Do not delete AGENTS.md, MILESTONES.md, `.agents/`, `design/` or `public/geo/`.
- Prisma 7 + `@prisma/adapter-pg` against the local Docker Postgres (`docker compose up -d`, then copy `.env.example` to `.env`): `prisma.config.ts`, one throwaway model, migrate with `DIRECT_URL`, query with `DATABASE_URL` from a route handler.
- `highs`: a temporary route `/api/_spike/solve` solving a small integer program, `runtime = 'nodejs'`, wasm located with `locateFile`.
- Deploy a Vercel preview with a Neon database only if the owner has supplied URLs. Otherwise mark the Vercel check UNVERIFIED and continue.

Acceptance:
- All three work locally.
- `docs/spike-notes.md` records the wasm path fix, timeouts and connection settings.
- Spike code deleted after the notes are written.

---

## M1: Foundation

Build:
- Tailwind v4 theme from AGENTS.md section 4; shadcn/ui; Inter font.
- Layout shell: sidebar (role-filtered navigation), top bar (title, role badge, user menu).
- Shared components: KpiCard, DataTable (sticky header, dense), WhyDrawer (shell), SyntheticBadge, Skeleton, EmptyState, ErrorState, ConfirmModal.
- Prisma schema (AGENTS.md section 6), first migration, `.env.example`, `npm run db:reset`.
- Better Auth with role field, `proxy.ts` gating, `requireRole()` helper in `lib/rbac`.
- Screen 1 Login: email, password, role selector; role must match the account.
- Administration page stub (ADMIN only).
- README skeleton.

Acceptance:
- Four seeded demo users can log in; a wrong role is rejected; each role sees only its navigation; direct URL access to a forbidden route returns 403 or redirects.
- `proxy.ts` and handler-level checks both exist (prove with a test that calls a handler without the proxy).
- Typecheck, lint, tests pass.

---

## M2a: Seed and core engines

Build:
- `prisma/seed.ts`, `prisma/archetypes.ts` per AGENTS.md section 8 (everything SYNTHETIC, deterministic, idempotent).
- Engines `demand.ts`, `capability.ts`, `gap.ts`, `evidence.ts`; ModelVersion `Demand` v0.4; `lib/engines/config.ts`; `lib/engines/README.md` with every formula.
- Services and GET endpoints needed by M2b.
- `tests/golden.test.ts` with the golden tests that apply so far (forecast, classification, gap, historical outcome).

Acceptance:
- Fresh database seeds without errors and reruns safely.
- Golden tests pass without any hardcoded golden number in `lib/`.
- Evidence row exists for each engine result.

---

## M2b: Understand screens

Build:
- Screen 2 Control Room. Filters: state, sector, horizon (18 months). Eight KPI cards from NationalAggregate: emerging demand, workforce required, deployable capability, transformable capability, residual gap, training capacity, active plans, forecast confidence. India map with state choropleth (gap) and district markers (demand, capability, gap on hover). Emerging demand table (sector, occupation, geography, growth, timeline, confidence). Active plans table (plan, location, demand, gap, training, status). Alerts panel from Alert rows.
- Screen 3 Economic Event: form (project name, sector, location, investment, project type, expected start, expected operational date, technology, employer or owner, expected hiring, supporting documents) with button "Analyse Workforce Impact". Optional LLM parsing of pasted text to prefill; deterministic fallback when no key.
- Screen 4 Event Analysis: forecast range card (low, base, high, confidence), occupation breakdown bar chart, skills list, "Why this forecast?" drawer with evidence, assumptions, model name and version, timestamp.
- Screen 5 Capability Map: button "Find Existing Workforce"; four counters (total relevant, direct, 1-step, 2-step); district table (direct vs transformable); filters (occupation, skill, district, experience, certification, distance, availability, confidence).
- Screen 6 Worker Profile (side drawer, PLANNER and ADMIN only): worker ID, current occupation, location, experience, verified skills versus estimated skills with ranges and confidence, certifications, training history, transformation options.
- Wire the Why drawer to `GET /api/evidence/...`.

Acceptance:
- Demo event shows 2,100 / 2,400 / 2,700 and 72%; capability counters show 1,630 / 620 / 540 / 470, all read from the database and engines.
- EMPLOYER cannot open Worker Profile; the API refuses it.
- Every page has loading, empty and error states.

---

## M3a: Transformation and capacity

Build:
- Engines `transformation.ts`, `capacity.ts` with tests (Haversine distance, path ranking, per-cycle seats, capacity bound).
- Screen 7 Transformation Lab: pick source and target occupation; show has/missing skills, bridge modules, duration, cost, distance, nearby centres, employer demand, historical success, confidence. Compare two or more paths side by side. Button "Add to Activation Plan".
- Screen 8 Training Capacity: centres table and map; seats per cycle, available seats, trainers, equipment, utilization, convertible capacity; centre detail drawer.

Acceptance:
- Industrial Electrician > Automation Technician shows the 6-week and the 10-week paths with correct confidence labels.
- Capacity bound over the horizon is at least the classified transformable count in the base case.

---

## M3b: Optimizer and Activation Plan

Build:
- Engine `optimizer.ts` per AGENTS.md section 9 (cohort-level MILP, HiGHS, greedy fallback, 8s limit).
- Route `POST /api/activation/optimize` (nodejs runtime, maxDuration set).
- Screen 9 Activation Plan: button "Generate Activation Plan". Summary tiles: demand, directly deployable, transformable (activated), residual. Assignment table: district, workers, pathway, centre, cycle, duration. Totals: workers activated, training cost, activation time, movement cost, remaining gap, capacity utilization.

Acceptance:
- Base case activates 1,010 and leaves residual 770 (computed, not hardcoded).
- No centre exceeds seats in any cycle; solver time under 8s; fallback path covered by a test.
- Golden tests for gap now include post-optimization residual.

---

## M4a: Scenario Lab

Build:
- Engine `scenario.ts` per AGENTS.md section 7.
- Screen 10 Scenario Lab: inputs for demand +/- 20%, project delay 0-12 months, migration, hiring velocity (low, base, high), training capacity +/- 30%, investment scale. Button "Run Scenario". Base versus scenario table with deltas highlighted (required, deployable, transformable, residual, utilization, activation time, cost, unfilled demand, unused capacity).

Acceptance:
- All scenario golden tests pass (demand -10%, capacity -30%, identity, delay monotonic).
- Scenario runs are stored (Scenario, ScenarioResult) and write Evidence.

---

## M4b: Approval, audit, evidence

Build:
- Screen 11 Approval: summary (total workers, in training, expected residual, confidence, estimated cost, activation timeline). Buttons APPROVE, MODIFY, REJECT. MODIFY and REJECT open a modal with a mandatory reason; MODIFY allows editing assignment values. Saving writes AuditLog (actor, timestamp, original recommendation, final decision, modified values, reason, model version) and updates plan status.
- Screen 13 Evidence & Audit: filterable audit trail (recommendation created > planner modified > planner approved) with timestamps, model versions and a before/after diff; expandable "Why?" panels listing historical projects, job postings, employer signals, investment data, existing workforce, training capacity; assumptions and confidence.

Acceptance:
- MODIFY or REJECT without a reason is rejected by the API (test).
- Only PLANNER can approve; TRAINING_AUTHORITY gets read-only.
- Audit rows are immutable through the UI (no edit or delete).

---

## M4c: Outcomes, recalibration, simulator

Build:
- Engine `outcome.ts`.
- Screen 12 Outcomes: implementation funnel (identified, enrolled, completed, certified, applications, placed) with expected versus actual; forecast versus actual card (forecast, actual, error percent); likely drivers; button "Recalibrate Forecast" creating a new ModelVersion and an AuditLog row.
- Administration > Outcome Simulator (ADMIN only): advances seeded workers through ENROLLED > COMPLETED > CERTIFIED > APPLIED > PLACED, writing Outcome and Application rows. Include a preset "Blueprint funnel" that produces exactly 1630 / 890 / 620 / 570 / 490 / 410 with a deterministic worker selection.

Acceptance:
- Funnel preset test passes; historical EV Technician record shows 500 vs 430 and -14%.
- Recalibration creates Demand v0.5, keeps v0.4, and the next forecast for the same sector uses v0.5.

---

## M5: Polish and delivery

Build:
- Empty, loading and error states audited on every page.
- Accessibility pass using the web-design-guidelines skill if installed; fix findings; Lighthouse accessibility >= 90 on the Control Room.
- README: setup, environment variables, demo credentials, the 10-step demo script (event > forecast > capability split > transformation > capacity > optimized plan > scenario > approval > outcome simulation > recalibration).
- Playwright smoke test of the demo flow (optional if time is short).
- Vercel deployment notes: environment variables, function timeouts for optimizer routes.

Acceptance:
- Clean clone to running demo using only the README.
- sanket-verify passes. No hardcoded KPI numbers anywhere in `components/` or `app/`.
