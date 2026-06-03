# Local Development Guide

1. Install Node.js LTS, pnpm, and Docker Desktop.
2. Copy `.env.example` to `.env.local`.
3. Start local dependencies with `docker compose up -d`.
4. Run `corepack pnpm install`, `corepack pnpm prisma generate`, and `corepack pnpm prisma migrate dev`.
5. Run `corepack pnpm dev` for the web/API app.
6. Run dashboard apps with `corepack pnpm dev:student`, `corepack pnpm --filter @cyberlabin/instructor-dashboard dev`, `corepack pnpm --filter @cyberlabin/admin-dashboard dev`, or `corepack pnpm --filter @cyberlabin/marketing-dashboard dev`.

For local route testing, pass headers:
- `x-user-id`: internal user UUID.
- `x-roles`: comma-separated roles such as `student`, `admin`, or `cli_admin`.

Production must replace header-auth with verified Supabase session middleware.
