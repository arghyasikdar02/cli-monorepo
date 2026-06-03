# TODO Production

These items are explicit because the free-tier MVP uses safe starter implementations for some subsystems.

## Supabase Auth Session Middleware
- Current status: MVP route handlers accept development headers such as `x-user-id` and `x-roles`.
- Missing work: Verify Supabase JWT/session cookies server-side and map `auth.uid()` to internal `users.id`.
- Files affected: `apps/web/app/api/_lib/auth.ts`, `packages/auth-guards/src/index.ts`.
- Exact next step: Add Supabase server client middleware and replace header parsing in protected API routes.

## Durable Rate Limiting
- Current status: In-memory rate limiter protects lead, live, lab, and AI starter routes.
- Missing work: Durable multi-instance rate limiting for Vercel/serverless.
- Files affected: `apps/web/app/api/_lib/rateLimit.ts`.
- Exact next step: Add Supabase/Postgres-backed or Upstash-compatible limiter while keeping free-tier fallback.

## Protected PDF Rasterization
- Current status: Page endpoint returns a watermarked rendered-image starter and never exposes raw PDFs.
- Missing work: Render real PDF pages from private Supabase/R2/S3 storage.
- Files affected: `apps/web/app/api/documents/[id]/manifest/route.ts`, `apps/web/app/api/documents/[id]/pages/[page]/route.ts`.
- Exact next step: Add server-side PDF rasterizer worker and private storage adapter.

## CLI Mutating Commands
- Current status: `cliadm` gateway exists and audits accepted commands. Health, analytics summary, and audit search return data.
- Missing work: Complete service-specific mutations for user/course/enrollment/live/lab/RAG commands.
- Files affected: `apps/web/app/api/cli/commands/route.ts`, `services/cli-admin-service/src/index.js`.
- Exact next step: Implement command dispatchers that call owning service repositories with dry-run previews.

## Prisma Migrations and Seeds
- Current status: Prisma schema validates and models required platform entities.
- Missing work: Checked-in migrations and seed scripts for roles, permissions, demo courses, batches, and local test users.
- Files affected: `prisma/schema.prisma`, `prisma/migrations`, `packages/database`.
- Exact next step: Run `corepack pnpm db:migrate`, create seed script, and verify Supabase staging.

## Course Isolation Test Suite
- Current status: Guards and route checks are implemented in starter form.
- Missing work: Automated integration tests against seeded Course A/Course B fixtures.
- Files affected: `packages/auth-guards`, `apps/web/app/api/**`, `docs/TESTING.md`.
- Exact next step: Add Vitest integration tests for live, docs, labs, AI, leaderboards, and progress denial cases.

## AI/RAG Ingestion Pipeline
- Current status: Mock provider, course-scoped chat history, and course-filtered chunk lookup exist.
- Missing work: Real ingestion from PDFs, lessons, labs, and approved KB docs with embeddings.
- Files affected: `apps/web/app/api/admin/rag/ingest/route.ts`, `apps/web/app/api/ai/sessions/[id]/messages/route.ts`, `services/rag-service`.
- Exact next step: Add background job processor for extraction, chunking, embedding, and citation metadata.

## Docker/Hosted Lab Runtime
- Current status: Manual lab guide launch API and hashed flag validation exist.
- Missing work: Docker dev orchestration and later AWS/Kubernetes isolation.
- Files affected: `apps/web/app/api/labs/[id]/launch/route.ts`, `services/lab-service`, `infra/docker`.
- Exact next step: Add per-lab Docker Compose templates with non-root, non-privileged containers and resource limits.

## Razorpay Production Webhooks
- Current status: Webhook starter verifies signatures when `RAZORPAY_WEBHOOK_SECRET` exists and activates enrollments idempotently.
- Missing work: Replay-window checks, event-type allowlist, and staging webhook test fixtures.
- Files affected: `apps/web/app/api/payments/webhooks/razorpay/route.ts`, `docs/RAZORPAY_AUTOMATION.md`.
- Exact next step: Add webhook event audit tests and reject stale/replayed payloads.

