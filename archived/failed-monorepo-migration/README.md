# Cyber Lab IN Platform

Microservices-ready Cyber Lab IN / CLI platform redeveloped inside `/Users/a/Desktop/cyberlab-in`. The previous Vite/Express implementation is preserved under `legacy/pre-migration`, and the deployable app now runs from this repository root.

## What is included
- Next.js public web app and four dashboard apps.
- Prisma/PostgreSQL schema for course-isolated LMS, live, protected documents, labs, RAG, CRM, analytics, audit, and CLI admin.
- API routes in `apps/web/app/api` implementing MVP service contracts.
- Shared packages for database, UI, config, logging, API client, auth guards, and types.
- `cliadm` CLI gateway for ZSH-based administration.
- Supabase RLS starter policies, Docker Compose, GitHub Actions, deployment docs, and production TODOs.

## Local setup
```bash
cd /Users/a/Desktop/cyberlab-in
cp .env.example .env.local
docker compose up -d
corepack pnpm install
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm dev
```

Default app URLs:
- Web/API: http://localhost:3000
- Student dashboard: http://localhost:3001
- Instructor dashboard: http://localhost:3002
- Admin dashboard: http://localhost:3003
- Marketing dashboard: http://localhost:3004

Dashboard apps call `NEXT_PUBLIC_API_BASE_URL`, defaulting to http://localhost:3000. For local header-auth testing, set `DEV_USER_ID` and `DEV_ROLES`.

## Verification
```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm prisma validate
corepack pnpm build
./services/cli-admin-service/bin/cliadm system health --json
```

## CLI Admin Quick Start
Set the API URL and admin token first:

```bash
export CLIADM_API_URL=http://localhost:3000
export CLIADM_ADMIN_TOKEN=change-me-local-only
```

Then run:

```bash
corepack pnpm cliadm system health --json
corepack pnpm cliadm analytics summary --json
corepack pnpm cliadm audit search --json
```

## Migration Notes
- Backup branch: `migration-backup-before-platform-merge-20260601`.
- Existing project audit: `EXISTING_PROJECT_AUDIT.md`.
- Merge plan: `MERGE_PLAN.md`.
- Production gaps: `TODO_PRODUCTION.md`.

## Security model
- Browser-facing protected data is served through API routes, not raw storage URLs.
- Course-sensitive APIs check enrollment or staff roles and always filter by course_id.
- Dashboards use database/API-backed metrics and show empty states when no data exists.
- Main system administration flows through `cliadm` and `/api/cli/commands`.

Read `IMPLEMENTATION_NOTES.md` and `TODO_PRODUCTION.md` before launch.
