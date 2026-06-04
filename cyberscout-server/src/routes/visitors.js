import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getVisitorStats, recordCookieConsent, recordVisitor } from '../db/repositories.js'
import { requireAuth, requireRole } from '../middleware/access.js'

const router = Router()
const isProduction = process.env.NODE_ENV === 'production'

function visitorCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 365 * 24 * 60 * 60 * 1000,
  }
}

router.post('/track', (req, res) => {
  const visitorId = req.cookies?.cli_visitor_id || `visitor_${randomUUID()}`
  const visitor = recordVisitor({
    visitorId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    consentAnalytics: Boolean(req.body?.analytics),
    consentMarketing: Boolean(req.body?.marketing),
  })
  res.cookie('cli_visitor_id', visitorId, visitorCookieOptions())
  res.status(201).json({ visitorId: visitor.visitorId })
})

router.post('/consent', (req, res) => {
  const visitorId = req.cookies?.cli_visitor_id || `visitor_${randomUUID()}`
  recordCookieConsent({
    visitorId,
    necessary: true,
    analytics: Boolean(req.body?.analytics),
    marketing: Boolean(req.body?.marketing),
  })
  res.cookie('cli_visitor_id', visitorId, visitorCookieOptions())
  res.json({ visitorId, consent: { necessary: true, analytics: Boolean(req.body?.analytics), marketing: Boolean(req.body?.marketing) } })
})

router.get('/stats', requireAuth, requireRole('admin', 'super_admin', 'marketing', 'sales'), (_req, res) => {
  res.json({ stats: getVisitorStats() })
})

export default router
