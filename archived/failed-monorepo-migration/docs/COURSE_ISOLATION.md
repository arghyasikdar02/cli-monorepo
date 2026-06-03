# Course Isolation

Every sensitive API must verify:
- user identity
- role
- `course_id`
- `batch_id` when applicable
- active enrollment
- resource ownership

## Protected Resources
- Live classes and recordings.
- Protected PDFs/documents.
- Labs and flags.
- AI/RAG sessions and retrieval.
- Progress and leaderboards.
- Quizzes, assignments, and certificates.

## Current Implementation
- Shared guard: `packages/auth-guards/src/courseAccess.ts`.
- API routes enforce enrollment/staff checks before returning course-sensitive data.
- Supabase RLS starter: `infra/supabase/rls_policies.sql`.

## Required Tests
- Course A student cannot fetch Course B content.
- Batch A student cannot join Batch B live class.
- Course A AI session cannot retrieve Course B chunks.
- Document token for Course A cannot open Course B document.

