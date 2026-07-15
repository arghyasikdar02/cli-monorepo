# Database Schema

The current MVP uses an in-memory dev-only store in `cyberscout-server/src/store/platformStore.js`.

Production should replace it with a durable PostgreSQL-compatible schema. SQLite can be used locally if migrations stay PostgreSQL-ready.

## Tables

### users

- id
- name
- email
- password_hash
- google_id
- status
- role
- roles
- rank
- xp
- level
- streak_days
- is_pro
- created_at
- updated_at

### courses

- id
- title
- slug
- description
- status
- level
- duration
- price
- instructor_id
- tags
- created_at
- updated_at

### enrollments

- id
- user_id
- course_id
- batch_id
- status
- source
- created_at
- updated_at

Unique production key: `user_id + course_id + batch_id`.

### live_classes

- id
- course_id
- batch_id
- instructor_id
- title
- provider
- embed_url
- join_url
- scheduled_start
- scheduled_end
- status
- created_at
- updated_at

### live_class_attendance

- id
- live_class_id
- course_id
- batch_id
- user_id
- joined_at
- left_at
- watch_seconds
- status

### videos

- id
- course_id
- title
- provider
- embed_id
- order
- created_at

### documents

- id
- course_id
- title
- storage_key
- page_count
- status
- created_at

### document_access_logs

- id
- document_id
- course_id
- user_id
- metadata
- created_at

### labs

- id
- course_id
- title
- description
- flag_hash
- points
- status
- created_at
- updated_at

### lab_attempts

- id
- lab_id
- course_id
- user_id
- status
- score
- started_at
- submitted_at

### quizzes

- id
- course_id
- title
- status
- created_at

### quiz_questions

- id
- quiz_id
- prompt
- choices
- answer_hash
- order

### quiz_attempts

- id
- quiz_id
- course_id
- user_id
- answers
- score
- submitted_at

### assignments

- id
- course_id
- title
- description
- status
- due_at
- created_at

### submissions

- id
- assignment_id
- course_id
- user_id
- content
- status
- score
- feedback
- reviewed_by
- submitted_at
- reviewed_at

### progress

- id
- user_id
- course_id
- lesson_progress
- video_progress
- document_progress
- lab_progress
- quiz_progress
- completion_percentage
- updated_at

### certificates

- id
- user_id
- course_id
- code
- issued_by
- issued_at
- status

### ai_chat_sessions

- id
- user_id
- course_id
- title
- created_at
- updated_at

### ai_chat_messages

- id
- session_id
- user_id
- course_id
- role
- content
- created_at

### knowledge_base_documents

- id
- course_id
- title
- storage_key
- status
- source
- created_at

### leads

- id
- name
- email
- phone
- course_id
- source
- stage
- owner_id
- status
- follow_up_date
- created_at
- updated_at

### lead_notes

- id
- lead_id
- actor_id
- note
- created_at

### payments

- id
- user_id
- course_id
- amount
- currency
- provider
- provider_order_id
- provider_event_id
- status
- metadata
- created_at

### audit_logs

- id
- actor_id
- action
- target_type
- target_id
- metadata
- created_at

## Production Migration Notes

- Add indexes for all foreign keys and `course_id`.
- Add enrollment status indexes for course access checks.
- Store lab flags and quiz answers as hashes, never plaintext.
- Store protected PDFs in private object storage only.
- Never expose storage keys or service-role secrets to the frontend.
