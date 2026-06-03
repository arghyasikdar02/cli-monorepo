# Supabase Setup

1. Create a project and copy URL/anon/service-role values to environment variables.
2. Run `corepack pnpm prisma migrate dev` locally or apply generated migrations in staging.
3. Apply `infra/supabase/rls_policies.sql`.
4. Create private buckets for protected documents and submissions.
5. Confirm service role key is available only to server functions.
6. Enable Auth email provider and configure allowed redirect URLs for deployed domains.
7. Enable Realtime for `progress_events`, `leaderboards`, `live_viewer_events`, and `notifications`.
