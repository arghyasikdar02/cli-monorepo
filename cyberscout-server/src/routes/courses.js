import { Router } from 'express'
import { requireAuth, requireCourseManager, requireRole } from '../middleware/access.js'
import {
  archiveCourse,
  COURSE_STATUSES,
  createCourse,
  createCourseMaterial,
  createCourseModule,
  createLesson,
  enrollUser,
  getCourseAdminDetail,
  getCourseById,
  getCourseForUser,
  getPublicCourse,
  getPublicCourseBySlug,
  listCourseMaterialsForUser,
  listEnrolledCourses,
  listCourses,
  listPublicCourses,
  publishCourse,
  reorderCourseModules,
  reorderLessons,
  restoreCourse,
  unpublishCourse,
  updateCourse,
  updateCourseMaterial,
  updateCourseModule,
  updateLesson,
  userHasRole,
} from '../db/repositories.js'
import { pick, requireFields } from '../lib/validation.js'

const router = Router()
const adminRoles = ['admin', 'super_admin']

function operationError(res, error, fallback) {
  const message = error.message || fallback
  const status = /not found/i.test(message) ? 404 : /duplicate|unique/i.test(message) ? 409 : 400
  return res.status(status).json({ error: status === 409 ? 'A record with that identifier already exists' : message })
}

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

router.get('/admin', requireAuth, requireRole(...adminRoles), async (_req, res) => {
  res.json({ courses: await listCourses(), statuses: COURSE_STATUSES })
})

router.get('/admin/:courseId', requireAuth, requireRole(...adminRoles), async (req, res) => {
  const course = await getCourseAdminDetail(req.params.courseId)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.post('/', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  const error = requireFields(req.body, ['title'])
  if (error) return res.status(400).json({ error })
  try {
    const course = await createCourse(req.body, req.user.id)
    res.status(201).json({ course })
  } catch (err) {
    operationError(res, err, 'Course could not be created')
  }
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

router.patch('/:courseId', requireAuth, requireRole('admin', 'super_admin', 'instructor'), requireCourseManager, async (req, res) => {
  const administrator = userHasRole(req.user, adminRoles)
  const updates = pick(req.body, [
    'slug', 'title', 'description', 'overview', 'category', 'categorySlug', 'status', 'level', 'duration', 'price',
    'mode', 'credential', 'prerequisites', 'brochureUrl', 'instructorId', 'instructorName', 'instructorTitle',
    'audience', 'outcomes', 'labs',
  ].filter(field => administrator || !['status', 'instructorId', 'instructorName', 'instructorTitle', 'price'].includes(field)))
  try {
    const course = await updateCourse(req.params.courseId, updates, req.user.id)
    if (!course) return res.status(404).json({ error: 'Course not found' })
    res.json({ course })
  } catch (err) {
    operationError(res, err, 'Course could not be updated')
  }
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

router.patch('/:courseId/unpublish', requireAuth, requireRole(...adminRoles), async (req, res) => {
  const course = await unpublishCourse(req.params.courseId, req.user.id)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.patch('/:courseId/restore', requireAuth, requireRole(...adminRoles), async (req, res) => {
  const course = await restoreCourse(req.params.courseId, req.user.id)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({ course })
})

router.post('/:courseId/modules', requireAuth, requireRole(...adminRoles), async (req, res) => {
  try {
    const module = await createCourseModule(req.params.courseId, req.body, req.user.id)
    res.status(201).json({ module })
  } catch (err) {
    operationError(res, err, 'Module could not be created')
  }
})

router.patch('/:courseId/modules/:moduleId', requireAuth, requireRole(...adminRoles), async (req, res) => {
  try {
    const module = await updateCourseModule(req.params.courseId, req.params.moduleId, pick(req.body, ['title', 'description']), req.user.id)
    if (!module) return res.status(404).json({ error: 'Course module not found' })
    res.json({ module })
  } catch (err) {
    operationError(res, err, 'Module could not be updated')
  }
})

router.post('/:courseId/modules/reorder', requireAuth, requireRole(...adminRoles), async (req, res) => {
  try {
    const moduleIds = await reorderCourseModules(req.params.courseId, req.body.moduleIds, req.user.id)
    res.json({ moduleIds })
  } catch (err) {
    operationError(res, err, 'Modules could not be reordered')
  }
})

router.post('/:courseId/modules/:moduleId/lessons', requireAuth, requireRole(...adminRoles), async (req, res) => {
  try {
    const lesson = await createLesson(req.params.courseId, req.params.moduleId, req.body, req.user.id)
    res.status(201).json({ lesson })
  } catch (err) {
    operationError(res, err, 'Lesson could not be created')
  }
})

router.patch('/:courseId/modules/:moduleId/lessons/:lessonId', requireAuth, requireRole(...adminRoles), async (req, res) => {
  try {
    const lesson = await updateLesson(req.params.courseId, req.params.moduleId, req.params.lessonId, pick(req.body, ['title', 'duration', 'content', 'type', 'resourceUrl', 'status']), req.user.id)
    if (!lesson) return res.status(404).json({ error: 'Lesson not found in this module' })
    res.json({ lesson })
  } catch (err) {
    operationError(res, err, 'Lesson could not be updated')
  }
})

router.post('/:courseId/modules/:moduleId/lessons/reorder', requireAuth, requireRole(...adminRoles), async (req, res) => {
  try {
    const lessonIds = await reorderLessons(req.params.courseId, req.params.moduleId, req.body.lessonIds, req.user.id)
    res.json({ lessonIds })
  } catch (err) {
    operationError(res, err, 'Lessons could not be reordered')
  }
})

router.post('/:courseId/resources', requireAuth, requireRole(...adminRoles), async (req, res) => {
  try {
    const material = await createCourseMaterial(req.params.courseId, req.body, req.user.id)
    res.status(201).json({ material })
  } catch (err) {
    operationError(res, err, 'Resource could not be created')
  }
})

router.patch('/:courseId/resources/:materialId', requireAuth, requireRole(...adminRoles), async (req, res) => {
  try {
    const material = await updateCourseMaterial(req.params.courseId, req.params.materialId, pick(req.body, ['lessonId', 'type', 'title', 'description', 'content', 'resourceUrl', 'isPublic']), req.user.id)
    if (!material) return res.status(404).json({ error: 'Resource not found in this course' })
    res.json({ material })
  } catch (err) {
    operationError(res, err, 'Resource could not be updated')
  }
})

export default router
