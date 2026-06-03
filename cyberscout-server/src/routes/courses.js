import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireRole } from '../middleware/access.js'
import { archiveCourse, createCourse, getCourseById, listEnrolledCourses, listPublicCourses, publishCourse, updateCourse } from '../store/platformStore.js'
import { pick, requireFields } from '../lib/validation.js'

const router = Router()

router.get('/public', (_req, res) => {
  res.json({ courses: listPublicCourses() })
})

router.get('/public/:courseId', (req, res) => {
  const course = getCourseById(req.params.courseId)
  if (!course || course.status !== 'published') return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.get('/enrolled', requireAuth, (req, res) => {
  res.json({ courses: listEnrolledCourses(req.user.id) })
})

router.post('/', requireAuth, requireRole('admin', 'super_admin'), (req, res) => {
  const error = requireFields(req.body, ['title'])
  if (error) return res.status(400).json({ error })
  const course = createCourse(req.body, req.user.id)
  res.status(201).json({ course })
})

router.get('/:courseId', requireAuth, requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'marketing', 'sales', 'ops', 'lab_creator', 'support'] }), (req, res) => {
  res.json({ course: getCourseById(req.params.courseId) })
})

router.patch('/:courseId', requireAuth, requireRole('admin', 'super_admin', 'instructor'), (req, res) => {
  const updates = pick(req.body, ['title', 'description', 'status', 'level', 'duration', 'price', 'instructorId', 'tags'])
  const course = updateCourse(req.params.courseId, updates, req.user.id)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.patch('/:courseId/publish', requireAuth, requireRole('admin', 'super_admin'), (req, res) => {
  const course = publishCourse(req.params.courseId, req.user.id)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.patch('/:courseId/archive', requireAuth, requireRole('admin', 'super_admin'), (req, res) => {
  const course = archiveCourse(req.params.courseId, req.user.id)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

export default router
