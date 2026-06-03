# Deployment Guide

## Free MVP target
- Vercel Hobby for Next.js apps/API routes.
- Supabase Free for Auth, PostgreSQL, Realtime, and private Storage.
- Cloudflare DNS.
- GitHub Actions free tier.
- Razorpay Payment Links/manual verification.
- External video embed providers.

## Vercel
1. Import the GitHub repo.
2. Use `cyberlab-in` as the root for the main web/API project.
3. Add environment variables from `.env.example`.
4. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `CLIADM_ADMIN_TOKEN`, payment secrets, or document token secrets as public env vars.
5. Deploy previews from PRs and production from protected `main`/tag workflow.

## Supabase
1. Create a Supabase project.
2. Run Prisma migrations.
3. Apply `infra/supabase/rls_policies.sql`.
4. Create private buckets: `protected-documents`, `lesson-resources`, `assignment-submissions`.
5. Enable Realtime for progress, leaderboards, live viewer events, and notifications.

## AWS-ready migration
Move one service at a time after it has its own health endpoint, tests, env vars, owned tables, audit events, and documented dependencies. Target RDS, S3, ECS/Lambda, EventBridge/SQS, WAF, CloudWatch, and Secrets Manager.
