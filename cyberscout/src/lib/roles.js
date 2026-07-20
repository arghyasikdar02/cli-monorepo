export const ROLE_GROUPS = Object.freeze({
  student: Object.freeze(['student']),
  admin: Object.freeze(['admin', 'super_admin']),
  instructor: Object.freeze(['instructor']),
  marketing: Object.freeze(['marketing', 'sales']),
  ops: Object.freeze(['ops', 'lab_creator', 'support', 'finance']),
})

const validRoles = new Set(Object.values(ROLE_GROUPS).flat())

export function normalizeRole(value) {
  if (typeof value !== 'string') return null
  const role = value.trim().toLowerCase()
  return validRoles.has(role) ? role : null
}

export function rolesForUser(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const normalized = roles.map(normalizeRole).filter(Boolean)
  const primary = normalizeRole(user?.role)
  if (primary) normalized.unshift(primary)
  return Array.from(new Set(normalized))
}

export function hasAnyRole(user, allowedRoles) {
  const allowed = new Set(allowedRoles.map(normalizeRole).filter(Boolean))
  return rolesForUser(user).some(role => allowed.has(role))
}

export function dashboardPathForUser(user) {
  const roles = rolesForUser(user)
  if (roles.some(role => ROLE_GROUPS.admin.includes(role))) return '/admin/dashboard'
  if (roles.some(role => ROLE_GROUPS.instructor.includes(role))) return '/instructor/dashboard'
  if (roles.some(role => ROLE_GROUPS.marketing.includes(role))) return '/marketing/dashboard'
  if (roles.some(role => ROLE_GROUPS.ops.includes(role))) return '/ops/dashboard'
  if (roles.includes('student')) return '/dashboard'
  return null
}
