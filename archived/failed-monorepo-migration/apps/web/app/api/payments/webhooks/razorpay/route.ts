import crypto from 'node:crypto';
import { prisma } from '@cyberlabin/database';
import { apiError, handleError, ok } from '../../../_lib/http';
import type { NextRequest } from 'next/server';

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return process.env.APP_ENV === 'local';
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!verifySignature(rawBody, req.headers.get('x-razorpay-signature'))) {
      return apiError('UNAUTHENTICATED', 'Invalid Razorpay webhook signature', 401);
    }

    const event = JSON.parse(rawBody);
    const paymentEntity = event?.payload?.payment?.entity;
    const providerPaymentId = paymentEntity?.id || event?.payment_id;
    const notes = paymentEntity?.notes || event?.notes || {};
    const userId = notes.userId || notes.user_id;
    const courseId = notes.courseId || notes.course_id;
    const batchId = notes.batchId || notes.batch_id || null;

    if (!providerPaymentId || !userId || !courseId) {
      return apiError('VALIDATION_ERROR', 'Webhook requires payment id, userId, and courseId notes', 400);
    }

    const existing = await prisma.payment.findUnique({ where: { providerPaymentId } });
    if (existing?.status === 'verified') {
      return ok({ received: true, idempotent: true });
    }

    const payment = existing
      ? await prisma.payment.update({
          where: { id: existing.id },
          data: { status: 'verified', rawPayload: event },
        })
      : await prisma.payment.create({
          data: {
            userId,
            courseId,
            providerPaymentId,
            amountCents: Number(paymentEntity?.amount || event?.amount || 0),
            currency: paymentEntity?.currency || event?.currency || 'INR',
            provider: 'razorpay',
            status: 'verified',
            rawPayload: event,
          },
        });

    const activeEnrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId, status: 'ACTIVE', deletedAt: null },
    });

    const enrollment =
      activeEnrollment ||
      (await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          batchId,
          status: 'ACTIVE',
          enrolledAt: new Date(),
        },
      }));

    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        courseId,
        entityType: 'payment',
        entityId: payment.id,
        action: 'payment_webhook_verified_enrollment_activated',
        metadata: { providerPaymentId, enrollmentId: enrollment.id },
      },
    });

    return ok({ received: true, paymentId: payment.id, enrollmentId: enrollment.id });
  } catch (error) {
    return handleError(error);
  }
}

