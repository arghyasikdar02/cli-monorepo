# Role-Based Login and Dashboard Flow

## Login Pages

- Student: `/login`
- Admin: `/admin/login`
- Instructor: `/instructor/login`
- Sales/Marketing: `/marketing/login`
- Lab/Admin Ops: `/ops/login`

The existing student login page at `/login` was preserved.

All password login pages accept either email or username. Instructor accounts created by an administrator begin with a temporary password and are sent to `/change-password` before any dashboard, course, Google integration, or live-class API is available.

## Redirect Targets

- `student` -> `/dashboard`
- `admin`, `super_admin` -> `/admin/dashboard`
- `instructor` -> `/instructor/dashboard`
- `marketing`, `sales` -> `/marketing/dashboard`
- `ops`, `lab_creator`, `support`, `finance` -> `/ops/dashboard`

## Backend Role Claims

`POST /api/auth/login` returns `user` and `redirectTo`. The signed session stays in the secure HTTP-only cookie and is not returned to frontend JavaScript.

The JWT includes:

- `sub`
- `email`
- `role`
- `roles`

## Frontend Guards

Student routes continue to use:

- `cyberscout/src/components/layout/ProtectedRoute.jsx`

Role dashboard routes use:

- `cyberscout/src/components/layout/RoleProtectedRoute.jsx`

If a user is not authenticated, the guard redirects to the correct login page. Authenticated users with the wrong role see an access-denied state. Users with a mandatory password change are redirected to `/change-password` before role routing.

## Backend Guards

Backend middleware is in:

- `cyberscout-server/src/middleware/access.js`

Middleware includes:

- `requireAuth`
- `requireRole`
- `requireDashboardRole`
- `requireCourseAccess`
- `requireCourseManager`

`requireAuth` also validates account status, token version, and the mandatory password-change state. Password reset, suspension, reactivation, and archival increment the token version so prior sessions cannot continue.
