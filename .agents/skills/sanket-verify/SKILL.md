---
name: sanket-verify
description: Run at the end of every milestone and after any change to engines, seed data, schema or API routes. Verifies golden numbers, RBAC coverage, audit logging and absence of hardcoded KPIs.
---

# sanket-verify

Run these checks in order and report PASS or FAIL for each. Do not modify tests, archetype counts or seed numbers to make a check pass. If a check fails, fix the engine, archetypes or handler.

1. Quality gate: run `npm run typecheck && npm run lint && npm test`.
2. Golden numbers: seed a scratch database (use `DATABASE_URL_SCRATCH` if set, otherwise ask). Print counts: workers 2000; relevant 1630; DIRECT 620; ONE_STEP 540; TWO_STEP 470. Confirm `tests/golden.test.ts` covers every golden test listed in AGENTS.md section 8 that applies to the current milestone.
3. RBAC coverage: list every file under `app/api` that does not call `requireRole(`. Each must be justified (for example the auth route) or fixed.
4. Audit coverage: list every state-changing route handler (POST, PUT, PATCH, DELETE). Confirm each writes an AuditLog row. Confirm AI-derived results also write an Evidence row.
5. Hardcoded values: search `components/`, `app/` and `lib/` (excluding `prisma/`, `tests/`, `lib/engines/config.ts`) for the literals 2400, 2100, 2700, 1630, 620, 540, 470, 1010, 770, 72. Report every hit that is not a comment or an unrelated number.
6. Provenance: confirm every seeded table row carries `dataSource = SYNTHETIC` where the column exists, and that the UI shows the SYNTHETIC badge on provenance displays.
7. Report a table: check, PASS or FAIL, evidence (file paths or counts). Stop after the report.
