# Cyber Lab IN ER Diagram

This ERD is based on the actual SQLite migration files in `cyberscout-server/db/migrations`:

- `001_core_lms.sql`
- `002_ai_chat_history.sql`
- `003_crm_leads.sql`
- `004_live_class_attendance.sql`
- `005_saas_growth_features.sql`

The complete single-file ERD source is available at `docs/diagrams/er-diagram.mmd`. The sections below split it into readable developer views.

## Core LMS ERD

```mermaid
erDiagram
  USERS {
    string id PK
    string username UK
    string email UK
    string google_id UK
    string role
    string roles
    string status
    integer token_version
  }

  COURSE_CATEGORIES {
    string id PK
    string slug UK
    string name
  }

  COURSES {
    string id PK
    string slug UK
    string category_slug
    string title
    string level
    string duration
    string mode
    string credential
    integer price
    string status
  }

  COURSE_MODULES {
    string id PK
    string course_id FK
    string title
    integer sort_order
  }

  LESSONS {
    string id PK
    string course_id FK
    string module_id FK
    string title
    string duration
    string status
    integer sort_order
  }

  COURSE_MATERIALS {
    string id PK
    string course_id FK
    string lesson_id FK
    string type
    string title
    string resource_url
    integer is_public
    integer sort_order
  }

  ENROLLMENTS {
    string id PK
    string user_id FK
    string course_id FK
    string status
    string source
    string enrolled_at
  }

  USER_PROGRESS {
    string id PK
    string user_id FK
    string course_id FK
    string lesson_id FK
    integer completion_percentage
    string completed_at
  }

  COURSE_CATEGORIES ||--o{ COURSES : logical_slug
  USERS ||--o{ ENROLLMENTS : enrolls
  COURSES ||--o{ ENROLLMENTS : accepts
  COURSES ||--o{ COURSE_MODULES : contains
  COURSES ||--o{ LESSONS : contains
  COURSE_MODULES ||--o{ LESSONS : groups
  COURSES ||--o{ COURSE_MATERIALS : owns
  LESSONS ||--o{ COURSE_MATERIALS : attaches
  USERS ||--o{ USER_PROGRESS : records
  COURSES ||--o{ USER_PROGRESS : tracks
  LESSONS ||--o{ USER_PROGRESS : measures
```

## Auth, Audit, AI, Live, And Document ERD

```mermaid
erDiagram
  USERS {
    string id PK
    string email UK
    string password_hash
    string google_id UK
    string role
    string roles
    string status
    integer token_version
  }

  COURSES {
    string id PK
    string slug UK
    string title
    string status
  }

  COURSE_MATERIALS {
    string id PK
    string course_id FK
    string lesson_id FK
    string type
    string title
  }

  LIVE_CLASSES {
    string id PK
    string course_id FK
    string batch_id
    string instructor_id FK
    string provider
    string join_url
    string embed_url
    string scheduled_start
    string scheduled_end
    string status
  }

  LIVE_CLASS_ATTENDANCE {
    string id PK
    string live_class_id FK
    string user_id FK
    string event
    string created_at
  }

  DOCUMENT_ACCESS_LOGS {
    string id PK
    string user_id FK
    string course_id FK
    string material_id FK
    string event
    string ip_address
    string user_agent
  }

  AUDIT_LOGS {
    string id PK
    string actor_id FK
    string action
    string entity_type
    string entity_id
    string metadata
  }

  AI_CHAT_SESSIONS {
    string id PK
    string user_id FK
    string course_id FK
    string title
  }

  AI_CHAT_MESSAGES {
    string id PK
    string session_id FK
    string user_id FK
    string course_id FK
    string role
    string content
    string citations
  }

  COURSES ||--o{ LIVE_CLASSES : schedules
  USERS ||--o{ LIVE_CLASSES : instructs
  LIVE_CLASSES ||--o{ LIVE_CLASS_ATTENDANCE : emits
  USERS ||--o{ LIVE_CLASS_ATTENDANCE : attends
  USERS ||--o{ DOCUMENT_ACCESS_LOGS : triggers
  COURSES ||--o{ DOCUMENT_ACCESS_LOGS : scopes
  COURSE_MATERIALS ||--o{ DOCUMENT_ACCESS_LOGS : logs
  USERS ||--o{ AUDIT_LOGS : acts
  USERS ||--o{ AI_CHAT_SESSIONS : starts
  COURSES ||--o{ AI_CHAT_SESSIONS : scopes
  AI_CHAT_SESSIONS ||--o{ AI_CHAT_MESSAGES : contains
  USERS ||--o{ AI_CHAT_MESSAGES : writes
  COURSES ||--o{ AI_CHAT_MESSAGES : scopes
```

