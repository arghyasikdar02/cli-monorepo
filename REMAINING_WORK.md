# Remaining Work

Only items blocked by missing production access, approved facts or human assets are listed here.

## Supabase production credential and data cutover

**Blocked by:** the real Supabase `DATABASE_URL`, a verified backup and deployment access.

The code now uses Supabase PostgreSQL exclusively and the PostgreSQL integration suite passes locally. Before the live cutover, back up the current Supabase project, inspect its existing table shapes, run `npm run db:migrate --prefix cyberscout-server`, apply `supabase/rls-policies.sql`, run the idempotent catalogue seed once if needed, and verify live reads/writes. The actual Supabase project could not be queried because no production connection string is stored in the repository.

## Google OAuth production activation

**Blocked by:** Google Cloud console access and valid client credentials.

Set the authorized origin to `https://cyberlabin.com`, set the callback to `https://cyberlabin.com/api/auth/google/callback`, add real backend environment values, and test state, cookie and redirect behavior in production. Rotate any credential that has ever appeared in chat or logs.

## Password recovery delivery

**Blocked by:** an approved transactional email provider, sender domain and recovery policy.

Authenticated users can change or set a password securely. Account recovery by email is intentionally not exposed without a real delivery channel. Configure a transactional provider, add single-use hashed recovery tokens with a short expiry, rate-limit requests and completions, avoid account-enumeration responses, and test token invalidation before publishing a “Forgot password” link.

## Paid enrolment activation

**Blocked by:** Verified course price, Razorpay production keys, webhook secret and commercial approval.

Publish the fee in the course record, configure all three Razorpay variables, register `https://cyberlabin.com/api/webhooks/razorpay`, run test and live payment captures, and reconcile payment, audit and enrolment records before enabling the CTA.

## Protected document rendering

**Blocked by:** Approved private course PDFs and production object storage.

The API stores guarded document metadata and access events and never returns a storage key. Add private Supabase Storage, server-side page rendering, signed short-lived page delivery and visual watermarking after approved PDFs are supplied.

## Product proof assets

**Blocked by:** Approved screenshots and photographs.

Add sharp, privacy-reviewed lab and lesson screenshots when those interfaces are ready. The public homepage currently uses an honest career roadmap instead of a fabricated product interface. Add an approved instructor photograph to the homepage and profile page.

## Verified commercial and legal content

**Blocked by:** Business approval.

Publish course schedule, language, fee, refund terms, legal entity details, support address and accessibility contact after verification. Current pages deliberately avoid inventing these facts.

## Production CDN performance validation

**Blocked by:** a deployed production build and stable backend/database.

The local production bundle scores 96 performance, 100 accessibility, 100 best practices and 100 SEO in Lighthouse. Repeat the audit against the final Vercel/Render/Supabase deployment from representative Indian mobile connections and use real-user Web Vitals to validate CDN, cold-start and database latency.
