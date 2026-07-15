# Manual Test Checklist

Run these after `npm run install:all`.

1. Start the backend with `npm run dev:backend`.
2. Start the frontend with `npm run dev:frontend`.
3. Open `http://localhost:5173/` and confirm the landing page loads directly.
4. Click `Start Learning` on `/` and confirm it opens `/auth?mode=login...` with the login form first.
5. Open `/auth?mode=login` and confirm the login form is active.
6. Open `/auth?mode=signup` and confirm signup is available as the secondary auth mode.
7. Open `/signup`, create a new user with an unused email, and confirm the app redirects to `/dashboard`.
8. Log out, then log in from `/login` with the new user.
9. Open `/auth?mode=login&redirect=%2Flearn%2Fcourses%2Fc002`, log in, and confirm the app returns to `/learn/courses/c002`.
10. Open `/learn/courses/c002` while logged out and confirm the protected route sends you to login first with a redirect query.
11. Open `/courses` and confirm public courses load from the database.
12. Open `/learn/courses` and confirm authenticated courses load from the database.
13. Open a course detail page and confirm private materials are locked before enrollment.
14. Click `Enroll Now — Free` and confirm enrollment succeeds.
15. Confirm `/dashboard` shows the enrolled course only.
16. Reopen the course detail page and confirm private course materials are visible.
17. Open a lesson URL for the enrolled course and confirm lesson content is visible.
18. Create or log in as another user who is not enrolled in that course and confirm `/api/courses/:courseId/materials` returns `403`.
19. Confirm `/admin/login`, `/instructor/login`, `/marketing/login`, and `/ops/login` reject users without the matching role.
20. Confirm Google OAuth still starts from `/auth?mode=login` and `/auth?mode=signup` when OAuth credentials are configured.
