# Razorpay Production Setup

## Account
1. Create or log into Razorpay.
2. Complete KYC and activate live mode.
3. Generate live API keys.

## Payment Links / Orders
For MVP, use Razorpay Payment Links or Orders. Include these notes/metadata:
- `userId`
- `courseId`
- optional `batchId`

The webhook uses these notes to activate enrollment.

## Webhook
Configure endpoint:

```text
https://cyberlabin.com/api/payments/webhooks/razorpay
```

Compatibility alias:

```text
https://cyberlabin.com/api/webhooks/razorpay
```

Set a strong webhook secret and copy it to:

```bash
RAZORPAY_WEBHOOK_SECRET=
```

## Required Events
Enable payment success events required by your Razorpay flow, typically:
- `payment.authorized`
- `payment.captured`
- `payment.failed`

The current starter activates enrollment after a verified payment payload with payment id, user id, and course id.

## Testing Process
1. Test in Razorpay test mode first.
2. Send a test webhook to staging.
3. Confirm `payments.provider_payment_id` is unique.
4. Resend the same webhook and confirm it returns an idempotent response.
5. Confirm `enrollments` has one active row per user/course.
6. Confirm an `audit_logs` row is created.

## Idempotency
The webhook checks `providerPaymentId` and returns an idempotent response if the payment was already verified.
