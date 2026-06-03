# Legacy Restore Audit

## Active Architecture
- Frontend: `cyberscout/`
- Backend: `cyberscout-server/`
- Frontend framework: Vite + React + React Router.
- Backend framework: Express.
- Package manager: npm, using the original `package-lock.json` files inside each app.

## Login Page
```text
cyberscout/src/pages/auth/LoginPage.jsx
```

Route:

```text
/login
```

## Signup Page
```text
cyberscout/src/pages/auth/SignUpPage.jsx
```

Route:

```text
/signup
```

## OAuth Callback Page
```text
cyberscout/src/pages/auth/OAuthCallbackPage.jsx
```

Route:

```text
/oauth/callback
```

## Backend Auth Routes
```text
cyberscout-server/src/routes/auth.js
```

Mounted in:

```text
cyberscout-server/src/index.js
```

Endpoints:
- `GET /api/auth/config`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/me`

## Frontend-to-Backend Connection
Frontend API helper:

```text
cyberscout/src/lib/api.js
```

It reads:

```text
VITE_API_URL
```

Default backend URL:

```text
http://localhost:3001
```

## Environment Variables Needed
Frontend:

```text
VITE_API_URL=http://localhost:3001
```

Backend:

```text
PORT=3001
JWT_SECRET=change_me_to_random_string_at_least_32_chars
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

## Run Frontend
```bash
npm run dev:frontend
```

or:

```bash
cd cyberscout
npm run dev
```

## Run Backend
```bash
npm run dev:backend
```

or:

```bash
cd cyberscout-server
npm run dev
```

## Test Credentials
The in-memory user store seeds:

```text
email: neel0409@gmail.com
password: password123
```

Defined in:

```text
cyberscout-server/src/store/users.js
```

## Failed Monorepo Status
The generated scaffold is archived at:

```text
archived/failed-monorepo-migration/
```

Active build/start commands do not reference `apps/web`, `@cyberlabin/web`, `services/*`, `packages/*`, or the generated Prisma scaffold.

