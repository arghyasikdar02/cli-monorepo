# Manual Test Checklist

Run these after `npm run install:all`.

1. Start the backend with `npm run dev:backend`.
2. Start the frontend with `npm run dev:frontend`.
3. Open `http://localhost:5173/` and confirm the landing page loads directly.
4. Open `/signup`, create a new user with an unused email, and confirm the app redirects to `/dashboard`.
5. Log out, then log in from `/login` with the new user.
6. Open `/courses` and confirm courses load from the database.
7. Open a course detail page and confirm private materials are locked before enrollment.
8. Click `Enroll Now — Free` and confirm enrollment succeeds.
9. Confirm `/dashboard` shows the enrolled course only.
10. Reopen the course detail page and confirm private course materials are visible.
11. Open a lesson URL for the enrolled course and confirm lesson content is visible.
12. Create or log in as another user who is not enrolled in that course and confirm `/api/courses/:courseId/materials` returns `403`.
13. Confirm `/admin/login`, `/instructor/login`, `/marketing/login`, and `/ops/login` reject users without the matching role.
