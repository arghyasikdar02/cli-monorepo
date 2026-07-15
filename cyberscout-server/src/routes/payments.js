import crypto from 'crypto'
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { createPaymentOrder, getCourseById, recordPaymentWebhook } from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'

const router = Router()

function verifyRazorpaySignature(req) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  const signature = req.headers['x-razorpay-signature']
  if (!signature) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody || Buffer.from(JSON.stringify(req.body)))
    .digest('hex')
  if (Buffer.byteLength(expected) !== Buffer.byteLength(String(signature))) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)))
}

export function handleRazorpayWebhook(req, res) {
  if (!verifyRazorpaySignature(req)) return res.status(400).json({ error: 'Invalid Razorpay signature' })
  const eventId = req.headers['x-razorpay-event-id'] || req.body?.id || req.body?.event_id || `evt_${Date.now()}`
  const result = recordPaymentWebhook(String(eventId), req.body)
  return res.json({ received: true, ...result })
}

router.post('/orders', requireAuth, (req, res) => {
  const error = requireFields(req.body, ['courseId'])
  if (error) return res.status(400).json({ error })
  const course = getCourseById(req.body.courseId)
  if (!course || course.status !== 'published') return res.status(404).json({ error: 'Published course not found' })
  if (Number(course.price || 0) <= 0) return res.status(409).json({ error: 'Online payment is not available until a verified course fee is configured.' })
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return res.status(503).json({ error: 'Online payment is not configured.' })

  const amount = Math.round(Number(course.price) * 100)
  const receipt = `cli_${Date.now()}_${req.user.id.slice(-8)}`.slice(0, 40)
  fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, currency: 'INR', receipt, notes: { userId: req.user.id, courseId: course.id } }),
  })
    .then(async response => {
      const body = await response.json().catch(() => ({}))
      if (!response.ok || !body.id) throw new Error('Razorpay order creation failed')
      const payment = createPaymentOrder({ userId: req.user.id, courseId: course.id, amount: body.amount, currency: body.currency, providerOrderId: body.id, metadata: { receipt } }, req.user.id)
      res.status(201).json({ payment, provider: { type: 'razorpay', keyId } })
    })
    .catch(() => res.status(502).json({ error: 'The payment provider is temporarily unavailable.' }))
})

router.get('/', requireAuth, requireRole('admin', 'super_admin', 'finance'), (_req, res) => {
  res.json({ message: 'Payment listing is available in admin analytics for the MVP store.' })
})

router.post('/webhooks/razorpay', handleRazorpayWebhook)

export default router
