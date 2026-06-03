import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { listUsers } from '../store/users.js'
import { getAdminAnalytics, getSalesAnalytics } from '../store/platformStore.js'

const router = Router()

router.use(requireAuth)

router.get('/admin', requireRole('admin', 'super_admin'), (_req, res) => {
  const analytics = getAdminAnalytics()
  res.json({ analytics: { ...analytics, users: listUsers().length } })
})

router.get('/sales', requireRole('admin', 'super_admin', 'marketing', 'sales'), (_req, res) => {
  res.json({ analytics: getSalesAnalytics() })
})

export default router
