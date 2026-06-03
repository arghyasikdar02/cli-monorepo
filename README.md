# Cyber Lab IN Legacy App

The active application is restored to the original Vite frontend and Express backend architecture.

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

## Build
```bash
npm run build
```

## Auth
- Login page: `cyberscout/src/pages/auth/LoginPage.jsx`
- Signup page: `cyberscout/src/pages/auth/SignUpPage.jsx`
- OAuth callback page: `cyberscout/src/pages/auth/OAuthCallbackPage.jsx`
- Backend auth routes: `cyberscout-server/src/routes/auth.js`

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

