import { verifyToken } from '../lib/jwt.js'
import { findUserById, userHasRole } from '../db/repositories.js'
import { assertDecision, canAccessBatch, canAccessCourse, canInstructorAccessCourse, canManageCourse } from '../services/authorization.js'
import { ROLE_GROUPS, rolesForUser } from '../lib/roles.js'

export { ROLE_GROUPS }

export function currentRoles(user) {
  return rolesForUser(user)
}

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : req.cookies?.cli_session
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  try {
    const payload = verifyToken(token)
    const user = await findUserById(payload.sub)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    if (user.status !== 'active') return res.status(403).json({ error: 'Account unavailable' })
    if (!rolesForUser(user).length) return res.status(403).json({ error: 'Unsupported account role' })
    if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
      return res.status(401).json({ error: 'Session expired' })
    }
    req.auth = payload
    req.user = user
    if (user.mustChangePassword) {
      const allowedWhileChangingPassword = new Set([
        '/api/auth/me',
        '/api/auth/change-password',
        '/api/auth/logout',
      ])
      const requestPath = String(req.originalUrl || '').split('?')[0]
      if (!allowedWhileChangingPassword.has(requestPath)) {
        return res.status(428).json({ error: 'Password change required', code: 'PASSWORD_CHANGE_REQUIRED' })
      }
    }
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
  const roles = ROLE_GROUPS[group]
  if (!roles) {
    return (_req, res) => res.status(403).json({ error: 'Unsupported dashboard role' })
  }
  return requireRole(...roles)
}

function extractCourseId(req) {
  return req.params.courseId || req.params.id || req.body?.courseId || req.query?.courseId
}

export function requireCourseAccess(options = {}) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Authentication required' })
      const courseId = extractCourseId(req)
      if (!courseId) return res.status(400).json({ error: 'courseId is required' })
      const decision = await canAccessCourse(req.user, courseId, { ...options, batchId: req.params.batchId || req.body?.batchId || req.query?.batchId })
      if (assertDecision(decision, res)) return
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export async function requireCourseManager(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const courseId = extractCourseId(req)
    if (!courseId) return res.status(400).json({ error: 'courseId is required' })
    const decision = await canManageCourse(req.user, courseId)
    if (assertDecision(decision, res)) return
    return next()
  } catch (error) {
    return next(error)
  }
}

export function requireBatchMembership(options = {}) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Authentication required' })
      const courseId = extractCourseId(req)
      const batchId = req.params.batchId || req.body?.batchId || req.query?.batchId
      if (!courseId) return res.status(400).json({ error: 'courseId is required' })
      if (!batchId) return res.status(400).json({ error: 'batchId is required' })
      const decision = await canAccessBatch(req.user, courseId, batchId, options)
      if (assertDecision(decision, res)) return
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export async function requireInstructorAssignment(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const courseId = extractCourseId(req)
    if (!courseId) return res.status(400).json({ error: 'courseId is required' })
    const decision = await canInstructorAccessCourse(req.user, courseId)
    if (assertDecision(decision, res)) return
    return next()
  } catch (error) {
    return next(error)
  }
}
