# Implementation Notes

## Source of Truth
- All requirements were taken from `/Users/a/Desktop/cyberlab-in` and summarized in `/Users/a/Desktop/cyberlab-in/EXTRACTED_REQUIREMENTS.md`.
- The existing scaffold in `cyberlab-in` was preserved and expanded rather than replaced.

## Conflicts and Safest Choices
- The docs require microservices-ready architecture, but free-tier MVP deployment may co-locate APIs. Safest choice: keep service folders and shared packages, while implementing working MVP APIs as Next.js route handlers in `apps/web/app/api` for Vercel Hobby deployment.
- The docs require database-backed dashboards and also free local bootstrapping. Safest choice: dashboards call APIs backed by Prisma queries and show empty states when the database has no rows; no fake counts are embedded.
- The docs require protected PDF page rendering. Full PDF rasterization needs a renderer/storage pipeline. Safest MVP choice: implement access-checked page-token flow and rendered SVG page response with watermark as a starter, while documenting production PDF rasterization in `TODO_PRODUCTION.md`. Raw PDF exposure remains avoided.
- The docs require course-specific AI/RAG but allow mock/free providers. Safest MVP choice: implement course_id-scoped chat sessions/messages and chunk retrieval with a mock answer provider.
- The docs require Docker-ready labs but no paid hosted labs. Safest MVP choice: manual lab launch API plus Docker-ready documentation; hosted orchestration remains TODO until isolation is hardened.

## Implemented
- Monorepo workspace with required app, service, package, infra, and docs folders.
- Five Next.js app surfaces: public web, student dashboard, instructor dashboard, admin dashboard, marketing dashboard.
- Shared packages for UI, config, logging, database, API client, types, and auth guards.
- Prisma schema covering required platform entities.
- API routes for dashboards, leads, courses, me/courses, live join/leave, protected documents, labs, AI/RAG, progress, leaderboards, CLI commands, RAG ingest, and health.
- CLI tool `cliadm` preserved and routed through `/api/cli/commands`.
- Supabase RLS starter policies, Docker Compose, CI/CD workflows, environment example, deployment/local/testing docs.

## Security Posture
- Sensitive API routes require auth headers or CLI token in MVP route handlers.
- RBAC is enforced for dashboard and admin/RAG/CLI operations.
- Course-sensitive APIs check active enrollment or staff roles before returning scoped data.
- Document page responses use per-user page tokens and watermarks; no raw PDF URL is returned.
- Lead, live, lab, and AI routes include lightweight in-memory rate limiting suitable for local/Vercel single-instance MVP only.

## Remaining Production Risks
See `TODO_PRODUCTION.md`. Highest priority items are Supabase session verification, durable rate limiting, true PDF rasterization, full mutating CLI command handlers, and automated course-isolation tests against a seeded database.
