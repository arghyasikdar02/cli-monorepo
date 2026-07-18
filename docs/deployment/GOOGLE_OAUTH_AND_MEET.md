# Google OAuth and Google Meet Setup

Cyber Lab IN uses server-side Google OAuth 2.0 authorization-code flow. React never receives Google access tokens, refresh tokens, authorization codes or the OAuth client secret.

## Google Cloud

- Project ID: `cyber-lab-in`
- Project number: `854487433792`
- OAuth client ID: `854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com`
- Production redirect URI: `https://cli-hq1i.onrender.com/api/auth/google/callback`
- Enabled API: Google Meet REST API

After rotating the previously exposed OAuth client secret, enter the new value only in Render.

## Backend Environment

Set these in Render for the backend service:

```text
GOOGLE_CLOUD_PROJECT_ID=cyber-lab-in
GOOGLE_CLOUD_PROJECT_NUMBER=854487433792
GOOGLE_CLIENT_ID=854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<Render secret>
GOOGLE_REDIRECT_URI=https://cli-hq1i.onrender.com/api/auth/google/callback
GOOGLE_TOKEN_ENCRYPTION_KEY=<openssl rand -hex 32>
FRONTEND_URL=https://cyberlabin.com
BACKEND_URL=https://cli-hq1i.onrender.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

Do not set Google secrets in Vercel or any `VITE_` variable.

Set this non-secret in Vercel while the OAuth callback is the Render hostname:

```text
VITE_API_URL=https://cli-hq1i.onrender.com
```

This lets the browser send the Render host-only session cookie back to the backend after Google redirects to Render.

## Flows

`GET /api/auth/google` starts learner Google sign-in with identity scopes only: `openid`, `email`, `profile`.

`GET /api/integrations/google/connect` starts instructor/admin Google Meet authorization with incremental Meet scope: `https://www.googleapis.com/auth/meetings.space.created`.

Both flows return through `GET /api/auth/google/callback`. A signed short-lived OAuth state distinguishes login from Meet authorization.

## Meet Creation

`POST /api/live-classes/:id/google-meet` is server-side only. It requires an instructor/admin session, checks the connected Google account, refreshes tokens if needed, calls `POST https://meet.googleapis.com/v2/spaces`, and stores safe Meet metadata on the live class.

Students open the returned Meet URL in a new tab. Cyber Lab IN does not iframe Google Meet.

## Security Notes

- Google access and refresh tokens are encrypted before storage in `google_connections`.
- The encryption key must be stable across deployments.
- Secrets, tokens, authorization codes and ID tokens are never logged or returned in API responses.
- Existing email/password login remains available.
- Existing accounts are not automatically linked by matching email during Google sign-in. Users must authenticate first before connecting Google.

## Future API Domain

The current callback uses Render because that is what Google Cloud is configured for. This requires cross-site `SameSite=None; Secure` cookies and can still be affected by strict third-party-cookie browser settings. The recommended final setup is `https://api.cyberlabin.com`; add that URI in Google Cloud before switching `GOOGLE_REDIRECT_URI` and then move cookies back to `SameSite=Lax`.
