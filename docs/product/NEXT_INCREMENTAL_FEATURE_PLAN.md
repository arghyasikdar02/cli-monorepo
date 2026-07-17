# Next Incremental Feature Plan

Do not restructure the app into a monorepo. Continue building inside:

- `cyberscout/`
- `cyberscout-server/`

## Phase 1: Stabilize Legacy Runtime

- Keep existing student auth and OAuth flow stable.
- Add production environment validation.
- Add backend route tests for auth, roles, and course access.
- Validate the tracked PostgreSQL migrations against the production Supabase project before the first cutover.

## Phase 2: Course Access and Content

- Connect legacy course pages to backend course APIs.
- Add enrollment unlock UI.
- Add protected video/document/lab route calls to existing course UI.
- Add backend pagination and filters.

## Phase 3: Payments and Enrollments

- Complete Razorpay order/payment link integration.
- Store webhook events durably.
- Activate enrollments after verified successful payments.
- Add idempotency indexes.

## Phase 4: Protected Documents

- Add private storage bucket.
- Render PDF pages server-side.
- Apply dynamic watermarking.
- Add rate limiting and document access analytics.

## Phase 5: Live Classes and Analytics

- Connect live class pages to backend access checks.
- Track join/leave events from the frontend.
- Add admin/instructor live monitoring views.

## Phase 6: AI/RAG and Labs

- Add course-specific ingestion pipeline.
- Add provider abstraction for paid AI providers later.
- Add Docker-ready lab launch adapter.
- Add lab scoring and leaderboard updates.

## Phase 7: CLI Admin

- Add CLI admin only after durable storage exists.
- Commands should call backend APIs or internal services, not mutate frontend data.
