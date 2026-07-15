import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getVisitorStats, recordCookieConsent, recordVisitor } from '../db/repositories.js'
import { requireAuth, requireRole } from '../middleware/access.js'
import { visitorCookieOptions } from '../lib/cookies.js'

const router = Router()

router.post('/track', async (req, res) => {
  const visitorId = req.cookies?.cli_visitor_id || `visitor_${randomUUID()}`
  const visitor = await recordVisitor({
    visitorId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    consentAnalytics: Boolean(req.body?.analytics),
    consentMarketing: Boolean(req.body?.marketing),
  })
  res.cookie('cli_visitor_id', visitorId, visitorCookieOptions())
  res.status(201).json({ visitorId: visitor.visitorId })
})

router.post('/consent', async (req, res) => {
  const visitorId = req.cookies?.cli_visitor_id || `visitor_${randomUUID()}`
  await recordCookieConsent({
    visitorId,
    necessary: true,
    analytics: Boolean(req.body?.analytics),
    marketing: Boolean(req.body?.marketing),
  })
  res.cookie('cli_visitor_id', visitorId, visitorCookieOptions())
  res.json({ visitorId, consent: { necessary: true, analytics: Boolean(req.body?.analytics), marketing: Boolean(req.body?.marketing) } })
})

router.get('/stats', requireAuth, requireRole('admin', 'super_admin', 'marketing', 'sales'), async (_req, res) => {
  res.json({ stats: await getVisitorStats() })
})

export default router
