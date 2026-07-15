import {
  getBatchById,
  hasBatchMembership,
  getCourseById,
  hasActiveEnrollment,
  isInstructorAssigned,
  userHasRole,
} from '../db/repositories.js'

export const ADMIN_ROLES = ['admin', 'super_admin']
export const OPS_ROLES = ['ops', 'lab_creator', 'support', 'finance']
export const INSTRUCTOR_ROLES = ['instructor']
export const SALES_ROLES = ['marketing', 'sales']

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

export function requireKnownCourse(courseId) {
  const course = getCourseById(courseId)
  if (!course) return { decision: deny('course_not_found'), course: null }
  return { decision: allow('course_found'), course }
}

export function canAccessCourse(user, courseId, options = {}) {
  if (!user) return deny('auth_required')
  const { decision, course } = requireKnownCourse(courseId)
  if (!decision.allowed) return decision
  if (isAdmin(user)) return allow('admin')
  if (options.allowRoles?.length && userHasRole(user, options.allowRoles)) return allow('role_allowed')
  if (userHasRole(user, INSTRUCTOR_ROLES) && course.instructorId === user.id) return allow('assigned_instructor')
  if (hasActiveEnrollment(user.id, courseId, options.batchId || null)) return allow('active_enrollment')
  return deny('active_enrollment_required')
}

export function canManageCourse(user, courseId) {
  if (!user) return deny('auth_required')
  const { decision, course } = requireKnownCourse(courseId)
  if (!decision.allowed) return decision
  if (isAdmin(user)) return allow('admin')
  if (userHasRole(user, ['ops', 'lab_creator'])) return allow('ops')
  if (userHasRole(user, INSTRUCTOR_ROLES) && course.instructorId === user.id) return allow('assigned_instructor')
  return deny('course_manager_required')
}

export function canAccessBatch(user, courseId, batchId, options = {}) {
  if (!batchId) return deny('batch_required')
  const courseDecision = canAccessCourse(user, courseId, options)
  if (!courseDecision.allowed) return courseDecision
  const batch = getBatchById(batchId)
  if (!batch || batch.courseId !== courseId || batch.status !== 'active') return deny('batch_not_found_or_inactive')
  if (isAdmin(user) || userHasRole(user, options.allowRoles || [])) return allow('role_allowed')
  if (isInstructorAssigned(user.id, courseId)) return allow('assigned_instructor')
  if (hasBatchMembership(user.id, courseId, batchId)) return allow('active_batch_membership')
  return deny('active_batch_membership_required')
}

export function canInstructorAccessCourse(user, courseId) {
  if (!user) return deny('auth_required')
  const { decision } = requireKnownCourse(courseId)
  if (!decision.allowed) return decision
  if (isAdmin(user)) return allow('admin')
  if (userHasRole(user, INSTRUCTOR_ROLES) && isInstructorAssigned(user.id, courseId)) return allow('assigned_instructor')
  return deny('assigned_instructor_required')
}

export function canJoinLiveClass(user, liveClass, at = new Date()) {
  if (!user) return deny('auth_required')
  if (isAdmin(user) || userHasRole(user, OPS_ROLES)) return allow('staff_monitoring')
  if (userHasRole(user, INSTRUCTOR_ROLES) && isInstructorAssigned(user.id, liveClass.courseId)) return allow('assigned_instructor')
  const access = liveClass.batchId
    ? canAccessBatch(user, liveClass.courseId, liveClass.batchId)
    : canAccessCourse(user, liveClass.courseId)
  if (!access.allowed) return access
  const start = new Date(liveClass.scheduledStart)
  const end = new Date(liveClass.scheduledEnd)
  const opens = new Date(start.getTime() - 15 * 60 * 1000)
  if (at < opens) return deny('outside_join_window_early')
  if (at > end) return deny('outside_join_window_late')
  return allow('join_window_open')
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
