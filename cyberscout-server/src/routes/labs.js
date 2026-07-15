import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireCourseManager, requireRole } from '../middleware/access.js'
import { assignLabToCourse, createLab, getLabById, hasActiveEnrollment, isInstructorAssigned, launchLab, listLabAttempts, listLabsByCourse, submitLabFlag, updateCourseProgress, userHasRole } from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const labReadRoles = ['admin', 'super_admin', 'ops', 'lab_creator', 'support']
const labRoles = [...labReadRoles, 'instructor']

async function canAccessLab(user, lab) {
  if (!lab) return false
  return userHasRole(user, labReadRoles) || await isInstructorAssigned(user.id, lab.courseId) || await hasActiveEnrollment(user.id, lab.courseId)
}

router.use(requireAuth)

router.post('/', requireRole(...labRoles), requireCourseManager, async (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ lab: await createLab(req.body, req.user.id) })
})

router.post('/:labId/assign', requireRole(...labRoles), requireCourseManager, async (req, res) => {
  const error = requireFields(req.body, ['courseId'])
  if (error) return res.status(400).json({ error })
  const lab = await assignLabToCourse(req.params.labId, req.body.courseId, req.user.id)
  if (!lab) return res.status(404).json({ error: 'Lab not found' })
  res.json({ lab })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: labReadRoles }), async (req, res) => {
  res.json({ labs: (await listLabsByCourse(req.params.courseId)).map(({ flag, ...safe }) => safe) })
})

router.post('/:labId/launch', async (req, res) => {
  const lab = await getLabById(req.params.labId)
  if (!lab) return res.status(404).json({ error: 'Lab not found' })
  if (!await canAccessLab(req.user, lab)) return res.status(403).json({ error: 'Lab access denied' })
  res.json({ attempt: await launchLab(lab.id, req.user.id), launch: { type: 'manual-guide-mvp', dockerReady: true } })
})

router.post('/:labId/submit-flag', async (req, res) => {
  const error = requireFields(req.body, ['flag'])
  if (error) return res.status(400).json({ error })
  const lab = await getLabById(req.params.labId)
  if (!lab) return res.status(404).json({ error: 'Lab not found' })
  if (!await canAccessLab(req.user, lab)) return res.status(403).json({ error: 'Lab access denied' })
  const attempt = await submitLabFlag(lab.id, req.user.id, req.body.flag)
  if (attempt.status === 'passed') await updateCourseProgress(req.user.id, lab.courseId, { labProgress: 100 })
  res.json({ attempt })
})

router.get('/attempts', requireRole(...labRoles), async (req, res) => {
  res.json({ attempts: await listLabAttempts({ courseId: req.query.courseId, userId: req.query.userId }) })
})

export default router
