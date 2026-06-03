import { Router } from 'express'
import { requireAuth, requireCourseAccess } from '../middleware/access.js'
import { getLeaderboard } from '../store/platformStore.js'

const router = Router()

router.use(requireAuth)

router.get('/course/:courseId', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), (req, res) => {
  res.json({ leaderboard: getLeaderboard(req.params.courseId, req.query.batchId || null) })
})

export default router
