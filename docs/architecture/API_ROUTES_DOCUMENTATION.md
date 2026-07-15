# API Routes Documentation

Base URL for local development: `http://localhost:3001`

## Health

- `GET /api/health`

## Auth

- `GET /api/auth/config`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/me`

## Users

- `GET /api/users`
- `GET /api/users/:userId`
- `PATCH /api/users/:userId`
- `PATCH /api/users/:userId/suspend`
- `PATCH /api/users/:userId/role`

## Courses

- `GET /api/courses/public`
- `GET /api/courses/public/:courseId`
- `GET /api/courses/enrolled`
- `POST /api/courses`
- `GET /api/courses/:courseId`
- `PATCH /api/courses/:courseId`
- `PATCH /api/courses/:courseId/publish`
- `PATCH /api/courses/:courseId/archive`

## Enrollments

- `POST /api/enrollments`
- `GET /api/enrollments/me`
- `GET /api/enrollments/users/:userId`
- `GET /api/enrollments/courses/:courseId`
- `GET /api/enrollments/check/:courseId`

## Live Classes

- `POST /api/live-classes`
- `GET /api/live-classes/student/upcoming`
- `GET /api/live-classes/course/:courseId`
- `GET /api/live-classes/:liveClassId`
- `PATCH /api/live-classes/:liveClassId`
- `POST /api/live-classes/:liveClassId/join`
- `POST /api/live-classes/:liveClassId/leave`
- `GET /api/live-classes/:liveClassId/attendance`
- `GET /api/live-classes/:liveClassId/viewers`

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
