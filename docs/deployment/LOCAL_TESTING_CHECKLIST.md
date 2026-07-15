# Local Testing Checklist

Date: June 10, 2026
Latest update: June 11, 2026

## Commands

Install dependencies:

```bash
npm run install:all
```

Start backend:

```bash
npm run dev:backend
```

Start frontend:

```bash
npm run dev:frontend
```

Run quality checks:

```bash
npm run lint
npm run build
```

## Public Route Checks

- [ ] `/`
- [ ] `/courses`
- [ ] `/courses/cybersecurity/cyber-security-essentials`
- [ ] `/courses/cybersecurity/web-application-security`
- [ ] `/learning-paths/beginner-cybersecurity`
- [ ] `/labs`
- [ ] `/resources`
- [ ] `/instructors/arghya-sikdar`
- [ ] `/contact`
- [ ] `/privacy-policy`
- [ ] `/terms`
- [ ] `/refund-policy`
- [ ] `/cookie-policy`
- [ ] `/certificate-verification`
- [ ] `/login`
- [ ] `/signup`

## Backend Checks

- [ ] `GET /api/health`
- [ ] `GET /api/auth/config`
- [ ] `POST /api/auth/login` with `neel0409@gmail.com / password123`
- [ ] `POST /api/auth/login` with `admin@cyberlabin.com / password123`
- [ ] `GET /api/auth/me` with a login token
- [ ] `GET /api/courses/public`
- [ ] `GET /api/blogs`

## Expected Results

- Homepage loads at `/` without `/home` or `/welcome` redirect behaviour.
- Existing login and signup pages still load.
- Backend starts on port `3001`.
- Frontend starts on port `5173`.
- Seeded login users authenticate successfully after database setup.
- Course and lead APIs continue using the real backend database.

## Verification Results

- `npm run install:all`: passed on June 10, 2026.
- `npm run lint`: passed on June 10, 2026.
- `npm run build`: passed on June 10, 2026.
- Backend dev server: started successfully on port `3001` on June 10, 2026.
- Frontend dev server: started successfully on port `5173` on June 10, 2026.
- `GET /api/health`: returned `200` on June 10, 2026.
- `GET /api/auth/config`: returned `200` on June 10, 2026.
- `POST /api/auth/login` with `neel0409@gmail.com / password123`: returned `200` on June 10, 2026.
- `GET /api/auth/me` with the login token: returned `200` on June 10, 2026.
- `GET /api/courses/public`: returned `200` with database-backed courses on June 10, 2026.
- Public route status checks returned `200` for `/`, `/courses`, `/courses/cybersecurity/cyber-security-essentials`, `/learning-paths/beginner-cybersecurity`, `/instructors/arghya-sikdar`, `/login`, `/signup`, `/dashboard`, `/blog`, `/about`, `/resources`, `/labs`, `/privacy-policy`, `/terms`, `/refund-policy`, `/cookie-policy` and `/certificate-verification`.
- Browser visual check confirmed the homepage H1 and no horizontal overflow at `390px` mobile width.
- `npm run install:all`: passed on June 11, 2026.
- `npm run test`: passed 11 backend tests on June 11, 2026.
- `npm run lint`: passed on June 11, 2026.
- `npm run build`: passed on June 11, 2026 with a non-failing Vite chunk-size warning.
- `GET /api/blogs`: returned `200` with category, author and published date metadata on June 11, 2026.
- Route checks returned `200` for `/`, `/login`, `/signup`, `/dashboard`, `/blog`, `/blog/what-is-cybersecurity`, `/instructors/arghya-sikdar`, `/courses/cybersecurity/cyber-security-essentials` and `/learning-paths/beginner-cybersecurity` on June 11, 2026.
- Browser visual check confirmed chatbot welcome copy, removed the old chatbot disclaimer, loaded instructor trust content and showed no horizontal overflow at `390px` on June 11, 2026.
