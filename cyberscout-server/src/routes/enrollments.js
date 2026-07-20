import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { addEnrollment, hasActiveEnrollment, listEnrollmentsByCourse, listEnrollmentsByUser, removeEnrollment } from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'

const router = Router()

router.use(requireAuth)

router.post('/', requireRole('admin', 'super_admin', 'support'), async (req, res) => {
  const error = requireFields(req.body, ['userId', 'courseId'])
  if (error) return res.status(400).json({ error })
  try {
    const enrollment = await addEnrollment({ ...req.body, source: 'manual' }, req.user.id)
    res.status(201).json({ enrollment })
  } catch (err) {
    res.status(400).json({ error: err.message || 'Enrollment failed' })
  }
})

router.get('/me', async (req, res) => {
  res.json({ enrollments: await listEnrollmentsByUser(req.user.id) })
})

router.get('/users/:userId', requireRole('admin', 'super_admin', 'instructor', 'support'), async (req, res) => {
  res.json({ enrollments: await listEnrollmentsByUser(req.params.userId) })
})

router.get('/courses/:courseId', requireRole('admin', 'super_admin', 'instructor', 'support'), async (req, res) => {
  res.json({ enrollments: await listEnrollmentsByCourse(req.params.courseId) })
})

router.get('/check/:courseId', async (req, res) => {
  const adminLike = (req.user.roles || [req.user.role]).some(role => ['admin', 'super_admin', 'instructor', 'support'].includes(role))
  res.json({ allowed: adminLike || await hasActiveEnrollment(req.user.id, req.params.courseId) })
})

router.delete('/:enrollmentId', requireRole('admin', 'super_admin', 'support'), async (req, res) => {
  const enrollment = await removeEnrollment(req.params.enrollmentId, req.user.id)
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' })
  res.json({ enrollment })
})

export default router
