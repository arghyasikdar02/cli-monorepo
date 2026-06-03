# Course Isolation Rules

No student should see content from a course unless they have an active enrollment for that course.

## Required Check

Every course-sensitive backend route must verify:

- authenticated user
- user role
- course_id
- batch_id when applicable
- active enrollment for students
- resource ownership/access for instructors and operators

## Applied To

- Courses
- Enrollments
- Live classes
- Videos
- Protected documents
- Labs
- Quizzes
- Assignments
- Progress
- Leaderboards
- Certificates
- AI/RAG sessions

## Middleware

Course checks are implemented in:

- `cyberscout-server/src/middleware/access.js`

Core middleware:

- `requireAuth`
- `requireRole`
- `requireCourseAccess`
- `requireCourseManager`

## Admin and Staff Exceptions

The following roles may access course-sensitive data for operational reasons:

- `admin`
- `super_admin`
- `instructor`
- `ops`
- `lab_creator`
- `support`
- `finance` where payment-related

Instructor access should be narrowed to assigned courses when production persistence is added.

## Protected Documents

Raw PDFs are not returned. The MVP protected viewer endpoint returns protected page-render metadata and logs access.

Production should render pages server-side as images/canvas-safe pages with dynamic watermarking.

## AI/RAG

AI chat sessions, messages, usage limits, and knowledge base metadata are scoped by:

- `user_id`
- `course_id`

The mock AI provider refuses cross-course requests.
