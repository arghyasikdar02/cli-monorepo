# Backend Implementation Summary

The active legacy architecture remains Vite React in `cyberscout/` and Express in `cyberscout-server/`. No monorepo or framework migration was introduced.

## Runtime

- One shared `pg` pool connects to Supabase PostgreSQL through `DATABASE_URL`.
- Every repository query is asynchronous and parameterized with PostgreSQL placeholders.
- Tracked migrations run transactionally under an advisory lock and record applied filenames.
- Render runs migrations before start and never seeds or resets production records.
- The health endpoint checks PostgreSQL readiness without exposing credentials.

## Persisted modules

Authentication, roles, courses, modules, lessons, materials, enrollments, progress, batches, live classes, attendance, videos, protected documents, labs, quizzes, assignments, certificates, AI chat history, leads, analytics, payments and audit records are PostgreSQL-backed.

## Security boundary

The Express API is the only application data boundary. Route middleware enforces authentication, role, instructor assignment, active enrollment and optional batch membership. The browser receives no database credential or service-role key. `supabase/rls-policies.sql` denies direct anon/authenticated table access.

## Verification

The integration suite runs against PostgreSQL 16 and covers session security, role dashboards, course isolation, live access, learning modules, leads, analytics and CLI mutation safeguards.
