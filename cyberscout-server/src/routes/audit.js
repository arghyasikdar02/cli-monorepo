import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { getAuditLogs } from '../store/platformStore.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole('admin', 'super_admin', 'support', 'ops'))

router.get('/', (req, res) => {
  res.json({ auditLogs: getAuditLogs({ actorId: req.query.actorId, action: req.query.action }) })
})

export default router
