export const VALID_ROLES = Object.freeze([
  'student',
  'admin',
  'super_admin',
  'instructor',
  'marketing',
  'sales',
  'ops',
  'lab_creator',
  'support',
  'finance',
])

export const ROLE_GROUPS = Object.freeze({
  student: Object.freeze(['student']),
  admin: Object.freeze(['admin', 'super_admin']),
  instructor: Object.freeze(['instructor']),
  marketing: Object.freeze(['marketing', 'sales']),
  ops: Object.freeze(['ops', 'lab_creator', 'support', 'finance']),
})

const VALID_ROLE_SET = new Set(VALID_ROLES)

export function normalizeRole(value) {
  if (typeof value !== 'string') return null
  const role = value.trim().toLowerCase()
  return VALID_ROLE_SET.has(role) ? role : null
}

export function canonicalRoles(roles, primaryRole = null) {
  const source = Array.isArray(roles) ? roles : []
  const normalized = source.map(normalizeRole).filter(Boolean)
  const primary = normalizeRole(primaryRole)
  if (primary) normalized.unshift(primary)
  return Array.from(new Set(normalized))
}

export function rolesForUser(user) {
  return canonicalRoles(user?.roles, user?.role)
}

export function dashboardPathForRoles(roles) {
  const normalized = canonicalRoles(roles)
  if (normalized.some(role => ROLE_GROUPS.admin.includes(role))) return '/admin/dashboard'
  if (normalized.some(role => ROLE_GROUPS.instructor.includes(role))) return '/instructor/dashboard'
  if (normalized.some(role => ROLE_GROUPS.marketing.includes(role))) return '/marketing/dashboard'
  if (normalized.some(role => ROLE_GROUPS.ops.includes(role))) return '/ops/dashboard'
  if (normalized.includes('student')) return '/dashboard'
  return null
}

export function dashboardPathForUser(user) {
  return dashboardPathForRoles(rolesForUser(user))
}
