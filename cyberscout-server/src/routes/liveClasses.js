import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireCourseManager, requireRole } from '../middleware/access.js'
import {
  createLiveClass,
  getLiveClassById,
  getGoogleConnectionByUserId,
  getViewerCount,
  hasActiveEnrollment,
  isInstructorAssigned,
  listAttendance,
  listLiveClassesByCourse,
  listUpcomingLiveClassesForUser,
  recordLiveEvent,
  recordAudit,
  updateGoogleConnectionTokens,
  updateLiveClass,
  userHasRole,
} from '../db/repositories.js'
import { canJoinLiveClass } from '../services/authorization.js'
import { requireFields } from '../lib/validation.js'
import {
  createGoogleMeetSpace,
  decryptAccessToken as decryptGoogleAccessToken,
  GOOGLE_MEET_SCOPE,
  refreshGoogleAccessToken,
} from '../services/google.js'

const router = Router()
const managerRoles = ['admin', 'super_admin', 'instructor', 'ops', 'lab_creator', 'support']
const monitorRoles = ['admin', 'super_admin', 'ops', 'lab_creator', 'support']

async function canAccessLiveClass(user, liveClass) {
  if (!liveClass) return false
  if (userHasRole(user, monitorRoles)) return true
  if (await isInstructorAssigned(user.id, liveClass.courseId)) return true
  return hasActiveEnrollment(user.id, liveClass.courseId, liveClass.batchId || null)
}

async function joinDecision(user, liveClass, at = new Date()) {
  return canJoinLiveClass(user, liveClass, at)
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

router.post('/', requireRole(...managerRoles), requireCourseManager, async (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title', 'scheduledStart', 'scheduledEnd'])
  if (error) return res.status(400).json({ error })
  const liveClass = await createLiveClass(req.body, req.user.id)
  res.status(201).json({ liveClass: publicLiveClass(liveClass, true) })
})

router.get('/student/upcoming', async (req, res) => {
  res.json({ liveClasses: (await listUpcomingLiveClassesForUser(req.user.id)).map(item => publicLiveClass({
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

router.get('/course/:courseId', requireCourseAccess({ allowRoles: monitorRoles }), async (req, res) => {
  const includeJoin = userHasRole(req.user, managerRoles)
  res.json({ liveClasses: (await listLiveClassesByCourse(req.params.courseId)).map(item => publicLiveClass(item, includeJoin)) })
})

router.get('/:liveClassId', async (req, res) => {
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!await canAccessLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  res.json({ liveClass: publicLiveClass(liveClass, userHasRole(req.user, managerRoles)), viewerCount: await getViewerCount(liveClass.id) })
})

router.patch('/:liveClassId', requireRole(...managerRoles), async (req, res) => {
  const liveClass = await updateLiveClass(req.params.liveClassId, req.body, req.user.id)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  res.json({ liveClass: publicLiveClass(liveClass, true) })
})

router.post('/:liveClassId/google-meet', requireRole('admin', 'super_admin', 'instructor'), async (req, res) => {
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!userHasRole(req.user, monitorRoles) && !await isInstructorAssigned(req.user.id, liveClass.courseId)) {
    return res.status(403).json({ error: 'Live class access denied' })
  }
  if (liveClass.googleSpaceName && liveClass.meetingUrl) {
    return res.json({ liveClass: publicLiveClass(liveClass, true), googleMeet: { meetingUrl: liveClass.meetingUrl, meetingCode: liveClass.googleMeetingCode } })
  }
  const connection = await getGoogleConnectionByUserId(req.user.id)
  if (!connection) return res.status(409).json({ error: 'Connect Google Meet before creating a Google Meet class.' })
  if (!connection.grantedScopes.includes(GOOGLE_MEET_SCOPE)) return res.status(403).json({ error: 'Google Meet permission is missing. Reauthorize Google Meet.' })

  let activeConnection = connection
  const expiresSoon = !connection.tokenExpiry || new Date(connection.tokenExpiry).getTime() - Date.now() < 60_000
  if (expiresSoon) {
    try {
      const refreshed = await refreshGoogleAccessToken(connection)
      activeConnection = await updateGoogleConnectionTokens(connection.id, refreshed)
    } catch {
      return res.status(409).json({ error: 'Google Meet authorization expired. Reconnect Google Meet.' })
    }
  }

  try {
    const meet = await createGoogleMeetSpace(decryptGoogleAccessToken(activeConnection))
    const updated = await updateLiveClass(liveClass.id, {
      provider: 'google_meet',
      googleConnectionId: activeConnection.id,
      googleSpaceName: meet.spaceName,
      googleMeetingCode: meet.meetingCode,
      meetingUrl: meet.meetingUri,
      joinUrl: meet.meetingUri,
    }, req.user.id)
    await recordAudit('live_class.google_meet_create', req.user.id, 'live_class', liveClass.id, { googleSpaceName: meet.spaceName })
    return res.json({ liveClass: publicLiveClass(updated, true), googleMeet: { meetingUrl: updated.meetingUrl, meetingCode: updated.googleMeetingCode } })
  } catch {
    return res.status(502).json({ error: 'Google Meet could not be created. Use a manual meeting URL or try again.' })
  }
})

router.get('/:liveClassId/validate', async (req, res) => {
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  const decision = await joinDecision(req.user, liveClass)
  res.json({ allowed: decision.allowed, reason: decision.reason, viewerCount: await getViewerCount(liveClass.id) })
})

router.post('/:liveClassId/join', async (req, res) => {
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  const decision = await joinDecision(req.user, liveClass)
  if (!decision.allowed) return deny(res, decision)
  const attendance = await recordLiveEvent(liveClass.id, req.user.id, 'join')
  res.json({ attendance, liveClass: publicLiveClass(liveClass, true), viewerCount: await getViewerCount(liveClass.id) })
})

router.post('/:liveClassId/leave', async (req, res) => {
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!await canAccessLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  const attendance = await recordLiveEvent(liveClass.id, req.user.id, 'leave')
  res.json({ attendance, viewerCount: await getViewerCount(liveClass.id) })
})

router.post('/:liveClassId/check-in', async (req, res) => {
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!await canAccessLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  const attendance = await recordLiveEvent(liveClass.id, req.user.id, 'check_in')
  await recordAudit('live_class.check_in', req.user.id, 'live_class', liveClass.id, { source: 'lms' })
  res.json({ attendance, status: 'checked_in' })
})

router.get('/:liveClassId/attendance', requireRole(...managerRoles), async (req, res) => {
  res.json({ attendance: await listAttendance({ liveClassId: req.params.liveClassId }) })
})

router.get('/:liveClassId/viewers', requireRole(...managerRoles), async (req, res) => {
  res.json({ viewerCount: await getViewerCount(req.params.liveClassId) })
})

export default router
