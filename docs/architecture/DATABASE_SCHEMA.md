# Database Schema

Supabase PostgreSQL is the only active production database. The canonical, executable schema is the ordered migration set in:

`cyberscout-server/db/migrations/`

Do not maintain or apply a second table-definition file. `supabase/schema.sql` intentionally points operators to the tracked migrations.

## Core domains

- Identity: `users`
- Catalogue: `course_categories`, `courses`, `course_modules`, `lessons`, `course_materials`
- Access: `batches`, `enrollments`, `user_progress`
- Delivery: `live_classes`, `live_class_attendance`, `course_videos`, `protected_documents`, `protected_document_events`
- Assessment: `labs`, `lab_flags`, `lab_attempts`, `quizzes`, `quiz_questions`, `quiz_attempts`, `assignments`, `assignment_submissions`, `certificates`
- Engagement: `ai_chat_sessions`, `ai_chat_messages`, `blogs`, `leads`, `lead_notes`, `follow_ups`, `visitor_analytics`, `cookie_consents`, `analytics_events`
- Commerce and operations: `payment_intents`, `payment_events`, `document_access_logs`, `audit_logs`, `schema_migrations`

IDs remain text because the restored legacy API and published content use stable prefixed identifiers. Structured payloads use `jsonb`, flags use PostgreSQL booleans, and dates use `timestamptz`.

## Change rules

Add schema changes as a new numbered migration. Never edit applied production history to force a rerun, drop production tables during startup, or run destructive seeds. The migration runner serializes deploys with an advisory lock and commits each file independently.
