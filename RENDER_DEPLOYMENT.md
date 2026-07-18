# Render Backend Deployment

The Render service is stateless. Supabase PostgreSQL is the only production database, and Render must never create a local database file.

## Service settings

| Setting | Value |
| --- | --- |
| Service type | Web service |
| Root directory | `cyberscout-server` |
| Runtime | Node |
| Node version | `22.x` (pinned in `cyberscout-server/package.json`) |
| Build command | `npm ci` |
| Start command | `npm run db:migrate && npm start` |
| Health check | `/health` |

The start command runs only pending tracked migrations before Express starts. It does not seed, overwrite records, reset data, or create test identities.

## Required variables

Enter secret values in the Render dashboard. Do not store them in `render.yaml` or Git.

```text
NODE_ENV=production
FRONTEND_URL=https://cyberlabin.com
BACKEND_URL=https://cli-hq1i.onrender.com
CORS_ORIGINS=https://cyberlabin.com,https://www.cyberlabin.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
BCRYPT_COST=12
DATABASE_SSL=require

DATABASE_URL=<Supabase PostgreSQL connection string>
JWT_SECRET=<random 32+ characters>
VISITOR_HASH_SALT=<random 24+ characters>
LAB_FLAG_SALT=<random 24+ characters>
CLIADM_ADMIN_TOKEN=<random 32+ characters>
```

Generate independent secrets with `openssl rand -hex 32`. `DATABASE_URL` must begin with `postgresql://` or `postgres://` and include the database password. Use the Supabase connection string appropriate for a persistent server; use the direct connection for migrations when network support permits, or a Supabase pooler connection documented as DDL-compatible.

`DATABASE_SSL=require` enables TLS for the PostgreSQL connection and uses connection-scoped compatibility for the provider-managed certificate chain. URL parameters such as `sslmode`, `sslcert`, `sslkey`, and `sslrootcert` are removed before `pg` creates the connection so they cannot override the shared policy. To require CA verification instead, configure `DATABASE_SSL_CA` with the provider's PEM CA chain. The application never disables TLS verification globally.

Optional complete groups:

```text
GOOGLE_CLOUD_PROJECT_ID=cyber-lab-in
GOOGLE_CLOUD_PROJECT_NUMBER=854487433792
GOOGLE_CLIENT_ID=854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://cli-hq1i.onrender.com/api/auth/google/callback
GOOGLE_TOKEN_ENCRYPTION_KEY=<random 32+ characters>

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Configure every value in an optional group together or leave the group unset.

## Browser session routing

Production browser requests should use the configured Render API origin while Google Cloud is returning OAuth callbacks to Render. Set the Vercel frontend variable `VITE_API_URL=https://cli-hq1i.onrender.com`.

This current architecture uses host-only, HTTP-only, `Secure`, `SameSite=None` cookies without a `Domain` attribute because `cyberlabin.com` and `onrender.com` are different registrable domains. Login and every other browser state-changing request first obtain a double-submit token from `/api/auth/csrf`.

Google OAuth currently returns through `https://cli-hq1i.onrender.com/api/auth/google/callback`, matching the configured Google Cloud redirect URI. Keep `BACKEND_URL` and `GOOGLE_REDIRECT_URI` configurable for a future `api.cyberlabin.com` migration.

`api.cyberlabin.com` remains the recommended final custom Render domain. After Render verifies that domain and Google Cloud has the new callback URI, point `VITE_API_URL` to `https://api.cyberlabin.com`, update `BACKEND_URL` and `GOOGLE_REDIRECT_URI`, retain `FRONTEND_URL=https://cyberlabin.com`, and keep both origins in the explicit CORS configuration. Both hosts are then same-site, so `SameSite=Lax` becomes appropriate again.

## First deployment

1. Back up the Supabase project and inspect existing tables before applying migrations.
2. Enter all required Render variables, especially `DATABASE_URL`.
3. Deploy from the root `render.yaml` or enter the service settings above.
4. Confirm the logs show each new PostgreSQL migration and `database=postgresql`.
5. Verify `https://cli-hq1i.onrender.com/health` returns HTTP 200.
6. If the public catalogue is absent, run `npm run db:seed` once from a protected Render shell. Re-running it is safe because inserts use stable identifiers and `ON CONFLICT DO NOTHING`.

Do not set `SEED_DEVELOPMENT_USERS=1` in production.

## Verification

```bash
curl -fsS https://cli-hq1i.onrender.com/health
curl -fsS https://cli-hq1i.onrender.com/api/courses
```

Use an authenticated smoke test for `/api/auth/me`, dashboards, enrollment and lead persistence. Check Supabase table records to confirm that writes are landing in PostgreSQL.

## Troubleshooting

- `DATABASE_URL is required`: enter the Supabase connection string as a Render secret.
- `must use postgresql://`: a file URL or malformed database URL is configured.
- TLS/certificate failure: keep `DATABASE_SSL=require` and confirm Render deployed the shared `src/db/config.js` configuration. Remove stale Render overrides such as `NODE_TLS_REJECT_UNAUTHORIZED`; they are neither needed nor permitted. Supply `DATABASE_SSL_CA` only when the database provider supplies a CA chain that should be verified.
- CORS rejection: ensure the browser origin exactly matches an HTTPS origin in `CORS_ORIGINS`.
- Secure-session failure: verify `/api/auth/csrf` through `cyberlabin.com` returns `200`, JSON containing `csrfToken`, and a `cli_csrf` cookie. Remove a direct Render `VITE_API_URL` from Vercel and redeploy the frontend.
- Existing-schema compatibility failure: no tracked migration was applied. Back up Supabase and complete an explicit data migration; do not alter IDs or delete tables to force deployment.
- Migration failure: note the migration filename in the log, take a backup, and correct the schema conflict. Do not delete `schema_migrations` or reset production tables.
- Connection saturation: lower `DATABASE_POOL_MAX` or use the Supabase pooler URL recommended for long-running application servers.

## Copyable checklist

- [ ] Supabase backup captured.
- [ ] `DATABASE_URL` entered as a Render secret.
- [ ] Four independent application secrets generated and entered.
- [ ] Production HTTPS origins configured.
- [ ] Vercel `VITE_API_URL` is unset so the first-party `/api` proxy is used.
- [ ] Google OAuth redirect URI is `https://cyberlabin.com/api/auth/google/callback` when OAuth is enabled.
- [ ] No `DATABASE_PATH`, Render disk, or file URL configured.
- [ ] Node is selected from the `22.x` package engine.
- [ ] Start command is `npm run db:migrate && npm start`.
- [ ] `/health` returns HTTP 200.
- [ ] Logs identify `database=postgresql`.
- [ ] Seed run once only if catalogue rows were absent.
- [ ] Login, course reads, enrollment, leads and dashboards verified against Supabase.
