# SANKET starter pack

1. Create the repo folder and copy everything from this zip into it (keep the dot-folder `.agents`).
2. `git init`, then `docker compose up -d` (local Postgres).
3. `cp .env.example .env`, generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`, paste your NVIDIA key into `LLM_API_KEY`.
4. Start the CLI: `agy`. Press Shift+Tab until plan mode, then paste:

   Read AGENTS.md and MILESTONES.md. Execute M0 only. Produce a plan first. Write no code until I approve.

5. After each milestone passes (the agent prints a checklist and stops), start the next: M1, M2a, M2b, M3a, M3b, M4a, M4b, M4c, M5.

Notes
- Do not paste the NVIDIA key into chat or commit it.
- Screenshots are optional. Drop PNGs into `design/reference/` any time before M1.
- If the CLI does not list the skill, run `/skills`. Workspace skills load from `.agents/skills/`.
