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

For deployment, add your real domains:

Authorized JavaScript origins:

```text
https://your-frontend-domain.com
https://your-api-domain.com
```

Authorized redirect URI:

```text
https://your-api-domain.com/api/auth/google/callback
```

Set frontend env:

```env
VITE_API_URL=https://your-api-domain.com
```

Set API env:

```env
JWT_SECRET=use_a_real_random_secret_at_least_32_chars
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-api-domain.com
CORS_ORIGINS=https://your-frontend-domain.com
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

If your hosting provider exposes a different public callback URL than `BACKEND_URL`, set:

```env
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback
```

The frontend calls `/api/auth/config`; Google buttons appear only when the backend has real Google credentials.
