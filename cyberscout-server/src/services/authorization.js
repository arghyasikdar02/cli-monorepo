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
  if (!user) return deny('auth_required')
  if (isAdmin(user) || userHasRole(user, OPS_ROLES)) return allow('staff_monitoring')
  if (userHasRole(user, INSTRUCTOR_ROLES) && await isInstructorAssigned(user.id, liveClass.courseId)) return allow('assigned_instructor')
  const access = liveClass.batchId
    ? await canAccessBatch(user, liveClass.courseId, liveClass.batchId)
    : await canAccessCourse(user, liveClass.courseId)
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
