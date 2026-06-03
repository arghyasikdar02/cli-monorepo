# Free Deployment

## Target
- Vercel Hobby for `apps/web`.
- Supabase Free for Auth, PostgreSQL, Realtime, and private Storage.
- Cloudflare DNS.
- GitHub Actions free tier.
- Razorpay Payment Links and signed webhooks.
- External video embeds for MVP live classes.

## Vercel
1. Import this repository.
2. Set project root to `/`.
3. Build command: `corepack pnpm install && corepack pnpm prisma generate && corepack pnpm --filter @cyberlabin/web build`.
4. Output is managed by Next.js.
5. Set environment variables from `.env.example`.

## Supabase
1. Create project.
2. Apply Prisma migrations.
3. Apply `infra/supabase/rls_policies.sql`.
4. Create private buckets: `protected-documents`, `lesson-resources`, `assignment-submissions`.
5. Enable Realtime for `progress_events`, `leaderboards`, `live_viewer_events`, and `notifications`.

## MVP Limits
- No paid Redis is required. Local in-memory rate limiting is a starter and should be upgraded before beta.
- No AWS, Kubernetes, paid streaming, or paid email is required for MVP.

