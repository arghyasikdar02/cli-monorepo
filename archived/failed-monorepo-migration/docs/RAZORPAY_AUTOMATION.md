# Razorpay Automation

## Current Status
- Starter webhook route: `apps/web/app/api/payments/webhooks/razorpay/route.ts`.
- It verifies `x-razorpay-signature` when `RAZORPAY_WEBHOOK_SECRET` is configured.
- In local mode without a secret, signature verification is relaxed for development.
- It creates or updates a verified payment and activates enrollment idempotently by `providerPaymentId`.

## Required Payment Notes
Razorpay payment links/webhooks must include:
- `userId`
- `courseId`
- optional `batchId`

## Security Rules
- Frontend success is never trusted.
- Enrollment is activated only from verified webhook/manual verification.
- Webhook handler is idempotent.
- Card data is never stored.

## Next Step
Before production, configure Razorpay webhook signing, replay protection, and test events in staging.

