import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireCourseManager, requireRole } from '../middleware/access.js'
import {
  createLiveClass,
  findUserById,
  getCourseById,
  getLiveClassById,
  getGoogleConnectionByUserId,
  getViewerCount,
  hasActiveEnrollment,
  isInstructorAssigned,
  listAttendance,
  listAllLiveClasses,
  listLiveClassesByCourse,
  listUpcomingLiveClassesForUser,
  recordLiveEvent,
  recordAudit,
  updateGoogleConnectionTokens,
  updateLiveClass,
  userHasRole,
  LIVE_CLASS_STATUSES,
} from '../db/repositories.js'
import { canJoinLiveClass } from '../services/authorization.js'
import { pick, requireFields } from '../lib/validation.js'
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
  if (liveClass.instructorId === user.id || await isInstructorAssigned(user.id, liveClass.courseId)) return true
  return hasActiveEnrollment(user.id, liveClass.courseId, liveClass.batchId || null)
}

async function canManageLiveClass(user, liveClass) {
  if (!liveClass) return false
  if (userHasRole(user, monitorRoles)) return true
  return userHasRole(user, ['instructor']) && (liveClass.instructorId === user.id || await isInstructorAssigned(user.id, liveClass.courseId))
}

async function joinDecision(user, liveClass, at = new Date()) {
  return canJoinLiveClass(user, liveClass, at)
}

function publicLiveClass(liveClass, includeJoin = false) {
  if (!liveClass) return null
  const { joinUrl, embedUrl, meetingUrl, googleConnectionId, googleSpaceName, googleMeetingCode, ...safe } = liveClass
  return includeJoin ? { ...safe, joinUrl, embedUrl, meetingUrl, googleConnectionId, googleSpaceName, googleMeetingCode } : safe
}

function deny(res, decision) {
  const status = decision.reason === 'auth_required' ? 401 : 403
  return res.status(status).json({ error: decision.reason })
}

