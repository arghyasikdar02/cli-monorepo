import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireCourseManager, requireRole } from '../middleware/access.js'
import { assignLabToCourse, createLab, getLabById, hasActiveEnrollment, isInstructorAssigned, launchLab, listLabAttempts, listLabsByCourse, submitLabFlag, updateCourseProgress, userHasRole } from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const labReadRoles = ['admin', 'super_admin', 'ops', 'lab_creator', 'support']
const labRoles = [...labReadRoles, 'instructor']

function canAccessLab(user, lab) {
  if (!lab) return false
  return userHasRole(user, labReadRoles) || isInstructorAssigned(user.id, lab.courseId) || hasActiveEnrollment(user.id, lab.courseId)
}

router.use(requireAuth)

router.post('/', requireRole(...labRoles), requireCourseManager, (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ lab: createLab(req.body, req.user.id) })
})

router.post('/:labId/assign', requireRole(...labRoles), requireCourseManager, (req, res) => {
  const error = requireFields(req.body, ['courseId'])
  if (error) return res.status(400).json({ error })
  const lab = assignLabToCourse(req.params.labId, req.body.courseId, req.user.id)
  if (!lab) return res.status(404).json({ error: 'Lab not found' })
  res.json({ lab })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: labReadRoles }), (req, res) => {
  res.json({ labs: listLabsByCourse(req.params.courseId).map(({ flag, ...safe }) => safe) })
})

router.post('/:labId/launch', (req, res) => {
  const lab = getLabById(req.params.labId)
  if (!lab) return res.status(404).json({ error: 'Lab not found' })
  if (!canAccessLab(req.user, lab)) return res.status(403).json({ error: 'Lab access denied' })
  res.json({ attempt: launchLab(lab.id, req.user.id), launch: { type: 'manual-guide-mvp', dockerReady: true } })
})

router.post('/:labId/submit-flag', (req, res) => {
  const error = requireFields(req.body, ['flag'])
  if (error) return res.status(400).json({ error })
  const lab = getLabById(req.params.labId)
  if (!lab) return res.status(404).json({ error: 'Lab not found' })
  if (!canAccessLab(req.user, lab)) return res.status(403).json({ error: 'Lab access denied' })
  const attempt = submitLabFlag(lab.id, req.user.id, req.body.flag)
  if (attempt.status === 'passed') updateCourseProgress(req.user.id, lab.courseId, { labProgress: 100 })
  res.json({ attempt })
})

router.get('/attempts', requireRole(...labRoles), (req, res) => {
  res.json({ attempts: listLabAttempts({ courseId: req.query.courseId, userId: req.query.userId }) })
})

export default router
