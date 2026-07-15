# Cyber Lab IN

Cyber Lab IN is a practical cybersecurity education platform built as the restored legacy Vite/React frontend and Express API. The active application has not been replaced by a monorepo.

## Active applications

- `cyberscout/`: public website, authentication, learner UI and role dashboards.
- `cyberscout-server/`: Express API, authorization, SQLite repositories, migrations and CLI administration.
- `supabase/`: reviewed Postgres/RLS migration starter only; it is not the active database adapter.

The archived migration copies remain local and are ignored by Git. Active scripts do not reference them.

## Local setup

Requirements: Node.js 22.13 or newer and npm 10 or newer.

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

Local SQLite data is stored in `cyberscout-server/data/cyberlab.sqlite` and ignored by Git.

```bash
npm run db:migrate
npm run db:seed
npm run db:setup
```

Migrations are additive and recorded in `schema_migrations`. Migration `008_persistent_learning_modules.sql` replaces the former in-memory learning store with persistent batches, videos, protected documents, labs, quizzes, assignments, progress, certificates and payment records.

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

Mutation commands require `--admin-token`; destructive commands also require `--dry-run` or `--confirm YES`. See `npm run cliadm -- --help` and `docs/architecture/API_ROUTES_DOCUMENTATION.md`.

Development seeding creates local test identities only when `NODE_ENV` is not `production`. Production startup seeds public catalogue content but never creates predictable role accounts. Bootstrap the first production administrator from a protected Render shell with a strong password and `cliadm`, then rotate the shell variables:

```bash
read -s CLIADM_NEW_PASSWORD
read -s CLIADM_TOKEN
npm run cliadm -- user create --email admin@your-domain.example --name "Platform Administrator" --password "$CLIADM_NEW_PASSWORD" --role super_admin --admin-token "$CLIADM_TOKEN" --json
unset CLIADM_NEW_PASSWORD CLIADM_TOKEN
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
- Start command: `npm start`
- Health endpoint: `/api/health`

Use `render.yaml` as a safe starter and configure every secret from `.env.example`. Google OAuth must authorize `https://cyberlabin.com/api/auth/google/callback`.

SQLite on Render free is ephemeral. It is acceptable for deployment testing, not durable production. Complete the repository migration to Supabase Postgres before accepting paid enrolments or relying on production records. See `docs/deployment/README.md` and `REMAINING_WORK.md`.

## Documentation

- `IMPLEMENTATION_SUMMARY.md`: delivered changes and decisions.
- `SECURITY_NOTES.md`: session, CSRF, rate-limit and deployment controls.
- `CONTENT_NEEDED.md`: verified human content still required.
- `REMAINING_WORK.md`: work blocked by missing assets, credentials or durable database hosting.
- `docs/architecture/`: APIs, database, roles and course isolation.
- `docs/diagrams/`: Mermaid ERD, DFD and component diagrams.
- `docs/product/`: public-site and SEO implementation history.
- `docs/deployment/`: deployment and local test notes.
