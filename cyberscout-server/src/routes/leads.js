import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { addLeadNote, createLead, listLeads, updateLead } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const crmRoles = ['admin', 'super_admin', 'marketing', 'sales', 'support']

router.post('/', (req, res) => {
  const error = requireFields(req.body, ['email'])
  if (error) return res.status(400).json({ error })
  const lead = createLead(req.body)
  res.status(201).json({ lead })
})

router.use(requireAuth)
router.use(requireRole(...crmRoles))

router.get('/', (req, res) => {
  res.json({ leads: listLeads({ courseId: req.query.courseId, ownerId: req.query.ownerId, stage: req.query.stage }) })
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

export default router
