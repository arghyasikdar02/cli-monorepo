# Render Backend Deployment

The Render service is stateless. Supabase PostgreSQL is the only production database, and Render must never create a local database file.

## Service settings

| Setting | Value |
| --- | --- |
| Service type | Web service |
| Root directory | `cyberscout-server` |
| Runtime | Node |
| Node version | `24.14.1` |
| Build command | `npm ci` |
| Start command | `npm run db:migrate && npm start` |
| Health check | `/health` |

The start command runs only pending tracked migrations. It does not run `db:seed`, create test users, reset data, or require a Render disk.

## Required variables

Enter secret values in the Render dashboard. Do not store them in `render.yaml` or Git.

```text
NODE_ENV=production
FRONTEND_URL=https://cyberlabin.com
BACKEND_URL=https://cyberlabin.onrender.com
CORS_ORIGINS=https://cyberlabin.com,https://www.cyberlabin.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
BCRYPT_COST=12
DATABASE_SSL=require

DATABASE_URL=<Supabase PostgreSQL connection string>
JWT_SECRET=<random 32+ characters>
VISITOR_HASH_SALT=<random 24+ characters>
LAB_FLAG_SALT=<random 24+ characters>
CLIADM_ADMIN_TOKEN=<random 32+ characters>
```

Generate independent secrets with `openssl rand -hex 32`. `DATABASE_URL` must begin with `postgresql://` or `postgres://` and include the database password. Use the Supabase connection string appropriate for a persistent server; use the direct connection for migrations when network support permits, or a Supabase pooler connection documented as DDL-compatible.

Optional complete groups:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://cyberlabin.onrender.com/api/auth/google/callback

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Configure every value in an optional group together or leave the group unset.

## First deployment

1. Back up the Supabase project and inspect existing tables before applying migrations.
2. Enter all required Render variables, especially `DATABASE_URL`.
3. Deploy from the root `render.yaml` or enter the service settings above.
4. Confirm the logs show each new PostgreSQL migration and `database=postgresql`.
5. Verify `https://cyberlabin.onrender.com/health` returns HTTP 200.
6. Run the catalogue seed once from a protected shell only when baseline rows are missing:

```bash
npm run db:seed
```

Do not set `SEED_DEVELOPMENT_USERS=1` in production. Re-running the seed is safe because baseline inserts use `ON CONFLICT DO NOTHING`, but it is not part of normal restart or deploy behavior.

## Verification

```bash
curl -fsS https://cyberlabin.onrender.com/health
curl -fsS https://cyberlabin.onrender.com/api/courses
```

Use an authenticated smoke test for `/api/auth/me`, dashboards, enrollment and lead persistence. Check Supabase table records to confirm that writes are landing in PostgreSQL.

## Troubleshooting

- `DATABASE_URL is required`: enter the Supabase connection string as a Render secret.
- `must use postgresql://`: a file URL or malformed database URL is configured.
- TLS/certificate failure: use the current Supabase connection string and keep `DATABASE_SSL=require`; supply `DATABASE_SSL_CA` only when Supabase provides a CA chain. Do not disable verification in production.
- CORS rejection: ensure the browser origin exactly matches an HTTPS origin in `CORS_ORIGINS`.
- Existing-schema compatibility failure: no tracked migration was applied. Back up Supabase and complete an explicit data migration; do not alter IDs or delete tables to force deployment.
- Migration failure: note the migration filename in the log, take a backup, and correct the schema conflict. Do not delete `schema_migrations` or reset production tables.
- Connection saturation: lower `DATABASE_POOL_MAX` or use the Supabase pooler URL recommended for long-running application servers.

## Copyable checklist

- [ ] Supabase backup captured.
- [ ] `DATABASE_URL` entered as a Render secret.
- [ ] Four independent application secrets generated and entered.
- [ ] Production HTTPS origins configured.
- [ ] No `DATABASE_PATH`, Render disk, or file URL configured.
- [ ] Start command is `npm run db:migrate && npm start`.
- [ ] `/health` returns HTTP 200.
- [ ] Logs identify `database=postgresql`.
- [ ] Seed run once only if catalogue rows were absent.
- [ ] Login, course reads, enrollment, leads and dashboards verified against Supabase.
