# Spike Notes

## HiGHS WASM Integration
When running HiGHS via Next.js server actions / route handlers, it uses WASM. By default it might fail to find the `.wasm` file. 
- We set `runtime = 'nodejs'` in the route.
- We used `locateFile` to point to `path.join(process.cwd(), 'node_modules/highs/build', file)` so it can find the WASM binary successfully.

## Prisma 7 + PostgreSQL Integration
We are using Prisma 7 with the `@prisma/adapter-pg` driver.
- Configured `datasourceUrl` and `directUrl` in `prisma/prisma.config.ts`.
- The connection is established via the `pg` driver `Pool` connected through `@prisma/adapter-pg`.

## Vercel / Neon
**UNVERIFIED** (No Neon URLs were provided).
