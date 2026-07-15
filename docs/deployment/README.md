# Deployment Documentation

The current Render backend procedure is maintained in [`../../RENDER_DEPLOYMENT.md`](../../RENDER_DEPLOYMENT.md).

## Active deployment shape

- Frontend: Vercel, root directory `cyberscout`, build command `npm run build`, output `dist`.
- Backend: Render, root directory `cyberscout-server`, build command `npm ci`, start command `npm start`.
- Interim database: SQLite. Render free storage is ephemeral and is suitable only for deployment testing.
- Production database target: Supabase Postgres after the repository adapter is migrated and tested.

The backend runs pending migrations and idempotent baseline seeding before it starts listening. Configure all variables from `/cyberscout-server/.env.example`; do not copy placeholder secrets.

For first-party authentication cookies, leave `VITE_API_URL` unset in Vercel. The Vercel `/api` rewrite forwards requests to Render. Configure Google OAuth with `https://cyberlabin.com/api/auth/google/callback` as the redirect URI.
