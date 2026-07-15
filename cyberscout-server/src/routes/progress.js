import { Router } from 'express'
import { requireAuth, requireCourseAccess } from '../middleware/access.js'
import { getCourseProgress, updateCourseProgress } from '../db/repositories.js'
import { pick } from '../lib/validation.js'

const router = Router()

router.use(requireAuth)

router.get('/course/:courseId', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'support'] }), async (req, res) => {
  const userId = req.query.userId || req.user.id
  res.json({ progress: await getCourseProgress(userId, req.params.courseId) })
})

router.patch('/course/:courseId', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'support'] }), async (req, res) => {
  const updates = pick(req.body, ['lessonProgress', 'videoProgress', 'documentProgress', 'labProgress', 'quizProgress'])
  res.json({ progress: await updateCourseProgress(req.user.id, req.params.courseId, updates) })
})

export default router
