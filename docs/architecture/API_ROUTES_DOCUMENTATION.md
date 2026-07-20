# API Routes Documentation

Base URL for local development: `http://localhost:3001`

## Health

- `GET /`
- `GET /health`
- `GET /api/health`

Both health endpoints verify PostgreSQL connectivity and return `database: "connected"` only after a successful query.

## Auth

- `GET /api/auth/csrf` — sets the HTTP-only `cli_csrf` cookie and returns the matching double-submit token.
- `GET /api/auth/config`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/change-password`
- `POST /api/auth/logout`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/me`

Browser `POST`, `PUT`, `PATCH`, and `DELETE` requests must include the `cli_csrf` cookie and matching `X-CSRF-Token` header. This includes login and registration. Session JWTs are stored only in the HTTP-only `cli_session` cookie.

Login accepts `identifier` as an email address or username. Existing clients that send `email` remain supported. Accounts with `must_change_password` set receive `/change-password` as their redirect and may access only session, logout, and password-change endpoints until the password is replaced.

## Admin Instructor Accounts

- `GET /api/admin/usernames/check`
- `GET /api/admin/instructors`
- `POST /api/admin/instructors`
- `GET /api/admin/instructors/:instructorId`
- `PATCH /api/admin/instructors/:instructorId`
- `POST /api/admin/instructors/:instructorId/reset-password`
- `POST /api/admin/instructors/:instructorId/suspend`
- `POST /api/admin/instructors/:instructorId/reactivate`
- `POST /api/admin/instructors/:instructorId/archive`
- `PUT /api/admin/instructors/:instructorId/courses`
- `DELETE /api/admin/instructors/:instructorId/courses/:courseId`

These routes require `admin` or `super_admin`. Creation and reset responses contain a temporary password once; no password or hash is available from list/detail routes or audit records. Course replacement checks future live-class ownership before removing assignments.

## Users

- `GET /api/users`
- `GET /api/users/:userId`
- `PATCH /api/users/:userId`
- `PATCH /api/users/:userId/suspend`
- `PATCH /api/users/:userId/role`

## Courses

- `GET /api/courses/public`
- `GET /api/courses/public/:courseId`
- `GET /api/courses/public/slug/:categorySlug/:courseSlug`
- `GET /api/courses/my`
- `GET /api/courses/admin` — admin course catalogue with content and enrolment counts.
- `GET /api/courses/admin/:courseId` — full admin course structure.
- `POST /api/courses` — admin-only draft/course creation.
- `GET /api/courses/:courseId`
- `PATCH /api/courses/:courseId`
- `PATCH /api/courses/:courseId/publish`
- `PATCH /api/courses/:courseId/unpublish`
- `PATCH /api/courses/:courseId/archive`
- `PATCH /api/courses/:courseId/restore`
- `POST /api/courses/:courseId/modules`
- `PATCH /api/courses/:courseId/modules/:moduleId`
- `POST /api/courses/:courseId/modules/reorder`
- `POST /api/courses/:courseId/modules/:moduleId/lessons`
- `PATCH /api/courses/:courseId/modules/:moduleId/lessons/:lessonId`
- `POST /api/courses/:courseId/modules/:moduleId/lessons/reorder`
- `POST /api/courses/:courseId/resources`
- `PATCH /api/courses/:courseId/resources/:materialId`

Course, module, lesson, and resource writes require an authenticated administrator. Course assignment checks and composite identifiers prevent cross-course content changes. Reordering requires the submitted IDs to exactly match the records owned by the course or module.

## Enrollments

- `POST /api/enrollments`
- `GET /api/enrollments/me`
- `GET /api/enrollments/users/:userId`
- `GET /api/enrollments/courses/:courseId`
- `GET /api/enrollments/check/:courseId`
- `DELETE /api/enrollments/:enrollmentId` — deactivates the enrolment without deleting history.

## Live Classes

