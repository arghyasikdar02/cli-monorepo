import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { addEnrollment, hasActiveEnrollment, listEnrollmentsByCourse, listEnrollmentsByUser } from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'

const router = Router()

router.use(requireAuth)

router.post('/', requireRole('admin', 'super_admin', 'support'), (req, res) => {
  const error = requireFields(req.body, ['userId', 'courseId'])
  if (error) return res.status(400).json({ error })
  try {
    const enrollment = addEnrollment({ ...req.body, source: 'manual' }, req.user.id)
    res.status(201).json({ enrollment })
  } catch (err) {
    res.status(400).json({ error: err.message || 'Enrollment failed' })
  }
})

router.get('/me', (req, res) => {
  res.json({ enrollments: listEnrollmentsByUser(req.user.id) })
})

router.get('/users/:userId', requireRole('admin', 'super_admin', 'instructor', 'support'), (req, res) => {
  res.json({ enrollments: listEnrollmentsByUser(req.params.userId) })
})

router.get('/courses/:courseId', requireRole('admin', 'super_admin', 'instructor', 'support'), (req, res) => {
  res.json({ enrollments: listEnrollmentsByCourse(req.params.courseId) })
})

router.get('/check/:courseId', (req, res) => {
  const adminLike = (req.user.roles || [req.user.role]).some(role => ['admin', 'super_admin', 'instructor', 'support'].includes(role))
  res.json({ allowed: adminLike || hasActiveEnrollment(req.user.id, req.params.courseId) })
})

export default router
