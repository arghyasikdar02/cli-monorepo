# Deployment Documentation

The Render procedure is maintained in [`../../RENDER_DEPLOYMENT.md`](../../RENDER_DEPLOYMENT.md).

## Active deployment shape

- Frontend: Vercel, root directory `cyberscout`, build command `npm run build`, output `dist`.
- Backend: Render, root directory `cyberscout-server`, build command `npm ci`, start command `npm run db:setup && npm start`.
- Database: Supabase PostgreSQL, configured only through the backend `DATABASE_URL` secret.

Render runs pending tracked migrations and an idempotent baseline catalogue seed before it starts Express. The seed does not reset or overwrite data, and production never creates development identities. Configure variables from `/cyberscout-server/.env.example` and see [`SUPABASE_POSTGRESQL.md`](SUPABASE_POSTGRESQL.md).

For first-party authentication cookies, leave `VITE_API_URL` unset in Vercel. The Vercel `/api` rewrite forwards requests to Render. Configure Google OAuth with `https://cyberlabin.com/api/auth/google/callback` as the redirect URI.
