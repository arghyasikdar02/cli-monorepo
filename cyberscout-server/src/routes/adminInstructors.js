import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import {
  createInstructorAccount,
  getInstructorAccount,
  instructorUsernameAvailability,
  InstructorAccountError,
  listInstructorAccounts,
  removeInstructorCourse,
  replaceInstructorCourses,
  resetInstructorPassword,
  setInstructorStatus,
  suggestInstructorUsername,
  updateInstructorAccount,
} from '../services/instructorAccounts.js'
import { pick, requireFields } from '../lib/validation.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole('admin', 'super_admin'))

function respondWithError(res, error) {
  if (error instanceof InstructorAccountError) {
    return res.status(error.status).json({ error: error.message, code: error.code })
  }
  if (error?.code === '23505') return res.status(409).json({ error: 'Email or username is already in use.', code: 'ACCOUNT_CONFLICT' })
  console.error('admin-instructor-operation-failed', { reason: error?.code || error?.name || 'unknown' })
  return res.status(500).json({ error: 'The instructor account change could not be completed.' })
}

router.get('/usernames/check', async (req, res) => {
  try {
    if (!req.query.username && !req.query.name) return res.status(400).json({ error: 'Enter a name or username.' })
    const username = req.query.username || await suggestInstructorUsername(req.query.name)
    res.json(await instructorUsernameAvailability(username, req.query.excludeUserId || null))
  } catch (error) {
    respondWithError(res, error)
  }
})

router.get('/instructors', async (req, res) => {
  try {
    res.json(await listInstructorAccounts({
      search: req.query.search,
      status: req.query.status,
      courseId: req.query.courseId,
      page: req.query.page,
      limit: req.query.limit,
    }))
  } catch (error) {
    respondWithError(res, error)
  }
})

router.post('/instructors', async (req, res) => {
  const missing = requireFields(req.body, ['name', 'email'])
  if (missing) return res.status(400).json({ error: missing })
  try {
    const result = await createInstructorAccount({
      ...pick(req.body, ['name', 'email', 'username', 'temporaryPassword', 'courseIds']),
      courseIds: Array.isArray(req.body.courseIds) ? req.body.courseIds : [],
    }, req.user.id)
    res.status(201).json(result)
  } catch (error) {
    respondWithError(res, error)
  }
})

router.get('/instructors/:instructorId', async (req, res) => {
  try {
    const instructor = await getInstructorAccount(req.params.instructorId)
    if (!instructor) return res.status(404).json({ error: 'Instructor not found.' })
    res.json({ instructor })
  } catch (error) {
    respondWithError(res, error)
  }
})

router.patch('/instructors/:instructorId', async (req, res) => {
  try {
    const instructor = await updateInstructorAccount(
      req.params.instructorId,
      pick(req.body, ['name', 'email', 'username']),
      req.user.id,
    )
    res.json({ instructor })
  } catch (error) {
    respondWithError(res, error)
  }
})

router.post('/instructors/:instructorId/reset-password', async (req, res) => {
  try {
    res.json(await resetInstructorPassword(req.params.instructorId, req.user.id, req.body.temporaryPassword || ''))
  } catch (error) {
    respondWithError(res, error)
  }
})

router.post('/instructors/:instructorId/suspend', async (req, res) => {
  try {
    res.json({ instructor: await setInstructorStatus(req.params.instructorId, 'suspended', req.user.id) })
  } catch (error) {
    respondWithError(res, error)
  }
})

router.post('/instructors/:instructorId/reactivate', async (req, res) => {
  try {
    res.json({ instructor: await setInstructorStatus(req.params.instructorId, 'active', req.user.id) })
  } catch (error) {
    respondWithError(res, error)
  }
})

router.post('/instructors/:instructorId/archive', async (req, res) => {
  try {
    res.json({
      instructor: await setInstructorStatus(req.params.instructorId, 'archived', req.user.id, {
        confirmFutureClasses: req.body.confirmFutureClasses === true,
      }),
    })
  } catch (error) {
    respondWithError(res, error)
  }
})

router.put('/instructors/:instructorId/courses', async (req, res) => {
  if (!Array.isArray(req.body.courseIds)) return res.status(400).json({ error: 'courseIds must be an array.' })
  try {
    const instructor = await replaceInstructorCourses(req.params.instructorId, req.body.courseIds, req.user.id, {
      confirmFutureClasses: req.body.confirmFutureClasses === true,
    })
    res.json({ instructor })
  } catch (error) {
    respondWithError(res, error)
  }
})

router.delete('/instructors/:instructorId/courses/:courseId', async (req, res) => {
  try {
    const instructor = await removeInstructorCourse(req.params.instructorId, req.params.courseId, req.user.id, {
      confirmFutureClasses: req.query.confirmFutureClasses === 'true',
    })
    res.json({ instructor })
  } catch (error) {
    respondWithError(res, error)
  }
})

export default router
