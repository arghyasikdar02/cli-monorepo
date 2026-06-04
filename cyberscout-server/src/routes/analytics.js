import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { getAdminAnalytics, getSalesDashboard } from '../db/repositories.js'

const router = Router()

router.use(requireAuth)

router.get('/admin', requireRole('admin', 'super_admin'), (_req, res) => {
  res.json({ analytics: getAdminAnalytics() })
})

router.get('/sales', requireRole('admin', 'super_admin', 'marketing', 'sales'), (_req, res) => {
  res.json({ analytics: getSalesDashboard().analytics })
})

export default router
