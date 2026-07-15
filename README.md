# Cyber Lab IN

The active application uses the original Vite frontend and Express backend architecture. Core learning and growth flows are backed by a durable database: signup, login, course catalog, enrollment, student dashboard, course materials, lead capture, blog content, visitor analytics, protected lesson reading, and course-bound AI chat.

## Active Folders
- `cyberscout/`: Vite + React frontend.
- `cyberscout-server/`: Express auth/API backend.

The failed monorepo migration is archived at:

```text
archived/failed-monorepo-migration/
```

## Install
```bash
npm run install:all
```

The install command installs both apps and runs the backend database setup. To run database commands directly:

```bash
npm run db:migrate
npm run db:seed
npm run db:setup
```

By default the local database is stored at:

```text
cyberscout-server/data/cyberlab.sqlite
```

Override it with `DATABASE_URL` in `cyberscout-server/.env`.

## Run Locally
Run both frontend and backend from the root:

```bash
npm run dev
```

Or run each side separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3001
```

## Public Landing Page
The domain root `/` renders the platform-level Cyber Lab IN homepage directly. The old generic welcome route redirects back to `/`.

The public experience uses the shared enterprise design system, accessible mega menus, mobile accordion navigation, editorial page layouts and structured footer documented in:

```text
CISCO_INSPIRED_REDESIGN_AUDIT.md
PUBLIC_DESIGN_SYSTEM.md
CISCO_INSPIRED_REDESIGN_IMPLEMENTATION.md
```

Primary homepage positioning:

```text
Online Cybersecurity Courses with Hands-On Labs
```

The dedicated Cyber Security Essentials course page remains at:

```text
/courses/cybersecurity/cyber-security-essentials
```

Clean public course routes:

```text
/
/courses
/courses/cybersecurity
/courses/cybersecurity/cyber-security-essentials
/courses/cybersecurity/web-application-security
/courses/cybersecurity/soc-analyst-foundations
/courses/cybersecurity/ethical-hacking-foundations
/learning-paths
/learning-paths/beginner-cybersecurity
/learning-paths/ethical-hacking
/learning-paths/soc-analyst
/learning-paths/network-cloud-security
/learning-paths/digital-forensics
/labs
/labs/:labSlug
/resources
/blog
/blog/:slug
/about
/instructors
/instructors/arghya-sikdar
/contact
/for-organisations
/for-institutions
/for-businesses
/faq
/accessibility
/privacy-policy
/terms
/refund-policy
/cookie-policy
/certificate-verification
```

Authenticated LMS course routes:

```text
/learn/courses
/learn/courses/:id
```

Frontend landing-page environment variables:

```text
VITE_SITE_URL=https://cyberlabin.com
VITE_CSE_COURSE_FEE=0
```

Homepage SEO/AEO implementation notes:

```text
SEO_AEO_HOMEPAGE_IMPLEMENTATION.md
LANDING_PAGE_CONTENT_MAP.md
TECHNICAL_SEO_CHECKLIST.md
```

## Build
```bash
npm run build
```

## Test
```bash
npm run test
```

## Auth
- Login page: `cyberscout/src/pages/auth/LoginPage.jsx`
- Signup page: `cyberscout/src/pages/auth/SignUpPage.jsx`
- OAuth callback page: `cyberscout/src/pages/auth/OAuthCallbackPage.jsx`
- Backend auth routes: `cyberscout-server/src/routes/auth.js`

New users are stored in the database and passwords are hashed with bcrypt. Role-specific login pages use the same backend auth system:

```text
/login
/admin/login
/instructor/login
/marketing/login
/ops/login
```

## Core API
```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/change-password
GET  /api/courses/public
GET  /api/courses/public/:courseId
GET  /api/courses/public/slug/:categorySlug/:courseSlug
GET  /api/courses/:courseId
POST /api/courses/:courseId/enroll
GET  /api/courses/:courseId/materials
GET  /api/courses/my
POST /api/leads
GET  /api/leads
PATCH /api/leads/:leadId
GET  /api/blogs
GET  /api/blogs/:slug
POST /api/visitors/track
POST /api/visitors/consent
GET  /api/visitors/stats
GET  /api/dashboards/student
GET  /api/dashboards/admin
GET  /api/dashboards/marketing
POST /api/ai/courses/:courseId/chat
```

Private lessons and materials require an authenticated user with active course enrollment or staff access.

Auth tokens are returned for the existing frontend guard and also stored in an HTTP-only `cli_session` cookie by the backend. Password changes rotate `token_version` so older JWTs fail closed.

## Lead, Blog, and Visitor Systems
- Landing-page leads use source `landing_form`.
- FAQ assistant leads use source `chatbot`.
- Course popup leads use source `course_popup`.
- Marketing and admin dashboards read leads and visitor counts from the database.
- Blog listing and detail pages read from the `blogs` table seeded by the backend migration.
- Visitor analytics use a privacy-conscious visitor ID cookie and an IP hash, not raw IP storage in the visitor table.

## Environment
Frontend env example:

```text
cyberscout/.env.example
```

Backend env example:

```text
cyberscout-server/.env.example
```

Do not commit real `.env` files.

## Local Verification Checklist
- `/` opens the Cyber Lab IN landing page directly.
- `/courses`, `/courses/cybersecurity`, and `/courses/cybersecurity/cyber-security-essentials` open public course pages.
- `/blog` and all seeded blog detail routes open from database-backed content.
- Create a new account from `/signup`.
- Confirm the user exists in `cyberscout-server/data/cyberlab.sqlite`.
- Log in from `/login`.
- Open `/learn/courses` and confirm authenticated courses load from the database.
- Enroll in a course.
- Confirm `/dashboard` shows only enrolled courses.
- Open the enrolled course and confirm private materials are visible.
- Log in as a different non-enrolled user and confirm private materials return `403`.
- Submit the landing lead form and confirm it appears in `/marketing/dashboard`.
- Open the FAQ assistant, request a callback, and confirm source `chatbot`.
- Change password from `/settings?tab=security` and confirm the old password no longer works.
- Confirm `/leaderboard` shows real progress data only or an empty state.

## Deployment Notes
- Frontend can deploy to Vercel using `cyberscout/` as the app root and `npm run build`.
- Backend can deploy to Render/Fly/Railway or any Node host that supports persistent storage or a managed database.
- Supabase/Postgres deployment should use the SQL in `supabase/` as the production database starting point. Keep service keys on the backend only.
