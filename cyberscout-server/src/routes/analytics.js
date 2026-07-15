import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { getAdminAnalytics, getSalesDashboard, recordAnalyticsEvent } from '../db/repositories.js'

const router = Router()

const allowedEvents = new Set([
  'hero_primary_cta',
  'hero_secondary_cta',
  'course_card_click',
  'curriculum_expansion',
  'syllabus_download',
  'sample_lab_launch',
  'pricing_view',
  'lead_form_start',
  'lead_form_completion',
  'login_start',
  'enrollment_start',
  'enrollment_completion',
])

function safeProperties(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  return Object.fromEntries(Object.entries(input).slice(0, 20).flatMap(([key, value]) => {
    if (!/^[a-zA-Z0-9_]{1,50}$/.test(key)) return []
    if (!['string', 'number', 'boolean'].includes(typeof value)) return []
    return [[key, typeof value === 'string' ? value.slice(0, 200) : value]]
  }))
}

router.post('/events', (req, res) => {
  const event = String(req.body?.event || '')
  if (!allowedEvents.has(event)) return res.status(400).json({ error: 'Unsupported analytics event' })
  const result = recordAnalyticsEvent({
    event,
    visitorId: req.cookies?.cli_visitor_id || null,
    path: req.body?.path,
    properties: safeProperties(req.body?.properties),
  })
  res.status(202).json({ accepted: true, eventId: result.id })
})

router.use(requireAuth)

router.get('/admin', requireRole('admin', 'super_admin'), (_req, res) => {
  res.json({ analytics: getAdminAnalytics() })
})

router.get('/sales', requireRole('admin', 'super_admin', 'marketing', 'sales'), (_req, res) => {
  res.json({ analytics: getSalesDashboard().analytics })
})

export default router
