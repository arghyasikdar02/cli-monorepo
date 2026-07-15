import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import {
  archiveCourse,
  createCourse,
  enrollUser,
  getCourseById,
  getCourseForUser,
  getPublicCourse,
  getPublicCourseBySlug,
  listCourseMaterialsForUser,
  listEnrolledCourses,
  listPublicCourses,
  publishCourse,
  updateCourse,
} from '../db/repositories.js'
import { pick, requireFields } from '../lib/validation.js'

const router = Router()

router.get('/public', async (_req, res) => {
  res.json({ courses: await listPublicCourses() })
})

router.get('/public/slug/:categorySlug/:courseSlug', async (req, res) => {
  const course = await getPublicCourseBySlug(req.params.categorySlug, req.params.courseSlug)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.get('/public/:courseId', async (req, res) => {
  const course = await getPublicCourse(req.params.courseId)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.get('/', async (_req, res) => {
  res.json({ courses: await listPublicCourses() })
})

router.get('/enrolled', requireAuth, async (req, res) => {
  res.json({ courses: await listEnrolledCourses(req.user.id) })
})

router.get('/my', requireAuth, async (req, res) => {
  res.json({ courses: await listEnrolledCourses(req.user.id) })
})

router.post('/', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  const error = requireFields(req.body, ['title'])
  if (error) return res.status(400).json({ error })
  const course = await createCourse(req.body, req.user.id)
  res.status(201).json({ course })
})

router.get('/:courseId', requireAuth, async (req, res) => {
  const course = await getCourseForUser(req.params.courseId, req.user)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.post('/:courseId/enroll', requireAuth, async (req, res) => {
  try {
    const enrollment = await enrollUser(req.user.id, req.params.courseId, 'self_service')
    res.status(201).json({ enrollment, courses: await listEnrolledCourses(req.user.id) })
  } catch (error) {
    const message = error.message || 'Enrollment failed'
    res.status(message.includes('not found') ? 404 : 400).json({ error: message })
  }
})

router.get('/:courseId/materials', requireAuth, async (req, res) => {
  const { allowed, materials } = await listCourseMaterialsForUser(req.user, req.params.courseId, {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  })
  if (!allowed) {
    return res.status(403).json({
      error: 'Active enrollment required for private course materials',
      publicMaterials: materials,
    })
  }
  res.json({ materials })
})

router.patch('/:courseId', requireAuth, requireRole('admin', 'super_admin', 'instructor'), async (req, res) => {
  const updates = pick(req.body, ['title', 'description', 'status', 'level', 'duration', 'price', 'instructorId', 'tags'])
  const course = await updateCourse(req.params.courseId, updates, req.user.id)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.patch('/:courseId/publish', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  const course = await publishCourse(req.params.courseId, req.user.id)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.patch('/:courseId/archive', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  const course = await archiveCourse(req.params.courseId, req.user.id)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

export default router
