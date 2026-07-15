# Security Notes

## Sessions and authentication

- The backend signs JWTs with explicit algorithm, issuer, audience and expiry and stores them only in the HTTP-only `cli_session` cookie.
- Production cookies use `Secure`, configurable `SameSite` and a root path. The recommended first-party Vercel API proxy permits `SameSite=Lax`.
- The frontend retrieves the user from `/api/auth/me`; it does not persist session tokens in browser storage.
- Passwords use bcrypt with configurable cost. Registration, password change and CLI user creation share the same 12-to-128-character passphrase policy.
- Password change increments `token_version` before issuing a new cookie, invalidating older sessions.
- Google OAuth uses a signed, short-lived state value bound to an HTTP-only cookie. Callback redirects never contain the session token.
- Redirect destinations accept only safe relative paths, preventing open redirects.

## CSRF and request controls

- Cookie-authenticated unsafe methods require the double-submit `cli_csrf` token and an allowed Origin when supplied.
- Razorpay webhooks bypass CSRF but require the provider HMAC signature.
- JSON bodies are capped at 256 KB by default.
- Login, registration, leads, tutor requests and the general API have separate IP-based rate limits.
- Lead forms add server validation, a honeypot and a minimum completion interval.

## Authorization and isolation

- Sensitive routes require authentication and role checks.
- Course resources fail closed unless the learner has active enrolment or an explicitly allowed staff role.
- Instructor management requires assignment to the course.
- Batch-scoped live classes require matching enrolment batch and an active join window.
- Videos, documents, labs, quizzes, assignments, tutor sessions, progress, leaderboards and certificates are course-scoped.
- Protected document responses exclude storage keys and write access events.
- Lab flags are stored as salted SHA-256 hashes, not plaintext.

## Browser and API headers

- Express uses Helmet with CSP, HSTS in production, frame denial, no-sniff, referrer policy and a restrictive permissions policy.
- Vercel applies equivalent public-site headers and noindex headers to account/dashboard routes.
- CORS uses an explicit origin allowlist and credentials. Local preview origins are added only outside production.
- Public course/blog reads receive short cache headers; private and dashboard responses use `no-store`.

## Secrets and production configuration

- `.env`, SQLite files, logs and build output are ignored.
- Development seed identities are hard-disabled in production. Startup may create public catalogue records, but the first administrator must be bootstrapped explicitly through protected `cliadm` access.
- Production startup rejects placeholder or short JWT, visitor-hash and lab-flag secrets.
- OAuth credentials must be configured as a complete non-placeholder pair.
- Razorpay credentials must be configured as a complete non-placeholder set.
- Rotate any secret previously shared in a chat, screenshot, shell history or deployment log.

## Audit and operations

- Authentication, admin changes, course mutations, role changes, payments, protected resources and CLI mutations write audit records.
- `cliadm` mutations require an admin token; destructive commands require `--dry-run` or `--confirm YES`.
- Health, request ID and safe error responses support incident diagnosis without exposing stack traces in production.

## Production limitation

SQLite on Render free storage is not durable. This is the most important unresolved production risk. Use the current deployment only for testing until the Postgres/Supabase adapter migration and isolation tests are complete.
