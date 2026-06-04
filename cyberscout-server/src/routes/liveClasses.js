import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireRole } from '../middleware/access.js'
import {
  createLiveClass,
  getLiveClassById,
  getViewerCount,
  hasActiveEnrollment,
  listAttendance,
  listLiveClassesByCourse,
  listUpcomingLiveClassesForUser,
  recordLiveEvent,
  updateLiveClass,
  userHasRole,
} from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const managerRoles = ['admin', 'super_admin', 'instructor', 'ops', 'lab_creator', 'support']

function canAccessLiveClass(user, liveClass) {
  if (!liveClass) return false
  if (userHasRole(user, managerRoles)) return true
  return hasActiveEnrollment(user.id, liveClass.courseId)
}

function joinDecision(user, liveClass, at = new Date()) {
  if (!user) return { allowed: false, reason: 'auth_required' }
  if (!canAccessLiveClass(user, liveClass)) return { allowed: false, reason: 'active_enrollment_required' }
  if (userHasRole(user, managerRoles)) return { allowed: true, reason: 'staff_monitoring' }
  const start = new Date(liveClass.scheduledStart)
  const end = new Date(liveClass.scheduledEnd)
  const opens = new Date(start.getTime() - 15 * 60 * 1000)
  if (at < opens) return { allowed: false, reason: 'outside_join_window_early' }
  if (at > end) return { allowed: false, reason: 'outside_join_window_late' }
  return { allowed: true, reason: 'join_window_open' }
}

function publicLiveClass(liveClass, includeJoin = false) {
  if (!liveClass) return null
  const { joinUrl, embedUrl, ...safe } = liveClass
  return includeJoin ? { ...safe, joinUrl, embedUrl } : safe
}

function deny(res, decision) {
  const status = decision.reason === 'auth_required' ? 401 : 403
  return res.status(status).json({ error: decision.reason })
}

router.use(requireAuth)

router.post('/', requireRole(...managerRoles), (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title', 'scheduledStart', 'scheduledEnd'])
  if (error) return res.status(400).json({ error })
  const liveClass = createLiveClass(req.body, req.user.id)
  res.status(201).json({ liveClass: publicLiveClass(liveClass, true) })
})

router.get('/student/upcoming', (req, res) => {
  res.json({ liveClasses: listUpcomingLiveClassesForUser(req.user.id).map(item => publicLiveClass({
    id: item.id,
    courseId: item.course_id,
    courseTitle: item.course_title,
    batchId: item.batch_id,
    instructorId: item.instructor_id,
    title: item.title,
    provider: item.provider,
    joinUrl: item.join_url,
    embedUrl: item.embed_url,
    scheduledStart: item.scheduled_start,
    scheduledEnd: item.scheduled_end,
    status: item.status,
  })) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: managerRoles }), (req, res) => {
  const includeJoin = userHasRole(req.user, managerRoles)
  res.json({ liveClasses: listLiveClassesByCourse(req.params.courseId).map(item => publicLiveClass(item, includeJoin)) })
})

router.get('/:liveClassId', (req, res) => {
  const liveClass = getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!canAccessLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  res.json({ liveClass: publicLiveClass(liveClass, userHasRole(req.user, managerRoles)), viewerCount: getViewerCount(liveClass.id) })
})

router.patch('/:liveClassId', requireRole(...managerRoles), (req, res) => {
  const liveClass = updateLiveClass(req.params.liveClassId, req.body, req.user.id)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  res.json({ liveClass: publicLiveClass(liveClass, true) })
})

router.get('/:liveClassId/validate', (req, res) => {
  const liveClass = getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  const decision = joinDecision(req.user, liveClass)
  res.json({ allowed: decision.allowed, reason: decision.reason, viewerCount: getViewerCount(liveClass.id) })
})

router.post('/:liveClassId/join', (req, res) => {
  const liveClass = getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  const decision = joinDecision(req.user, liveClass)
  if (!decision.allowed) return deny(res, decision)
  const attendance = recordLiveEvent(liveClass.id, req.user.id, 'join')
  res.json({ attendance, liveClass: publicLiveClass(liveClass, true), viewerCount: getViewerCount(liveClass.id) })
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
