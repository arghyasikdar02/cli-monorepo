# Cyber Lab IN

## Local Setup

Install and run the frontend:

```bash
cd cyberscout
cp .env.example .env
npm install
npm run dev
```

Install and run the API:

```bash
cd cyberscout-server
cp .env.example .env
npm install
npm run dev
```

## Google OAuth

Create an OAuth 2.0 Client ID in Google Cloud Console.

For local development, add these Google OAuth values:

Authorized JavaScript origins:

```text
http://localhost:5173
http://localhost:3001
```

Authorized redirect URI:

```text
http://localhost:3001/api/auth/google/callback
```

For the current Vercel-to-Render deployment, add:

Authorized JavaScript origins:

```text
https://cyberlabin.com
```

Authorized redirect URI:

```text
https://cyberlabin.com/api/auth/google/callback
```

Do not set `VITE_API_URL` in Vercel. The browser uses the first-party `/api` rewrite configured in `vercel.json`.

Set API env:

```env
JWT_SECRET=use_a_real_random_secret_at_least_32_chars
FRONTEND_URL=https://cyberlabin.com
BACKEND_URL=https://cli-hq1i.onrender.com
CORS_ORIGINS=https://cyberlabin.com,https://www.cyberlabin.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
GOOGLE_CLOUD_PROJECT_ID=cyber-lab-in
GOOGLE_CLOUD_PROJECT_NUMBER=854487433792
GOOGLE_CLIENT_ID=854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<Render secret only>
GOOGLE_REDIRECT_URI=https://cyberlabin.com/api/auth/google/callback
GOOGLE_TOKEN_ENCRYPTION_KEY=<Render secret only>
```

The frontend calls `/api/auth/config`; Google buttons appear only when the backend has real Google credentials.
