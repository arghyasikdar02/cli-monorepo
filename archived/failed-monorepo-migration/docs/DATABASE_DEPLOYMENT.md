# Database Deployment

## Local Migration
```bash
cp .env.example .env.local
docker compose up -d
corepack pnpm db:generate
corepack pnpm db:migrate
```

## Production Migration
Run only from CI or a trusted admin machine:

```bash
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:6543/postgres?pgbouncer=true&connection_limit=1&schema=public" \
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@DB_HOST:5432/postgres?schema=public" \
corepack pnpm prisma migrate deploy
```

## Supabase URL Format
- Runtime pooled URL: use the Supabase pooler host on port `6543` with `pgbouncer=true`.
- Direct URL: use the direct database host on port `5432`.
- Keep both as Vercel server-side environment variables.

## Migration Safety Notes
- Do not run destructive migrations without backup.
- Apply staging migrations first.
- Prefer additive schema changes.
- Keep migrations checked into Git.
- Run `corepack pnpm prisma validate` before deployment.
- Apply RLS policies after schema creation.

## Seed Data Instructions
Seed scripts are not production-complete yet. Before beta, add seed scripts for:
- roles
- permissions
- initial CLI admin
- initial courses
- batches
- test enrollments

Use seed data only for local/staging unless explicitly reviewed.

## Rollback Warning
Database rollback is not the same as app rollback. Prefer forward fixes for schema issues. Restore from Supabase backup only after confirming impact.

