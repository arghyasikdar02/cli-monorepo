import { Router } from 'express'
import { requireAuth, requireCourseAccess } from '../middleware/access.js'
import { getCourseLeaderboard } from '../db/repositories.js'

const router = Router()

router.use(requireAuth)

router.get('/course/:courseId', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), async (req, res) => {
  res.json({ leaderboard: await getCourseLeaderboard(req.params.courseId) })
})

export default router
