import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireRole } from '../middleware/access.js'
import { listVideosByCourse, registerVideo } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()

router.use(requireAuth)

router.post('/', requireRole('admin', 'super_admin', 'instructor'), (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title', 'provider', 'embedId'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ video: registerVideo(req.body, req.user.id) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'ops', 'support'] }), (req, res) => {
  res.json({ videos: listVideosByCourse(req.params.courseId) })
})

export default router