- `GET /api/live-classes` — admin/operations list; instructors receive only assigned classes.
- `POST /api/live-classes`
- `GET /api/live-classes/student/upcoming`
- `GET /api/live-classes/course/:courseId`
- `GET /api/live-classes/:liveClassId`
- `PATCH /api/live-classes/:liveClassId`
- `POST /api/live-classes/:liveClassId/google-meet`
- `GET /api/live-classes/:liveClassId/validate`
- `POST /api/live-classes/:liveClassId/join`
- `POST /api/live-classes/:liveClassId/leave`
- `POST /api/live-classes/:liveClassId/check-in`
- `GET /api/live-classes/:liveClassId/attendance`
- `GET /api/live-classes/:liveClassId/viewers`

Student schedules are filtered by published course, active enrolment, and optional batch. Student list and detail responses use the backend-owned fields `canJoin`, `joinAvailableAt`, `joinUrl`, and `denialReason`; the Meet URL is populated only while that learner is authorized and the 15-minute join window is open. Draft classes are hidden, cancelled classes never expose a join URL, and rescheduled timestamps are read directly from PostgreSQL.

The guarded join endpoint repeats every authorization check before recording the join event. It returns specific safe failures for missing enrolment, unpublished or cancelled classes, an unopened/expired join window, and a missing meeting link. Google connection IDs, space resources, tokens, and other provider metadata are not included in student responses.

## Google Integration

- `GET /api/integrations/google/status`
- `GET /api/integrations/google/connect`
- `POST /api/integrations/google/disconnect`

Google access and refresh tokens remain encrypted in PostgreSQL and are never returned by these endpoints.

## Videos

- `POST /api/videos`
- `GET /api/videos/course/:courseId`

## Protected Documents

- `POST /api/documents`
- `GET /api/documents/course/:courseId`
- `GET /api/documents/:documentId/view?page=1`

The viewer endpoint returns protected page-render metadata and watermark text. It does not return a raw PDF URL.

## Labs

- `POST /api/labs`
- `POST /api/labs/:labId/assign`
- `GET /api/labs/course/:courseId`
- `POST /api/labs/:labId/launch`
- `POST /api/labs/:labId/submit-flag`
- `GET /api/labs/attempts`

## Quizzes

- `POST /api/quizzes`
- `POST /api/quizzes/:quizId/questions`
- `GET /api/quizzes/course/:courseId`
- `POST /api/quizzes/:quizId/attempts`

## Assignments

- `POST /api/assignments`
- `GET /api/assignments/course/:courseId`
- `POST /api/assignments/:assignmentId/submissions`
- `PATCH /api/assignments/submissions/:submissionId/review`

## Progress

- `GET /api/progress/course/:courseId`
- `PATCH /api/progress/course/:courseId`

## Leaderboards

- `GET /api/leaderboards/course/:courseId`

## Certificates

- `GET /api/certificates/verify/:code`
- `POST /api/certificates`
- `GET /api/certificates/course/:courseId`
- `GET /api/certificates/me`

## AI/RAG

- `GET /api/ai/courses/:courseId/knowledge-base`
- `GET /api/ai/courses/:courseId/sessions`
- `POST /api/ai/courses/:courseId/sessions`
- `GET /api/ai/courses/:courseId/sessions/:sessionId/messages`
- `POST /api/ai/courses/:courseId/chat`

## Leads and CRM

- `POST /api/leads`
- `GET /api/leads`
- `PATCH /api/leads/:leadId`
- `POST /api/leads/:leadId/notes`

## Analytics

- `GET /api/analytics/admin`
- `GET /api/analytics/sales`

## Payments

- `POST /api/payments/orders`
- `GET /api/payments`
- `POST /api/payments/webhooks/razorpay`
- `POST /api/webhooks/razorpay`

## Audit

- `GET /api/audit`

## Dashboards

- `GET /api/dashboards/student`
- `GET /api/dashboards/admin`
- `GET /api/dashboards/instructor`
- `GET /api/dashboards/marketing`
- `GET /api/dashboards/ops`
