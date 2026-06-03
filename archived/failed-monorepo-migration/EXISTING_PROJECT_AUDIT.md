# Existing Project Audit

## Package Manager
- Existing frontend uses npm with `package-lock.json`.
- Existing backend uses npm with `package-lock.json`.
- Target platform uses pnpm workspace via Corepack.

## Frontend Framework
- Existing frontend: Vite + React + React Router + Tailwind.
- Existing path: `cyberscout/`.
- Current routes include welcome/login/signup/OAuth callback, dashboard, courses, lessons, quiz, AI tutor, live classes, leaderboard, achievements, account, subscription, and support pages.
- Many UI screens are static/data-file backed rather than database/API backed.

## Backend Framework
- Existing backend: Express.
- Existing path: `cyberscout-server/`.
- Current APIs are limited to auth config, register, login, Google OAuth start/callback, and `me`.

## Database Setup
- Existing backend stores users in memory through `src/store/users.js`.
- No durable database, Prisma schema, migrations, Supabase RLS, payment tables, audit logs, live attendance, or course isolation tables.

## Auth Setup
- Existing auth supports email/password with bcrypt/JWT and Google OAuth with Passport.
- Google OAuth works only when environment credentials and redirect URLs are configured.
- JWT secret is required, but the current auth is not integrated with course entitlements or Supabase Auth.

## Existing Assets Preserved
- `cyberscout/public/brand/cyber-lab-in-full-dark.png`
- `cyberscout/public/brand/cyber-lab-in-full-light.png`
- `cyberscout/public/brand/cyber-lab-in-mark-dark.png`
- `cyberscout/public/brand/cyber-lab-in-mark-light.png`
- `cyberscout/public/favicon.svg`
- `cyberscout/public/icons.svg`
- Existing Cyber Lab IN landing copy and course outlines.

## Existing Bugs / Risks
- In-memory user store resets on server restart.
- Static course/dashboard data can imply fake metrics.
- No database-backed dashboard APIs.
- No course isolation on backend resources.
- No protected PDF rendering flow.
- No live attendance tracking.
- No AI/RAG course-scoped persistence.
- No Razorpay webhook/enrollment automation.
- No audit logging or CLI-only system administration.

## Missing Features Against Target
- Monorepo workspace with apps/services/packages.
- Prisma/PostgreSQL/Supabase schema.
- Supabase RLS starter.
- Student/instructor/admin/sales dashboards backed by APIs.
- Course-scoped live classes, documents, labs, AI, progress, and leaderboards.
- Protected PDF page rendering starter.
- Course-specific AI/RAG service abstraction.
- Lead/CRM system.
- Analytics and audit logging.
- `cliadm` CLI gateway.
- Free-tier deployment and AWS migration documentation.

