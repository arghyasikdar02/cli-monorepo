# Production Deployment Checklist

## GitHub Push Checklist
- Confirm `git status --short` shows only intended source changes.
- Confirm `legacy/pre-migration/` is preserved for audit only and is not referenced by active build scripts.
- Confirm `.env`, `.env.local`, `.next`, `node_modules`, logs, and build artifacts are ignored.
- Confirm `.env.example` is present and contains no real secrets.
- Run `corepack pnpm install`.
- Run `corepack pnpm lint`.
- Run `corepack pnpm typecheck`.
- Run `corepack pnpm test`.
- Run `corepack pnpm prisma validate`.
- Run `corepack pnpm build`.
- Push to GitHub `main` only after the above passes.

## Supabase Setup Checklist
- Create a Supabase project.
- Copy PostgreSQL pooled and direct connection strings.
- Set `DATABASE_URL` and `DIRECT_URL`.
- Run Prisma migrations against staging before production.
- Apply `infra/supabase/rls_policies.sql`.
- Enable email auth provider.
- Configure Auth redirect URLs for `https://cyberlabin.com` and Vercel preview domains.
- Create private storage buckets: `protected-documents`, `lesson-resources`, `assignment-submissions`.
- Enable Realtime for `progress_events`, `leaderboards`, `live_viewer_events`, and `notifications`.

## Vercel Setup Checklist
- Import GitHub repository.
- Use Next.js framework preset.
- Root directory: repository root.
- Install command: `corepack pnpm install --no-frozen-lockfile`.
- Build command: `corepack pnpm db:generate && corepack pnpm --filter @cyberlabin/web build`.
- Output directory: `apps/web/.next`.
- Add all production environment variables.
- Deploy preview first, then production.

## Cloudflare DNS Setup Checklist
- Add `cyberlabin.com` to Cloudflare.
- Update registrar nameservers to Cloudflare.
- Add Vercel DNS records for root and `www`.
- Set SSL/TLS mode to Full.
- Enable Always Use HTTPS.
- Enable basic WAF/security rules.

## Razorpay Webhook Setup Checklist
- Create Razorpay account and complete KYC.
- Generate live API keys.
- Create Payment Links or Orders with `userId`, `courseId`, and optional `batchId` notes.
- Configure webhook endpoint: `https://cyberlabin.com/api/webhooks/razorpay`.
- Subscribe to payment captured/authorized/failed events as needed.
- Set `RAZORPAY_WEBHOOK_SECRET` in Vercel.
- Test webhook in staging before live payment traffic.

## Environment Variables Checklist
- App: `APP_ENV`, `APP_URL`, `NEXT_PUBLIC_API_BASE_URL`.
- Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`.
- Database: `DATABASE_URL`, `DIRECT_URL`.
- Razorpay: `PAYMENT_PROVIDER`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- Auth/session: `CLIADM_API_URL`, `CLIADM_ADMIN_TOKEN`, `DOCUMENT_PAGE_TOKEN_SECRET`.
- Storage: `STORAGE_PROVIDER`, Supabase/R2/S3 credentials as applicable.
- AI/RAG: `AI_PROVIDER`, `AI_API_KEY`, `EMBEDDING_PROVIDER`.
- Feature flags: `FEATURE_RAZORPAY_WEBHOOKS`, `FEATURE_PROTECTED_DOCUMENTS`, `FEATURE_MOCK_AI`, `FEATURE_MANUAL_LABS`.

## Post-Deployment Testing Checklist
- Open homepage.
- Open both course pages.
- Submit invalid lead form and verify validation.
- Submit valid lead form in staging and verify database row.
- Hit `/api/health`.
- Verify protected APIs deny missing auth.
- Verify `cliadm system health` works with production token.
- Verify Razorpay test webhook creates/updates payment and enrollment idempotently.
- Verify Supabase RLS policies are applied.
