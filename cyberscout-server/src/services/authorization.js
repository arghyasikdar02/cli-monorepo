import {
  getBatchById,
  hasBatchMembership,
  getCourseById,
  hasActiveEnrollment,
  isInstructorAssigned,
  userHasRole,
} from '../db/repositories.js'
import { ROLE_GROUPS } from '../lib/roles.js'

export const ADMIN_ROLES = ROLE_GROUPS.admin
export const OPS_ROLES = ROLE_GROUPS.ops
export const INSTRUCTOR_ROLES = ROLE_GROUPS.instructor
export const SALES_ROLES = ROLE_GROUPS.marketing
export const LIVE_CLASS_JOIN_WINDOW_MINUTES = 15

export const LIVE_CLASS_JOIN_MESSAGES = Object.freeze({
  auth_required: 'Authentication is required.',
  student_role_required: 'Student access is required for this live class.',
  instructor_not_assigned: 'You are not assigned to this live class.',
  active_enrollment_required: 'You are not enrolled in this course.',
  course_not_published: 'This live class has not been published.',
  live_class_draft: 'This live class has not been published.',
  live_class_cancelled: 'This class was cancelled.',
  live_class_completed: 'This live class has ended.',
  meeting_link_unavailable: 'The meeting link is not available yet.',
  schedule_unavailable: 'This live class schedule is unavailable.',
  outside_join_window_early: 'The class can be joined 15 minutes before it begins.',
  outside_join_window_late: 'This live class has ended.',
})

export function allow(reason = 'allowed') {
  return { allowed: true, reason }
}

export function deny(reason = 'denied') {
  return { allowed: false, reason }
}

export function isAdmin(user) {
  return userHasRole(user, ADMIN_ROLES)
}

export function isStaff(user) {
  return userHasRole(user, [...ADMIN_ROLES, ...OPS_ROLES, ...INSTRUCTOR_ROLES, ...SALES_ROLES])
}

export async function requireKnownCourse(courseId) {
  const course = await getCourseById(courseId)
  if (!course) return { decision: deny('course_not_found'), course: null }
  return { decision: allow('course_found'), course }
}

export async function canAccessCourse(user, courseId, options = {}) {
  if (!user) return deny('auth_required')
  const { decision, course } = await requireKnownCourse(courseId)
  if (!decision.allowed) return decision
  if (isAdmin(user)) return allow('admin')
  if (options.allowRoles?.length && userHasRole(user, options.allowRoles)) return allow('role_allowed')
  if (userHasRole(user, INSTRUCTOR_ROLES) && course.instructorId === user.id) return allow('assigned_instructor')
  if (await hasActiveEnrollment(user.id, courseId, options.batchId || null)) return allow('active_enrollment')
  return deny('active_enrollment_required')
}

export async function canManageCourse(user, courseId) {
  if (!user) return deny('auth_required')
  const { decision, course } = await requireKnownCourse(courseId)
  if (!decision.allowed) return decision
  if (isAdmin(user)) return allow('admin')
  if (userHasRole(user, ['ops', 'lab_creator'])) return allow('ops')
  if (userHasRole(user, INSTRUCTOR_ROLES) && course.instructorId === user.id) return allow('assigned_instructor')
  return deny('course_manager_required')
}

export async function canAccessBatch(user, courseId, batchId, options = {}) {
  if (!batchId) return deny('batch_required')
  const courseDecision = await canAccessCourse(user, courseId, options)
  if (!courseDecision.allowed) return courseDecision
  const batch = await getBatchById(batchId)
  if (!batch || batch.courseId !== courseId || batch.status !== 'active') return deny('batch_not_found_or_inactive')
  if (isAdmin(user) || userHasRole(user, options.allowRoles || [])) return allow('role_allowed')
  if (await isInstructorAssigned(user.id, courseId)) return allow('assigned_instructor')
  if (await hasBatchMembership(user.id, courseId, batchId)) return allow('active_batch_membership')
  return deny('active_batch_membership_required')
}

