# Google OAuth and Google Meet Setup

Cyber Lab IN uses server-side Google OAuth 2.0 authorization-code flow. React never receives Google access tokens, refresh tokens, authorization codes or the OAuth client secret.

## Google Cloud

- Project ID: `cyber-lab-in`
- Project number: `854487433792`
- OAuth client ID: `854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com`
- Production redirect URI: `https://cyberlabin.com/api/auth/google/callback`
- Enabled API: Google Meet REST API

Keep the OAuth client secret only in the existing protected Render environment variable.

## Backend Environment

Set these in Render for the backend service:

```text
GOOGLE_CLOUD_PROJECT_ID=cyber-lab-in
GOOGLE_CLOUD_PROJECT_NUMBER=854487433792
GOOGLE_CLIENT_ID=854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<Render secret>
GOOGLE_REDIRECT_URI=https://cyberlabin.com/api/auth/google/callback
GOOGLE_TOKEN_ENCRYPTION_KEY=<openssl rand -hex 32>
FRONTEND_URL=https://cyberlabin.com
BACKEND_URL=https://cyberlabin.onrender.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

Do not set Google secrets in Vercel or any `VITE_` variable.

Leave `VITE_API_URL` unset in Vercel. The browser uses `https://cyberlabin.com/api/*`, and the Vercel rewrite forwards API requests to Render without exposing the Render origin in normal browser traffic.

## Flows

`GET /api/auth/google` starts learner Google sign-in with identity scopes only: `openid`, `email`, `profile`.

`GET /api/integrations/google/connect` starts instructor/admin Google Meet authorization with incremental Meet scope: `https://www.googleapis.com/auth/meetings.space.created`.

Both flows return through `GET /api/auth/google/callback`. A signed short-lived OAuth state distinguishes login from Meet authorization, while the PKCE verifier remains in a separate short-lived HttpOnly cookie.

## Meet Creation

`POST /api/live-classes/:id/google-meet` is server-side only. It requires an instructor/admin session, checks the connected Google account, refreshes tokens if needed, calls `POST https://meet.googleapis.com/v2/spaces`, and stores safe Meet metadata on the live class.

Students open the returned Meet URL in a new tab. Cyber Lab IN does not iframe Google Meet.

## Security Notes

- Google access and refresh tokens are encrypted before storage in `google_connections`.
- The encryption key must be stable across deployments.
- Secrets, tokens, authorization codes and ID tokens are never logged or returned in API responses.
- Existing email/password login remains available.
- Existing accounts are not automatically linked by matching email during Google sign-in. Users must authenticate first before connecting Google.

## Production Proxy

The Google callback and normal API requests stay on `cyberlabin.com`. Vercel proxies them to Render, allowing secure host-only `SameSite=Lax` cookies without a separate API subdomain.
