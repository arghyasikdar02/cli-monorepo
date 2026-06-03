# Final Deployment Handoff

## Ready
- Monorepo structure is in place at `/Users/a/Desktop/cyberlab-in`.
- Main deployable Next.js app is `apps/web`.
- Vercel config exists at `vercel.json`.
- Prisma schema validates.
- Supabase RLS starter exists at `infra/supabase/rls_policies.sql`.
- Production docs exist for Vercel, Supabase, database, Cloudflare, Razorpay, CLI admin, live classes, AI/RAG, protected documents, and course isolation.
- Smoke test script exists at `scripts/smoke-test.sh`.
- Legacy Vite/Express project is preserved under `legacy/pre-migration` and is not used by active build scripts.

## Manual Configuration Required
- Create GitHub repository and push source.
- Create Supabase project and set database/Auth/storage values.
- Create Vercel project and set environment variables.
- Add Cloudflare DNS records for `cyberlabin.com`.
- Create Razorpay account/keys/webhook.
- Run production Prisma migrations.
- Apply Supabase RLS policies.

## Free Services Required
- GitHub.
- Vercel Hobby.
- Supabase Free.
- Cloudflare Free DNS.
- Razorpay account.

## Deployment Order
1. Push repository to GitHub.
2. Create Supabase project.
3. Configure database URLs and run migrations.
4. Apply RLS policies.
5. Configure Supabase Auth and private buckets.
6. Import GitHub repo into Vercel.
7. Add Vercel environment variables.
8. Deploy Vercel preview.
9. Configure Cloudflare DNS.
10. Configure Razorpay webhook.
11. Run `APP_URL=https://cyberlabin.com ./scripts/smoke-test.sh`.

## Known Limitations
- Supabase session verification is still TODO; MVP protected APIs use development header parsing.
- PDF page rendering is a watermarked image starter, not full PDF rasterization.
- AI/RAG uses mock/course-scoped retrieval.
- Lab runtime is manual guide flow; hosted Docker/Kubernetes labs are future work.
- CLI gateway accepts mutating commands but service-specific mutations need completion.

## Next Production Tasks
Follow `TODO_PRODUCTION.md` in priority order, starting with Supabase Auth session middleware and durable rate limiting.

