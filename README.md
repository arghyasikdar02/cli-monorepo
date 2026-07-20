# Cyber Lab IN

Cyber Lab IN is a practical cybersecurity education platform built as the restored legacy Vite/React frontend and Express API. The active application has not been replaced by a monorepo.

## Active applications

- `cyberscout/`: public website, authentication, learner UI and role dashboards.
- `cyberscout-server/`: Express API, authorization, PostgreSQL repositories, migrations and CLI administration.
- `supabase/`: Supabase-specific deny-by-default direct-access policy and schema-source guidance.

The archived migration copies remain local and are ignored by Git. Active scripts do not reference them.

## Local setup

Requirements: Node.js 22 LTS and npm 10 or newer. The runtime is pinned through package engines and CI; Render reads the backend package engine.
Create a Supabase project or start a local PostgreSQL 16 database, then set `DATABASE_URL` in `cyberscout-server/.env` before running database commands.

```bash
cp cyberscout-server/.env.example cyberscout-server/.env
cp cyberscout/.env.example cyberscout/.env
npm run install:all
npm run dev
```

The website opens at `http://localhost:5173`; the API opens at `http://localhost:3001`.

Run the applications separately when debugging:

```bash
npm run dev:backend
npm run dev:frontend
```

The root scripts stop an existing process on ports 3001, 5173 or 5174 before starting, which avoids the common `EADDRINUSE` failure.

## Database

Supabase PostgreSQL is the only active database engine. `DATABASE_URL` is required in every environment. Local development may use a disposable PostgreSQL database; file database URLs are rejected.

```bash
npm run db:migrate
npm run db:seed
npm run db:setup
```

Migrations are additive and recorded in `schema_migrations`. Migration `008_persistent_learning_modules.sql` replaces the former in-memory learning store with persistent batches, videos, protected documents, labs, quizzes, assignments, progress, certificates and payment records.
`db:seed` is an explicit, repeatable operation using stable identifiers with `ON CONFLICT DO NOTHING`. Render does not run it during normal startup. Development identities are created only when `SEED_DEVELOPMENT_USERS=1` outside production.

## Authentication

- Login: `/login` or `/auth?mode=login`
- Signup: `/signup` or `/auth?mode=signup`
- Role logins: `/admin/login`, `/instructor/login`, `/marketing/login`, `/ops/login`
- Google callback: `/api/auth/google/callback`

Sessions use a signed JWT in the HTTP-only `cli_session` cookie. The frontend does not store credentials in `localStorage`, `sessionStorage` or URL parameters. State-changing cookie requests use a CSRF token. Password changes rotate the user token version so old sessions stop working.

## Public routes

The homepage loads directly at `/`. Key routes include `/courses`, `/courses/cybersecurity/cyber-security-essentials`, `/labs`, `/learning-paths`, `/for-organisations`, `/resources`, `/blog`, `/about`, `/instructors/arghya-sikdar` and `/contact`.

The production build pre-renders 41 public route shells with unique metadata, canonical URLs, social previews and accurate structured data. `sitemap.xml` and `robots.txt` are included.

## Verification

```bash
npm run lint
npm test
npm run build
npm run verify
npm run smoke
```

The backend integration suite covers signup, cookie sessions, CSRF, roles, dashboards, visitor and lead persistence, Course A/Course B isolation, protected documents, labs, quizzes, certificates, live-class time and batch rules, course-specific tutor boundaries and CLI mutation safety.

## CLI administration

```bash
npm run cliadm -- system health --json
npm run cliadm -- analytics summary --json
npm run cliadm -- audit search --json
```

Mutation commands require the protected `CLIADM_ADMIN_TOKEN` environment value. A matching `--admin-token` remains available for environments where the token is not already injected. Destructive commands also require `--dry-run` or `--confirm YES`. See `npm run cliadm -- --help` and `docs/architecture/API_ROUTES_DOCUMENTATION.md`.

Development seeding creates local test identities only when `SEED_DEVELOPMENT_USERS=1` and `NODE_ENV` is not `production`. Production startup runs tracked migrations but does not seed. Run the baseline seed deliberately only when the catalogue is missing, then bootstrap the first production administrator from a protected Render shell with a strong password and `cliadm`:

```bash
read -s CLIADM_NEW_PASSWORD
export CLIADM_NEW_PASSWORD
npm run cliadm -- user create --email admin@cyberlabin.com --name "Cyber Lab Admin" --password-env CLIADM_NEW_PASSWORD --role admin --json
npm run cliadm -- user create --email marketing@cyberlabin.com --name "Cyber Lab Marketing" --password-env CLIADM_NEW_PASSWORD --role marketing --json
npm run cliadm -- user create --email instructor@cyberlabin.com --name "Cyber Lab Instructor" --password-env CLIADM_NEW_PASSWORD --role instructor --json
unset CLIADM_NEW_PASSWORD
```

`user create` is idempotent when the existing account already has the requested role and never resets an existing password. If an address was previously registered as a student, change it only through an explicitly confirmed, audited role assignment:

```bash
npm run cliadm -- user set-role --email instructor@cyberlabin.com --role instructor --confirm YES --json
```

## Deployment

### Vercel frontend

- Root directory: `cyberscout`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Leave `VITE_API_URL` unset so `/api` uses the first-party Vercel proxy.

### Render backend

- Root directory: `cyberscout-server`
- Build command: `npm ci`
- Start command: `npm run db:migrate && npm start`
- Health endpoint: `/api/health`
- Render readiness endpoint: `/health`

Use the root `render.yaml`, enter every `sync: false` secret in Render and follow `RENDER_DEPLOYMENT.md`. Google OAuth must authorize `https://cyberlabin.com/api/auth/google/callback`.

Render is stateless; all persistent application records are stored in Supabase PostgreSQL. No Render disk is configured or required. See `RENDER_DEPLOYMENT.md` for the required secret connection string and deployment order.

## Documentation

- `IMPLEMENTATION_SUMMARY.md`: delivered changes and decisions.
- `SECURITY_NOTES.md`: session, CSRF, rate-limit and deployment controls.
- `CONTENT_NEEDED.md`: verified human content still required.
- `REMAINING_WORK.md`: work blocked by missing assets, credentials or durable database hosting.
- `docs/architecture/`: APIs, database, roles and course isolation.
- `docs/diagrams/`: Mermaid ERD, DFD and component diagrams.
- `docs/product/`: public-site and SEO implementation history.
- `docs/deployment/`: deployment and local test notes.
