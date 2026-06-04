# Implementation Plan

## Source of Truth

The PRD is available at:

- `/Users/a/Downloads/01_Product_Requirements_Document.md`

This plan follows that PRD while preserving the current restored legacy app. The PRD describes an ideal modular Next.js/monorepo MVP, but this repository was explicitly restored to a legacy Vite/Express architecture. To obey the non-destructive rule, the implementation is additive inside the current app instead of replacing it.

## Current App

- Frontend: `cyberscout/` Vite React
- Backend: `cyberscout-server/` Express
- Auth: local JWT auth with preserved Google OAuth flow
- Storage: dev-only in-memory store in `cyberscout-server/src/store/platformStore.js`
- Existing app must remain working.

## Additive Strategy

No rewrite, no monorepo, no destructive migration. New platform pieces will be added around the legacy app:

1. Harden authorization with fail-closed guards.
2. Add Supabase-compatible schema and RLS starter files.
3. Add new dashboard aliases while keeping old dashboard routes.
4. Add live class join-window checks, attendance metadata, and recording metadata.
5. Harden protected documents, labs, RAG, and CRM with course/batch isolation.
6. Add CLI admin tool `cliadm` with dry-run, confirmation, token checks, JSON output, and audit logging.
7. Add tests for guards, course isolation, live denial, RAG boundaries, dashboard access, and CLI safety.
8. Add docs and CI workflows.

## P0 Implementation Order

### Phase 1: Safety and Authorization

- Add central guard service:
  - active enrollment guard
  - course ownership guard
  - batch membership guard
  - instructor assignment guard
  - admin/RBAC guard
- Replace ad hoc route checks where practical.
- Ensure default-deny behavior for unknown course/batch/resource access.

### Phase 2: Schema and RLS

- Add `supabase/schema.sql`.
- Add `supabase/rls-policies.sql`.
- Include all required tables:
  users/profiles, roles, courses, batches, enrollments, lessons, protected_documents, quizzes, assignments, submissions, progress, certificates, live_classes, attendance, labs, lab_attempts, lab_flags, rag_sources, rag_chunks, rag_chat_sessions, rag_messages, leads, lead_notes, follow_ups, payment_intents, analytics_events, audit_logs.

### Phase 3: Modules

- Live classes:
  - course_id and batch_id checks
  - join-window enforcement
  - attendance events
  - recording metadata
- Protected documents:
  - no raw PDF URL
  - guarded page endpoint
  - watermark metadata
  - audit event
- Labs:
  - course/lesson mapping
  - hints
  - attempts and flags
  - scoring
  - Docker/local readiness metadata
- RAG:
  - course-specific ingestion metadata
  - course-specific retrieval
  - citations
  - refusal outside enrolled course knowledge base
- CRM:
  - source attribution
  - lead notes
  - follow-ups
  - rule-based lead scoring

### Phase 4: Dashboards

Add new routes:

- `/dashboard/student`
- `/dashboard/instructor`
- `/dashboard/admin`
- `/dashboard/sales`

Keep existing routes working:

- `/dashboard`
- `/instructor/dashboard`
- `/admin/dashboard`
- `/marketing/dashboard`
- `/ops/dashboard`

### Phase 5: CLI Admin

Add `cliadm` under `cyberscout-server/src/cli/cliadm.js` and expose from root package scripts.

Required safety:

- dry-run support
- confirmation for destructive commands
- admin token required
- JSON output option
- audit logging for mutations

### Phase 6: Tests and CI

- Use Node test runner for backend tests.
- Add tests:
  - guard unit tests
  - integration course isolation
  - live join denial
  - RAG course-boundary refusal
  - dashboard access
  - CLI destructive dry-run behavior
- Add GitHub Actions workflow for install, lint, tests, build.

### Phase 7: Docs and Readiness Report

Add/update:

- `docs/architecture.md`
- `docs/database.md`
- `docs/security.md`
- `docs/deployment-free-tier.md`
- `docs/aws-migration.md`
- `docs/cli-admin.md`
- `docs/testing.md`
- `PRODUCTION_READINESS_REPORT.md`

## Production Limits

The current MVP remains dev-store based until a Supabase database is connected. The schema and RLS files are production-ready starters, but persistent data requires applying them to Supabase and swapping the store adapter.
