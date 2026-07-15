# Remaining Work

Only items blocked by missing production access, approved facts or human assets are listed here.

## Durable production database

**Blocked by:** Supabase project access and a deployment window.

The active repository adapter uses SQLite. Render free storage is ephemeral. Before accepting paid enrolments, port the repository layer to Postgres, apply the reviewed `/supabase/schema.sql` and RLS policies, migrate data, run the isolation suite against Postgres, and switch `DATABASE_URL` only after a verified backup and rollback plan.

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

Replace the CSS-built read-only product proof with sharp, privacy-reviewed screenshots when the live lab and lesson interfaces are ready. Add an approved instructor photograph to the homepage and profile page.

## Verified commercial and legal content

**Blocked by:** Business approval.

Publish course schedule, language, fee, refund terms, legal entity details, support address and accessibility contact after verification. Current pages deliberately avoid inventing these facts.

## Production CDN performance validation

**Blocked by:** a deployed production build and stable backend/database.

The local production bundle scores 99 performance, 100 accessibility, 100 best practices and 100 SEO in Lighthouse. Repeat the audit against the final Vercel/Render/Supabase deployment from representative Indian mobile connections and use real-user Web Vitals to validate CDN, cold-start and database latency.
