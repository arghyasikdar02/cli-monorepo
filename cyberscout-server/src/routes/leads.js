import { Router } from 'express'
import { createHash } from 'node:crypto'
import { requireAuth, requireRole } from '../middleware/access.js'
import { addLeadNote, createFollowUp, createLead, listFollowUps, listLeads, updateLead } from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'
import { leadLimiter } from '../middleware/security.js'

const router = Router()
const crmRoles = ['admin', 'super_admin', 'marketing', 'sales', 'support']

function ipHash(value) {
  return createHash('sha256')
    .update(`${process.env.VISITOR_HASH_SALT || 'local-development-salt'}:${value || ''}`)
    .digest('hex')
}

router.post('/', leadLimiter, (req, res) => {
  if (req.body?.website) return res.status(202).json({ accepted: true })
  const startedAt = Number(req.body?.startedAt || 0)
  if (startedAt && Date.now() - startedAt < 900) {
    return res.status(400).json({ error: 'Please review the form before sending it.' })
  }
  const error = requireFields(req.body, ['name', 'phone', 'email', 'message'])
  if (error) return res.status(400).json({ error })
  try {
    const lead = createLead({
      ...req.body,
      visitorId: req.cookies?.cli_visitor_id || req.body.visitorId,
      ipAddress: ipHash(req.ip),
      userAgent: req.headers['user-agent'],
    })
    res.status(201).json({ lead })
  } catch (err) {
    res.status(400).json({ error: err.message || 'Lead capture failed' })
  }
})

router.use(requireAuth)
router.use(requireRole(...crmRoles))

router.get('/', (req, res) => {
  res.json({
    leads: listLeads({
      courseId: req.query.courseId,
      ownerId: req.query.ownerId,
      stage: req.query.stage,
      status: req.query.status,
      source: req.query.source,
      search: req.query.search,
      name: req.query.name,
      phone: req.query.phone,
      email: req.query.email,
    }),
  })
})

router.patch('/:leadId', (req, res) => {
  const lead = updateLead(req.params.leadId, req.body, req.user.id)
  if (!lead) return res.status(404).json({ error: 'Lead not found' })
  res.json({ lead })
})

router.post('/:leadId/notes', (req, res) => {
  const error = requireFields(req.body, ['note'])
  if (error) return res.status(400).json({ error })
  const note = addLeadNote(req.params.leadId, req.user.id, req.body.note)
  if (!note) return res.status(404).json({ error: 'Lead not found' })
  res.status(201).json({ note })
})

router.get('/follow-ups/list', (req, res) => {
  res.json({ followUps: listFollowUps({ status: req.query.status }) })
})

router.post('/:leadId/follow-ups', (req, res) => {
  const error = requireFields(req.body, ['dueAt'])
  if (error) return res.status(400).json({ error })
  const followUp = createFollowUp(req.params.leadId, req.user.id, req.body.dueAt, req.body.note || '')
  if (!followUp) return res.status(404).json({ error: 'Lead not found' })
  res.status(201).json({ followUp })
})

export default router
