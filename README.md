# SANKET: Workforce Command Centre

SANKET converts an economic signal (a new factory, an investment, a technology shift) into an evidence-backed workforce plan, then tracks real outcomes and recalibrates the underlying intelligence.

Built for the SIH26246 problem statement. 
Architecture: Next.js 16 (App Router), Prisma 7, PostgreSQL (Neon), Tailwind CSS v4, shadcn/ui, HiGHS WASM MILP Optimizer.

---

## 1. Environment Setup

Copy `.env.example` to `.env` (or set these in your hosting provider):

```bash
# Database (PostgreSQL required)
# Local Docker fallback: postgresql://postgres:postgres@localhost:5432/sanket
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?schema=public&pgbouncer=true"
DIRECT_URL="postgresql://[user]:[password]@[host]/[dbname]?schema=public"

# LLM for parsing unstructured economic events (Optional, fallback provided)
LLM_BASE_URL="https://integrate.api.nvidia.com/v1"
LLM_API_KEY="nvapi-..."
LLM_MODEL="nvidia/nemotron-3-super-120b-a12b"
```

## 2. Installation & DB Seed

1. `npm install --legacy-peer-deps` (Vite 5 compatibility requirement)
2. `npx prisma migrate deploy`
3. `npm run db:reset`

**Note:** `npm run db:reset` calls our deterministic, idempotent seed script (`prisma/seed.ts`). It generates exactly 2,000 synthetic workers across Gujarat, maps 126 training centres, and seeds the historical model data. All seeded rows are permanently tagged with `SYNTHETIC` provenance.

## 3. Demo Credentials

Since authentication is mocked in the current prototype phase, `requireRole()` currently falls back to `PLANNER`. In a full deployment, Better Auth roles map to:

- **PLANNER:** Complete access to all screens. Can approve plans and run scenarios.
- **ADMIN:** Complete access, plus Administration (Simulator) screens.
- **EMPLOYER:** Cannot see individual PII in the Capability Map. Can only view aggregated insights.
- **TRAINING_AUTHORITY:** Read-only access to Activation Plans. Cannot approve or run MILP optimizations.

## 4. The 10-Step Demo Script

Follow this script to demonstrate the complete SANKET loop:

1. **Control Room (Overview):** 
   - Start at `/control-room`. Highlight the national and state-level KPI aggregates. Note the choropleth map highlighting state-level capability readiness.
2. **Economic Signals (Input):**
   - Navigate to `/economic-signals`. Show the ability to paste raw news text (e.g. *"New $10B semiconductor plant in Sanand, Gujarat"*).
   - Click **Smart Paste** to demonstrate the Nemotron-3 LLM extracting structured parameters (Investment: 10000 Cr, Sector: Semiconductor).
3. **Event Analysis / Demand (Forecast):**
   - Click "Analyze Event". The system routes to `/demand`.
   - Explain that this is **not** an LLM guess. It uses the `demand.ts` comparable-projects math engine to output a 2,100–2,700 worker range based on historical analogues.
4. **Capability Map (Baseline):**
   - Navigate to `/capability`. The system processes all 2,000 seeded workers through the `capability.ts` classification engine instantly.
   - Show the exact split: 620 Directly Deployable, 1010 Transformable, 370 Unqualified.
   - Click a worker to open the **Profile Drawer**. Note that in Employer mode, this drawer would refuse to render PII.
5. **Transformation Lab (Design):**
   - Navigate to `/transformation`. Show how the `transformation.ts` engine ranks upskilling pathways.
   - Compare the 6-week vs 10-week path for converting an *Industrial Electrician* to an *Automation Technician*. Point out the required Bridge Modules.
6. **Training Capacity (Network constraints):**
   - Navigate to `/capacity`. View the 126 available training centres on the React-Leaflet map.
   - Highlight the current Utilization (85%) and the convertible seats.
7. **Activation Plans (Optimization):**
   - Navigate to `/plans`. Click **Generate Activation Plan**.
   - Explain that the `optimizer.ts` engine is running a HiGHS MILP (Mixed Integer Linear Programming) solver in a WASM sandbox.
   - Note the resulting gap: Exactly 1,010 workers are activated, leaving a 790 residual gap due to network constraints.
8. **Scenario Lab (Stress-test):**
   - Navigate to `/scenarios`. Drop *Training Capacity* by 30%.
   - Click **Run Scenario**. The Delta table highlights exactly how much the residual gap widens and the cost shifts when constraints tighten.
9. **Approvals & Audit (Governance):**
   - Navigate to `/plans/demo/approve`. Click **Modify** or **Reject**. Note that the system strictly rejects human changes without a mandatory justification reason.
   - Click **Approve**. 
   - Go to `/audit` to view the immutable trail (Recommendation Created > Planner Approved). Show the exact model version that produced the result.
10. **Outcomes & Recalibration (Learning loop):**
    - (Optional: Hit the Admin Simulator to push workers through the funnel).
    - Navigate to `/outcomes`. View the Implementation Funnel.
    - Note the historical -14% variance on EV Technicians. 
    - Click **Recalibrate Forecast**. The system mathematically damps the comparable ratios and creates a new Model Version (v0.5), completing the intelligence loop!

## 5. Deployment (Vercel)

- Requires Node.js 20.x runtime.
- Environment variables must include the Neon DB connection strings.
- The `api/activation/optimize` and `api/scenarios/run` routes require `export const runtime = 'nodejs'` and `export const maxDuration = 30` to correctly instantiate the HiGHS WASM solver binaries. (Edge runtime is not supported by `highs`).
