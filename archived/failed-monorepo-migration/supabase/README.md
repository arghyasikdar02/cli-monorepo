# Supabase Production Setup

## 1. Create Project
1. Sign in to Supabase.
2. Create a new project for Cyber Lab IN.
3. Choose the closest region to your learners.
4. Save the project URL and API keys.

## 2. Database Connection
Set these variables in Vercel:

```bash
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public
DIRECT_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-...supabase.com:5432/postgres?schema=public
```

Use `DATABASE_URL` for runtime pooled connections and `DIRECT_URL` for migrations.

## 3. Run Prisma Migrations
Local/staging:

```bash
corepack pnpm db:migrate
```

Production from a trusted machine or CI job:

```bash
DATABASE_URL="..." DIRECT_URL="..." corepack pnpm prisma migrate deploy
```

## 4. Apply RLS Starter Policies
After tables exist, apply:

```bash
psql "$DIRECT_URL" -f infra/supabase/rls_policies.sql
```

You can also paste the SQL into Supabase SQL Editor.

## 5. Configure Supabase Auth
- Enable email auth provider.
- Add redirect URLs:
  - `https://cyberlabin.com`
  - `https://www.cyberlabin.com`
  - Vercel preview URL pattern if needed.
- Keep service role key server-only.
- Map Supabase `auth.uid()` to `users.auth_user_id`.

## 6. Configure Storage Buckets
Create private buckets:
- `protected-documents`
- `lesson-resources`
- `assignment-submissions`

Raw protected PDFs must stay private. Browser-facing document pages must go through the protected document API.

## Required Environment Variables
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `DATABASE_URL`
- `DIRECT_URL`

