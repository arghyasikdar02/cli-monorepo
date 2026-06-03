# Live Class System

## Current APIs
- `GET /api/live/classes`
- `POST /api/live/classes`
- `POST /api/live/classes/:id/join`
- `POST /api/live/classes/:id/leave`

## Rules
- Only enrolled students can join.
- `course_id` is mandatory.
- `batch_id` is enforced when present.
- Stream/embed URLs are returned only after checks pass.
- Attendance is recorded in `live_class_attendance`.
- Viewer events are ready through `live_viewer_events`.

## Admin Monitoring
Admin and instructor dashboards read database-backed live metrics. Realtime viewer counts should use Supabase Realtime or polling fallback before beta.

