import bcrypt from 'bcrypt'

const users = new Map()

export const VALID_ROLES = [
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
]

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function normalizeRoles(data = {}) {
  const requested = Array.isArray(data.roles) && data.roles.length ? data.roles : [data.role || 'student']
  const roles = [...new Set(requested.filter(role => VALID_ROLES.includes(role)))]
  return roles.length ? roles : ['student']
}

function createSeedUser(data) {
  const roles = normalizeRoles(data)
  return {
    rank: 'Novice',
    xp: 0,
    level: 1,
    streakDays: 0,
    isPro: false,
    status: 'active',
    role: roles[0],
    roles,
    lastLogin: 'Today',
    masteryScore: 0,
    enrolled: 0,
    completed: 0,
    learningHours: 0,
    ...data,
    email: normalizeEmail(data.email),
    role: roles[0],
    roles,
  }
}

// Pre-seeded local users use password: password123
const seedHash = await bcrypt.hash('password123', 10)
const seeds = [
  createSeedUser({
    id: 'usr_001',
    name: 'Neel',
    email: 'neel0409@gmail.com',
    passwordHash: seedHash,
    googleId: null,
    role: 'student',
    roles: ['student'],
    rank: 'Script Kiddie',
    xp: 6920,
    level: 34,
    streakDays: 12,
    masteryScore: 62,
    enrolled: 1,
    completed: 0,
    learningHours: 12,
  }),
  createSeedUser({
    id: 'usr_student',
    name: 'Demo Student',
    email: 'student@cyberlabin.com',
    passwordHash: seedHash,
    googleId: null,
    role: 'student',
    roles: ['student'],
    masteryScore: 24,
    enrolled: 1,
    learningHours: 4,
  }),
  createSeedUser({
    id: 'usr_admin',
    name: 'Demo Admin',
    email: 'admin@cyberlabin.com',
    passwordHash: seedHash,
    googleId: null,
    role: 'admin',
    roles: ['admin'],
  }),
  createSeedUser({
    id: 'usr_instructor',
    name: 'Demo Instructor',
    email: 'instructor@cyberlabin.com',
    passwordHash: seedHash,
    googleId: null,
    role: 'instructor',
    roles: ['instructor'],
  }),
  createSeedUser({
    id: 'usr_marketing',
    name: 'Demo Marketing',
    email: 'marketing@cyberlabin.com',
    passwordHash: seedHash,
    googleId: null,
    role: 'marketing',
    roles: ['marketing', 'sales'],
  }),
  createSeedUser({
    id: 'usr_ops',
    name: 'Demo Ops',
    email: 'ops@cyberlabin.com',
    passwordHash: seedHash,
    googleId: null,
    role: 'ops',
    roles: ['ops', 'lab_creator'],
  }),
]

for (const user of seeds) users.set(user.id, user)

export function findByEmail(email) {
  const normalized = normalizeEmail(email)
  for (const u of users.values()) if (u.email === normalized) return u
  return null
}

export function findByGoogleId(googleId) {
  for (const u of users.values()) if (u.googleId === googleId) return u
  return null
}

export function findById(id) {
  return users.get(id) ?? null
}

export function createUser(data) {
  const id = `usr_${Date.now()}`
  const roles = normalizeRoles(data)
  const user = {
    id,
    rank: 'Novice',
    xp: 0,
    level: 1,
    streakDays: 0,
    isPro: false,
    status: 'active',
    role: roles[0],
    roles,
    lastLogin: 'Today',
    masteryScore: 0,
    enrolled: 0,
    completed: 0,
    learningHours: 0,
    ...data,
    email: normalizeEmail(data.email),
    role: roles[0],
    roles,
  }
  users.set(id, user)
  return user
}

export function listUsers() {
  return [...users.values()].map(publicUser)
}

export function updateUser(id, updates) {
  const user = findById(id)
  if (!user) return null
  const next = { ...user, ...updates }
  if (updates.email) next.email = normalizeEmail(updates.email)
  if (updates.role || updates.roles) {
    const roles = normalizeRoles(updates)
    next.role = roles[0]
    next.roles = roles
  }
  users.set(id, next)
  return next
}

export function suspendUser(id) {
  return updateUser(id, { status: 'suspended' })
}

export function assignRole(id, role) {
  if (!VALID_ROLES.includes(role)) return null
  return updateUser(id, { role, roles: [role] })
}

export function userHasRole(user, allowedRoles = []) {
  if (!user) return false
  const roles = user.roles || [user.role]
  if (roles.includes('super_admin')) return true
  return roles.some(role => allowedRoles.includes(role))
}

export function publicUser(u) {
  const { passwordHash, googleId, ...rest } = u
  return rest
}
