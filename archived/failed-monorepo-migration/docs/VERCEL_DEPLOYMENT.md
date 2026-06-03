# Vercel Deployment

## Import GitHub Repo
1. Push this repository to GitHub.
2. In Vercel, select **Add New Project**.
3. Import the GitHub repository.

## Framework Preset
- Framework preset: Next.js.
- The active deployable app is `apps/web`.
- `vercel.json` at the repo root points Vercel at the correct build.

## Settings
- Root directory: repository root.
- Install command: `corepack pnpm install --no-frozen-lockfile`.
- Build command: `corepack pnpm db:generate && corepack pnpm --filter @cyberlabin/web build`.
- Output directory: `apps/web/.next`.

## Environment Variables
Add production values from `.env.example`. Required minimum:
- `APP_ENV=production`
- `APP_URL=https://cyberlabin.com`
- `NEXT_PUBLIC_API_BASE_URL=https://cyberlabin.com`
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `CLIADM_ADMIN_TOKEN`
- `DOCUMENT_PAGE_TOKEN_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

## Domain Setup
1. Add `cyberlabin.com` in Vercel project domains.
2. Add `www.cyberlabin.com`.
3. Copy the DNS records Vercel provides into Cloudflare.

## Deployment Verification
After deployment:

```bash
APP_URL=https://cyberlabin.com ./scripts/smoke-test.sh
```

Then test:
- homepage
- course pages
- `/api/health`
- lead validation
- protected route denial

## Common Errors and Fixes
- Prisma Client missing: ensure build command runs `corepack pnpm db:generate`.
- Database connection timeout: check `DATABASE_URL` pooler format and Supabase network status.
- Missing env vars: compare Vercel envs against `.env.example`.
- Workspace package import error: confirm install command runs from repository root.
- RLS denies access unexpectedly: confirm `users.auth_user_id` maps to Supabase `auth.uid()`.