export async function canInstructorAccessCourse(user, courseId) {
  if (!user) return deny('auth_required')
  const { decision } = await requireKnownCourse(courseId)
  if (!decision.allowed) return decision
  if (isAdmin(user)) return allow('admin')
  if (userHasRole(user, INSTRUCTOR_ROLES) && await isInstructorAssigned(user.id, courseId)) return allow('assigned_instructor')
  return deny('assigned_instructor_required')
}

export async function canJoinLiveClass(user, liveClass, at = new Date()) {
  const start = new Date(liveClass?.scheduledStart)
  const end = new Date(liveClass?.scheduledEnd)
  const validSchedule = !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start
  const joinAvailableAt = validSchedule
    ? new Date(start.getTime() - LIVE_CLASS_JOIN_WINDOW_MINUTES * 60 * 1000).toISOString()
    : null
  const meetingUrl = safeMeetingUrl(liveClass?.meetingUrl || liveClass?.joinUrl)
  const decision = (allowed, reason, status = allowed ? 200 : 403) => ({
    allowed,
    canJoin: allowed,
    reason,
    denialReason: allowed ? null : (LIVE_CLASS_JOIN_MESSAGES[reason] || 'This live class cannot be joined.'),
    joinAvailableAt,
    joinUrl: allowed ? meetingUrl : null,
    status,
  })

  if (!user) return decision(false, 'auth_required', 401)

  const privilegedStaff = isAdmin(user) || userHasRole(user, OPS_ROLES)
  const instructor = userHasRole(user, INSTRUCTOR_ROLES)
  const assignedInstructor = instructor && (
    liveClass?.instructorId === user.id || await isInstructorAssigned(user.id, liveClass?.courseId)
  )
  if (instructor && !assignedInstructor) return decision(false, 'instructor_not_assigned')

  if (privilegedStaff || assignedInstructor) {
    if (liveClass?.status === 'cancelled') return decision(false, 'live_class_cancelled')
    if (!meetingUrl) return decision(false, 'meeting_link_unavailable')
    return decision(true, privilegedStaff ? 'staff_monitoring' : 'assigned_instructor')
  }

  if (!userHasRole(user, ['student'])) return decision(false, 'student_role_required')
  const access = liveClass.batchId
    ? await canAccessBatch(user, liveClass.courseId, liveClass.batchId)
    : await canAccessCourse(user, liveClass.courseId)
  if (!access.allowed) return decision(false, 'active_enrollment_required')
  if (liveClass?.courseStatus !== 'published') return decision(false, 'course_not_published')
  if (liveClass?.status === 'draft') return decision(false, 'live_class_draft')
  if (liveClass?.status === 'cancelled') return decision(false, 'live_class_cancelled')
  if (liveClass?.status === 'completed') return decision(false, 'live_class_completed')
  if (!['scheduled', 'live'].includes(liveClass?.status)) return decision(false, 'course_not_published')
  if (!meetingUrl) return decision(false, 'meeting_link_unavailable')
  if (!validSchedule) return decision(false, 'schedule_unavailable')

  const now = new Date(at)
  if (Number.isNaN(now.getTime())) return decision(false, 'schedule_unavailable')
  const opens = new Date(joinAvailableAt)
  if (now < opens) return decision(false, 'outside_join_window_early')
  if (now > end) return decision(false, 'outside_join_window_late')
  return decision(true, 'join_window_open')
}

function safeMeetingUrl(value) {
  if (!value) return null
  try {
    const url = new URL(String(value))
    if (url.protocol !== 'https:' || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}

export function assertDecision(decision, res, statusByReason = {}) {
  if (decision.allowed) return false
  const status = statusByReason[decision.reason] || (
    decision.reason?.includes('not_found') ? 404 :
    decision.reason === 'auth_required' ? 401 :
    403
  )
  res.status(status).json({ error: decision.reason })
  return true
}