function validateSchedule(startValue, endValue, { future = false } = {}) {
  const start = new Date(startValue)
  const end = new Date(endValue)
  if (!startValue || !endValue || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'A valid start and end time are required'
  if (end <= start) return 'Live class end time must be after its start time'
  if (end.getTime() - start.getTime() > 12 * 60 * 60 * 1000) return 'Live class duration cannot exceed 12 hours'
  if (future && start <= new Date()) return 'Google Meet can only be created for a future live class'
  return ''
}

async function validateInstructor(instructorId) {
  const instructor = await findUserById(instructorId)
  if (!instructor || instructor.status !== 'active' || !userHasRole(instructor, ['instructor', 'admin', 'super_admin'])) return null
  return instructor
}

router.use(requireAuth)

router.get('/', requireRole(...managerRoles), async (req, res) => {
  const filters = userHasRole(req.user, monitorRoles) ? {} : { instructorId: req.user.id }
  res.json({ liveClasses: (await listAllLiveClasses(filters)).map(item => publicLiveClass(item, true)), statuses: LIVE_CLASS_STATUSES })
})

router.post('/', requireRole(...managerRoles), requireCourseManager, async (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title', 'scheduledStart', 'scheduledEnd'])
  if (error) return res.status(400).json({ error })
  const scheduleError = validateSchedule(req.body.scheduledStart, req.body.scheduledEnd)
  if (scheduleError) return res.status(400).json({ error: scheduleError })
  const status = String(req.body.status || 'scheduled').toLowerCase()
  if (!LIVE_CLASS_STATUSES.includes(status)) return res.status(400).json({ error: 'Unsupported live class status' })
  const course = await getCourseById(req.body.courseId)
  if (!course || course.status === 'archived') return res.status(404).json({ error: 'Course not found' })
  const instructorId = req.body.instructorId || course.instructorId || (userHasRole(req.user, ['instructor']) ? req.user.id : null)
  if (!instructorId || !await validateInstructor(instructorId)) return res.status(400).json({ error: 'Select an active instructor for this live class' })
  if (userHasRole(req.user, ['instructor']) && instructorId !== req.user.id) return res.status(403).json({ error: 'Instructors can only schedule their own classes' })
  try {
    const liveClass = await createLiveClass({ ...req.body, instructorId, status }, req.user.id)
    res.status(201).json({ liveClass: publicLiveClass(liveClass, true) })
  } catch {
    res.status(400).json({ error: 'Live class could not be created' })
  }
})

router.get('/student/upcoming', async (req, res) => {
  res.json({ liveClasses: (await listUpcomingLiveClassesForUser(req.user.id)).map(item => publicLiveClass({
    id: item.id,
    courseId: item.course_id,
    courseTitle: item.course_title,
    batchId: item.batch_id,
    instructorId: item.instructor_id,
    instructor: item.instructor_name || 'Cyber Lab IN Instructor',
    title: item.title,
    description: item.description || '',
    agenda: item.agenda || '',
    provider: item.provider,
    joinUrl: item.join_url,
    embedUrl: item.embed_url,
    scheduledStart: item.scheduled_start,
    scheduledEnd: item.scheduled_end,
    timezone: item.timezone || 'Asia/Kolkata',
    status: item.status,
    recordingUrl: item.recording_url || null,
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
  const existing = await getLiveClassById(req.params.liveClassId)
  if (!existing) return res.status(404).json({ error: 'Live class not found' })
  if (!await canManageLiveClass(req.user, existing)) return res.status(403).json({ error: 'Live class access denied' })
  const updates = pick(req.body, ['batchId', 'instructorId', 'title', 'description', 'agenda', 'provider', 'joinUrl', 'meetingUrl', 'scheduledStart', 'scheduledEnd', 'timezone', 'status', 'recordingUrl'])
  const start = updates.scheduledStart || existing.scheduledStart
  const end = updates.scheduledEnd || existing.scheduledEnd
  const scheduleError = validateSchedule(start, end)
  if (scheduleError) return res.status(400).json({ error: scheduleError })
  if (updates.status !== undefined && !LIVE_CLASS_STATUSES.includes(String(updates.status).toLowerCase())) return res.status(400).json({ error: 'Unsupported live class status' })
  if (updates.instructorId !== undefined) {
    if (!await validateInstructor(updates.instructorId)) return res.status(400).json({ error: 'Select an active instructor' })
    if (userHasRole(req.user, ['instructor']) && updates.instructorId !== req.user.id) return res.status(403).json({ error: 'Instructors cannot reassign live classes' })
  }
  const liveClass = await updateLiveClass(req.params.liveClassId, {
    ...updates,
    ...(updates.status !== undefined ? { status: String(updates.status).toLowerCase() } : {}),
    ...(updates.scheduledStart !== undefined ? { startAt: updates.scheduledStart } : {}),
    ...(updates.scheduledEnd !== undefined ? { endAt: updates.scheduledEnd } : {}),
  }, req.user.id)
  res.json({ liveClass: publicLiveClass(liveClass, true) })
})

router.post('/:liveClassId/google-meet', requireRole('admin', 'super_admin', 'instructor'), async (req, res) => {
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!await canManageLiveClass(req.user, liveClass)) {
    return res.status(403).json({ error: 'Live class access denied' })
  }
  if (liveClass.googleSpaceName && liveClass.meetingUrl) {
    return res.json({ liveClass: publicLiveClass(liveClass, true), googleMeet: { meetingUrl: liveClass.meetingUrl, meetingCode: liveClass.googleMeetingCode } })
  }
  const scheduleError = validateSchedule(liveClass.scheduledStart, liveClass.scheduledEnd, { future: true })
  if (scheduleError) return res.status(400).json({ error: scheduleError })
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
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!await canManageLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  res.json({ attendance: await listAttendance({ liveClassId: req.params.liveClassId }) })
})

router.get('/:liveClassId/viewers', requireRole(...managerRoles), async (req, res) => {
  const liveClass = await getLiveClassById(req.params.liveClassId)
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' })
  if (!await canManageLiveClass(req.user, liveClass)) return res.status(403).json({ error: 'Live class access denied' })
  res.json({ viewerCount: await getViewerCount(req.params.liveClassId) })
})

export default router
