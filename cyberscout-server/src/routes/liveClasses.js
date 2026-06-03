import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireRole } from '../middleware/access.js'
import { userHasRole } from '../store/users.js'
import { createLiveClass, getLiveClassById, getViewerCount, hasActiveEnrollment, listAttendance, listLiveClassesByCourse, listUpcomingLiveClassesForUser, recordLiveEvent, updateLiveClass } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const managerRoles = ['admin', 'super_admin', 'instructor', 'ops', 'lab_creator', 'support']

function canAccessLiveClass(user, liveClass) {
  if (!liveClass) return false
  if (userHasRole(user, managerRoles)) return true
  return hasActiveEnrollment(user.id, liveClass.courseId, liveClass.batchId)
}

router.use(requireAuth)

router.post('/', requireRole(...managerRoles), (req, res) => {
  const error = requireFields(req.body, ['courseId', 'instructorId', 'title', 'scheduledStart', 'scheduledEnd'])
  if (error) return res.status(400).json({ error })
  const liveClass = createLiveClass(req.body, req.user.id)
  res.status(201).json({ liveClass })
})

router.get('/student/upcoming', (req, res) => {
  res.json({ liveClasses: listUpcomingLiveClassesForUser(req.user.id) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: managerRoles }), (req, res) => {
  res.json({ liveClasses: listLiveClassesByCourse(req.params.courseId) })
})

router.get('/:liveClassId', (req, res) => {
  const liveClass = getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!canAccessLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  res.json({ liveClass, viewerCount: getViewerCount(liveClass.id) })
})

router.patch('/:liveClassId', requireRole(...managerRoles), (req, res) => {
  const liveClass = updateLiveClass(req.params.liveClassId, req.body, req.user.id)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  res.json({ liveClass })
})

router.post('/:liveClassId/join', (req, res) => {
  const liveClass = getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!canAccessLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  const attendance = recordLiveEvent(liveClass.id, req.user.id, 'join')
  res.json({ attendance, viewerCount: getViewerCount(liveClass.id) })
})

router.post('/:liveClassId/leave', (req, res) => {
  const liveClass = getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!canAccessLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  const attendance = recordLiveEvent(liveClass.id, req.user.id, 'leave')
  res.json({ attendance, viewerCount: getViewerCount(liveClass.id) })
})

router.get('/:liveClassId/attendance', requireRole(...managerRoles), (req, res) => {
  res.json({ attendance: listAttendance({ liveClassId: req.params.liveClassId }) })
})

router.get('/:liveClassId/viewers', requireRole(...managerRoles), (req, res) => {
  res.json({ viewerCount: getViewerCount(req.params.liveClassId) })
})

export default router