## Marketing, Content, And Analytics ERD

```mermaid
erDiagram
  USERS {
    string id PK
    string email UK
    string role
    string roles
  }

  COURSES {
    string id PK
    string slug UK
    string title
    string category_slug
  }

  LEADS {
    string id PK
    string name
    string phone
    string email
    string message
    string course_id FK
    string source
    string stage
    string owner_id FK
    string visitor_id
  }

  LEAD_NOTES {
    string id PK
    string lead_id FK
    string author_id FK
    string note
  }

  FOLLOW_UPS {
    string id PK
    string lead_id FK
    string owner_id FK
    string due_at
    string status
  }

  BLOGS {
    string id PK
    string slug UK
    string title
    string excerpt
    string status
  }

  VISITOR_ANALYTICS {
    string id PK
    string visitor_id UK
    string first_seen_at
    string last_seen_at
    integer visits
    integer consent_analytics
    integer consent_marketing
  }

  COOKIE_CONSENTS {
    string id PK
    string visitor_id FK
    integer necessary
    integer analytics
    integer marketing
  }

  COURSES ||--o{ LEADS : interested
  USERS ||--o{ LEADS : owns
  LEADS ||--o{ LEAD_NOTES : has
  USERS ||--o{ LEAD_NOTES : authors
  LEADS ||--o{ FOLLOW_UPS : schedules
  USERS ||--o{ FOLLOW_UPS : owns
  VISITOR_ANALYTICS ||--o{ COOKIE_CONSENTS : records
```

## Constraints And Delete Behavior

- `users.email`, `users.username`, `users.google_id`, `courses.slug`, `course_categories.slug`, `blogs.slug`, and `visitor_analytics.visitor_id` are unique.
- `schema_migrations.name` is unique and tracks applied migration names.
- `enrollments` has `UNIQUE(user_id, course_id)` to prevent duplicate course enrollment rows.
- `user_progress` has `UNIQUE(user_id, course_id, lesson_id)` for one progress row per lesson scope.
- Course deletion cascades to modules, lessons, materials, enrollments, progress, live classes, document access logs, and AI sessions/messages.
- Lesson deletion sets `course_materials.lesson_id` and `user_progress.lesson_id` to `NULL`.
- User deletion cascades to enrollments, progress, document logs, AI chat data, and live attendance; it sets nullable owner/actor/instructor references to `NULL`.
- Lead deletion cascades to lead notes and follow-ups.
- Visitor deletion cascades to cookie consent rows through `visitor_id`.

## Current Implementation Notes

- The running app uses SQLite through `better-sqlite3` in `cyberscout-server/src/db/index.js`.
- The repository layer in `cyberscout-server/src/db/repositories.js` maps snake_case database rows to frontend-friendly camelCase objects.
- Roles are stored as both `role` and JSON text `roles`; route guards read the parsed `roles` array.
- Course category assignment is currently a logical slug relation from `courses.category_slug` to `course_categories.slug`; the SQLite migration does not enforce it with a foreign key.
- `live_classes.batch_id` exists for future batch isolation, but the migrations do not currently create a `batches` table.
- `cookie_consents.visitor_id` references `visitor_analytics(visitor_id)`, which is unique.

## Planned/Future Production Notes

- Supabase Postgres is the planned production database, but the current implementation is still SQLite.
- Row Level Security is not available in SQLite. Supabase migration should add deny-by-default RLS policies for users, enrollments, materials, leads, analytics, and staff dashboards.
- Render free filesystem storage is not reliable for persistent SQLite production data. Use Supabase Postgres before real production traffic.
- Future migrations should add explicit tables for batches, RAG source documents/chunks, labs/flags/attempts, quizzes/questions/attempts, assignments/submissions, payments, certificates, and Supabase Storage metadata if these features move beyond their current MVP route implementations.
