# Production Deployment Note: Render + SQLite

Cyber Lab IN currently runs the backend on Render with SQLite through `better-sqlite3`.

This is acceptable only for temporary production testing. It is not a durable long-term production database.

## Current Safe Startup Behavior

The backend now prepares the database during `npm start`:

1. Opens the SQLite database.
2. Runs any pending SQL migrations from `cyberscout-server/db/migrations`.
3. Seeds required baseline courses and role accounts only when baseline data is missing.
4. Starts Express after the database is ready.

The existing Render start command still works:

```bash
npm run db:setup && npm start
```

The safer simplified start command is:

```bash
npm start
```

Use it from the Render service root directory:

```text
cyberscout-server
```

## Required Render Environment Variables

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=file:./data/cyberlab.sqlite
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://cyberlabin.com
BACKEND_URL=https://cyberlabin.onrender.com
CORS_ORIGINS=https://cyberlabin.com
VISITOR_HASH_SALT=<long-random-secret>
BCRYPT_COST=12
SEED_USER_PASSWORD=<temporary-seed-password-for-testing-only>
DB_MIGRATION_LOG=1
```

Google OAuth variables are required only when Google login is enabled:

```env
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_CALLBACK_URL=https://cyberlabin.onrender.com/api/auth/google/callback
```

## Required Vercel Settings

Use the frontend root directory:

```text
cyberscout
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Environment variables:

```env
VITE_API_URL=https://cyberlabin.onrender.com
VITE_SITE_URL=https://cyberlabin.com
VITE_CSE_COURSE_FEE=0
```

The SPA rewrite exists in `cyberscout/vercel.json` and should be preserved.

## Known Limitation

Render free instances do not provide reliable persistent disk storage unless a persistent disk is explicitly attached. SQLite data can be lost during rebuilds, redeploys, or instance replacement.

Before real production use, migrate to Supabase Postgres and add deny-by-default RLS policies for:

- users
- courses
- enrollments
- course materials
- leads
- visitor analytics
- dashboards
- audit logs
- AI chat sessions and messages

## Do Not Do This For Real Production

- Do not rely on seeded admin users as permanent production admins.
- Do not keep `password123` or any known seed password in production.
- Do not store protected course documents on Render's ephemeral filesystem.
- Do not treat SQLite on Render free tier as a durable production database.
