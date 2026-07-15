# Render Backend Deployment

The active backend is the Express application in `cyberscout-server/`. The root `render.yaml` is the source of truth for Render Blueprint deployment.

## Service Configuration

| Setting | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Node |
| Root directory | `cyberscout-server` |
| Node version | `24.14.1` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health-check path | `/health` |
| Disk mount path | `/var/data` |
| Production database | `/var/data/cyberlab.sqlite` |

`npm start` validates the complete production environment before opening SQLite, then runs pending idempotent migrations and safe public catalogue preparation before Express starts. Do not use `npm run db:setup && npm start` in Render: it repeats the standalone seed command before the guarded startup path and provides no persistence benefit.

## Required Environment

The Blueprint supplies the non-secret URL, cookie, Node and database values. Enter these four secret values manually in Render:

- `JWT_SECRET`: at least 32 random characters.
- `VISITOR_HASH_SALT`: at least 24 random characters.
- `LAB_FLAG_SALT`: at least 24 random characters.
- `CLIADM_ADMIN_TOKEN`: at least 32 random characters.

Generate a different value for each variable:

```bash
openssl rand -hex 32
```

The configured production origins are:

```text
FRONTEND_URL=https://cyberlabin.com
BACKEND_URL=https://cyberlabin.onrender.com
CORS_ORIGINS=https://cyberlabin.com,https://www.cyberlabin.com
```

All origin values must use HTTPS. A trailing slash is accepted and normalized, but paths, query strings and localhost origins are rejected in production.

## Optional Integrations

Google OAuth requires all of:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://cyberlabin.com/api/auth/google/callback
```

Razorpay requires all of:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Leave an optional group entirely unset until it is ready. Never paste a secret into `render.yaml`, Git, build logs or support messages.

## Persistent SQLite

The Blueprint mounts a 1 GB disk at `/var/data` and sets `DATABASE_PATH=/var/data/cyberlab.sqlite`. Render persistent disks require a paid instance; the Blueprint therefore uses the Starter plan. The free plan cannot provide durable SQLite storage.

Migrations are recorded in `schema_migrations` and do not reapply. Startup does not delete the database, overwrite user records or create development test identities in production. Public catalogue records use idempotent upserts.

Create an on-disk backup from a protected Render Shell, then copy it to independent storage:

```bash
node src/cli/cliadm.js backups create --admin-token "$CLIADM_TOKEN" --confirm YES --json
```

A backup stored only on the same disk is not an off-site backup. Schedule exports and test restoration before accepting paid enrolments. A managed Postgres migration remains the preferred long-term production design.

## Deployment Checklist

- [ ] Connect the GitHub repository as a Render Blueprint.
- [ ] Confirm `render.yaml` selects `cyberscout-server` as the root directory.
- [ ] Confirm the service plan supports a persistent disk.
- [ ] Confirm `/var/data` is mounted and `DATABASE_PATH` is `/var/data/cyberlab.sqlite`.
- [ ] Enter unique values for all four required secrets.
- [ ] Confirm `FRONTEND_URL`, `BACKEND_URL` and every CORS origin use HTTPS.
- [ ] Confirm the start command is `npm start`.
- [ ] Deploy and wait for the `/health` check to pass.
- [ ] Verify the response without authentication: `curl -fsS https://cyberlabin.onrender.com/health`.
- [ ] From Render Shell, run `node src/cli/cliadm.js system health --json` and confirm the database path starts with `/var/data/`.
- [ ] Restart the service and confirm user and lead records remain present.
- [ ] Test login through `https://cyberlabin.com`, not only the direct Render hostname.

## Diagnosing CORS And Cookies

The Vercel frontend normally calls same-origin `/api`, which proxies to Render. This permits secure HTTP-only cookies with `SameSite=Lax`. Leave `VITE_API_URL` unset in Vercel.

For an additional frontend hostname, add its exact HTTPS origin to `CORS_ORIGINS`. Do not add a path and do not use `*`. If the browser calls Render directly from another site, explicitly review whether `COOKIE_SAME_SITE=none` is required; `Secure` remains mandatory.

The service logs one safe CORS message and request ID. It never logs configured secret values.

## Redeploy And Verify

1. Push the commit to the branch tracked by Render.
2. In Render, choose **Manual Deploy > Deploy latest commit** when automatic deployment is disabled.
3. Confirm migrations finish and the log reports `Public catalogue ready` or `Public catalogue already ready`.
4. Confirm the log reports `cyberscout-server ready on 0.0.0.0:<port>`.
5. Verify `/health`, public courses, login and one authenticated dashboard request.

This document does not claim the live service was deployed. Live success must be confirmed from Render and the public health URL after configuration.
