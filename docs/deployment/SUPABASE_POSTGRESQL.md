# Supabase PostgreSQL

Supabase PostgreSQL is the only production data store for Cyber Lab IN. The Express backend connects through one shared `pg` pool using `DATABASE_URL`; the browser never receives database credentials or a Supabase service-role key.

## Setup

1. Create or select the Supabase project.
2. Back up any existing data and inspect existing table names and column types.
3. Copy a PostgreSQL connection string from Supabase and enter it in `cyberscout-server/.env` locally or as a Render secret.
4. Run `npm run db:migrate --prefix cyberscout-server`.
5. Apply `supabase/rls-policies.sql` in the Supabase SQL editor to deny direct anon/authenticated table access.
6. Run `npm run db:seed --prefix cyberscout-server` from a protected shell only when baseline catalogue records are missing. Repeated runs safely skip existing records.

The seed uses `ON CONFLICT DO NOTHING`; it does not update existing course, blog, lesson, material or user rows. Predictable development users require the explicit `SEED_DEVELOPMENT_USERS=1` flag and are blocked when `NODE_ENV=production`.

## Migration guarantees

- Applied filenames are stored in `schema_migrations`.
- A PostgreSQL advisory lock prevents concurrent migration runs.
- Each migration runs in its own transaction.
- Failed migrations roll back and stop deployment.
- No migration drops application tables or truncates data.
- A preflight checks existing `users.id` and `courses.id` types before creating migration history. An incompatible pre-existing schema is rejected without applying changes.

Never delete migration-history rows to force a rerun. If the compatibility preflight fails, preserve the existing project, take a backup, and write an explicit data migration instead of coercing the tracked schema over it.

## Connection guidance

- Keep `DATABASE_SSL=require` in Render.
- The shared PostgreSQL configuration removes URL-level `sslmode`, `sslcert`, `sslkey`, and `sslrootcert` options before creating the pool so they cannot override the application TLS policy.
- Without a supplied CA, production uses `rejectUnauthorized: false` only on the PostgreSQL connection for compatibility with the provider-managed certificate chain. It never changes global Node TLS verification.
- Set `DATABASE_SSL_CA` to the provider PEM chain when strict CA verification is required; the shared pool then uses `rejectUnauthorized: true`.
- Use the Supabase direct connection for migrations when available.
- A Supabase pooler URL may be used when required by Render networking, provided it supports the migration DDL used here.
- Tune `DATABASE_POOL_MAX` to remain below the project connection limit.
- Use `DATABASE_SSL=disable` only with a disposable local PostgreSQL server.

## Verification

After deployment, verify `/health`, public courses, login, enrollment, lead creation and a role dashboard. Then inspect the corresponding Supabase rows to prove both reads and writes use the managed database.
