import { verifyToken } from '../lib/jwt.js'
import { findById, userHasRole } from '../store/users.js'
import { hasActiveEnrollment, getCourseById } from '../store/platformStore.js'

export const ROLE_GROUPS = {
  student: ['student'],
  admin: ['admin', 'super_admin'],
  instructor: ['instructor'],
  marketing: ['marketing', 'sales'],
  ops: ['ops', 'lab_creator', 'support', 'finance'],
}

export function currentRoles(user) {
  return user?.roles || [user?.role || 'student']
}

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' })

  try {
    const payload = verifyToken(auth.slice(7))
    const user = findById(payload.sub)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    req.auth = payload
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!userHasRole(req.user, roles)) return res.status(403).json({ error: 'Insufficient role' })
    return next()
  }
}

export function requireDashboardRole(group) {
  return requireRole(...(ROLE_GROUPS[group] || []))
}

function extractCourseId(req) {
  return req.params.courseId || req.params.id || req.body?.courseId || req.query?.courseId
}

export function requireCourseAccess(options = {}) {
  const allowRoles = options.allowRoles || []
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const courseId = extractCourseId(req)
    if (!courseId) return res.status(400).json({ error: 'courseId is required' })
    const course = getCourseById(courseId)
    if (!course) return res.status(404).json({ error: 'Course not found' })
    if (allowRoles.length && userHasRole(req.user, allowRoles)) return next()
    if (hasActiveEnrollment(req.user.id, courseId)) return next()
    return res.status(403).json({ error: 'Active enrollment required for this course' })
  }
}

export function requireCourseManager(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  const courseId = extractCourseId(req)
  if (!courseId) return res.status(400).json({ error: 'courseId is required' })
  const course = getCourseById(courseId)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  if (userHasRole(req.user, ['admin', 'super_admin', 'ops', 'lab_creator'])) return next()
  if (userHasRole(req.user, ['instructor']) && course.instructorId === req.user.id) return next()
  return res.status(403).json({ error: 'Course manager access required' })
}
