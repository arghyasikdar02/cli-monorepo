import crypto from 'crypto'
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { createPaymentOrder, recordPaymentWebhook } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()

function verifyRazorpaySignature(req) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return true
  const signature = req.headers['x-razorpay-signature']
  if (!signature) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
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
  const payment = createPaymentOrder({ ...req.body, userId: req.user.id }, req.user.id)
  res.status(201).json({ payment, provider: { type: 'razorpay_starter', configured: Boolean(process.env.RAZORPAY_KEY_ID) } })
})

router.get('/', requireAuth, requireRole('admin', 'super_admin', 'finance'), (_req, res) => {
  res.json({ message: 'Payment listing is available in admin analytics for the MVP store.' })
})

router.post('/webhooks/razorpay', handleRazorpayWebhook)

export default router
