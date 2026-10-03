# SANKET: Workforce Command Centre

Web application to convert an economic signal into an evidence-backed workforce plan.

## Setup

1. Copy `.env.example` to `.env` and configure your database (`DATABASE_URL`).
2. Install dependencies: `npm install`
3. Push schema: `npx prisma db push`
4. Run seed data: `npm run db:reset` (Note: ensure you have setup prisma/seed.ts for this to work)
5. Start dev server: `npm run dev`

## Roles & Demo Credentials
- PLANNER
- ADMIN
- EMPLOYER
- TRAINING_AUTHORITY

*(Credentials will be documented here as authentication is integrated)*

## Demo Script
*(The 10-step demo script will be detailed in future milestones as features are completed)*
