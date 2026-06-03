# Merge Plan

## Goal
Redevelop `/Users/a/Desktop/cyberlab-in` into the production-ready Cyber Lab IN platform using `/Users/a/Desktop/Dev/cyberlabin-platform` as the implementation reference.

## Merge Approach
1. Preserve a backup branch before major edits.
2. Keep existing `cyberscout/` and `cyberscout-server/` folders for audit/history, but make the repository root the deployable monorepo.
3. Copy/adapt the scaffold architecture into the root:
   - `apps/`
   - `services/`
   - `packages/`
   - `infra/`
   - `docs/`
   - `prisma/`
   - `.github/`
4. Preserve useful existing assets by moving brand images into the new web app public folder.
5. Replace static and incomplete behavior with Prisma-backed API routes from the scaffold.
6. Add missing docs requested by the migration prompt.
7. Run install, lint, typecheck, test, Prisma validate, and build from `/Users/a/Desktop/cyberlab-in`.

## Preservation Rules
- Do not delete old folders blindly.
- Do not expose secrets from old `.env` files.
- Preserve brand/logo assets and Cyber Lab IN copy.
- Preserve old code only as reference/history; the working app will run from the new root monorepo.

## Target Runtime
- Main public web/API app: `apps/web` on port `3000`.
- Student dashboard: `apps/student-dashboard` on port `3001`.
- Instructor dashboard: `apps/instructor-dashboard` on port `3002`.
- Admin dashboard: `apps/admin-dashboard` on port `3003`.
- Marketing dashboard: `apps/marketing-dashboard` on port `3004`.

## Production Readiness Checks
- `corepack pnpm install`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm prisma validate`
- `corepack pnpm build`

