import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { getAuditLogs } from '../db/repositories.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole('admin', 'super_admin', 'support', 'ops'))

router.get('/', (req, res) => {
  const logs = getAuditLogs(Number(req.query.limit || 50))
    .filter(log => (!req.query.actorId || log.actorId === req.query.actorId) && (!req.query.action || String(log.action).includes(req.query.action)))
  res.json({ auditLogs: logs })
})

export default router
