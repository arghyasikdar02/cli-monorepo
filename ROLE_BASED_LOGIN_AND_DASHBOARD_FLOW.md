# Role-Based Login and Dashboard Flow

## Login Pages

- Student: `/login`
- Admin: `/admin/login`
- Instructor: `/instructor/login`
- Sales/Marketing: `/marketing/login`
- Lab/Admin Ops: `/ops/login`

The existing student login page at `/login` was preserved.

## Redirect Targets

- `student` -> `/dashboard`
- `admin`, `super_admin` -> `/admin/dashboard`
- `instructor` -> `/instructor/dashboard`
- `marketing`, `sales` -> `/marketing/dashboard`
- `ops`, `lab_creator`, `support`, `finance` -> `/ops/dashboard`

## Backend Role Claims

`POST /api/auth/login` returns:

- `token`
- `user`
- `redirectTo`

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

If a user is not authenticated, the guard redirects to the correct login page. If a user has the wrong role, the guard also redirects to the role-specific login page.

## Backend Guards

Backend middleware is in:

- `cyberscout-server/src/middleware/access.js`

Middleware includes:

- `requireAuth`
- `requireRole`
- `requireDashboardRole`
- `requireCourseAccess`
- `requireCourseManager`
