import bcrypt from 'bcrypt'
import { randomInt } from 'node:crypto'
import { queryMany, queryOne, transaction } from '../db/index.js'
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  recordAudit,
  updateUser,
  updateUserPassword,
  userHasRole,
} from '../db/repositories.js'

export const RESERVED_USERNAMES = Object.freeze([
  'admin',
  'root',
  'system',
  'support',
  'cyberlabin',
])

const RESERVED_USERNAME_SET = new Set(RESERVED_USERNAMES)
const USERNAME_PATTERN = /^[a-z][a-z0-9._-]{2,39}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_SETS = Object.freeze({
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower: 'abcdefghijkmnopqrstuvwxyz',
  number: '23456789',
  symbol: '!@#$%&*+-=?',
})
const PASSWORD_ALPHABET = Object.values(PASSWORD_SETS).join('')

export class InstructorAccountError extends Error {
  constructor(message, status = 400, code = 'INSTRUCTOR_ACCOUNT_ERROR') {
    super(message)
    this.name = 'InstructorAccountError'
    this.status = status
    this.code = code
  }
}

export function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase()
}

export function validateInstructorUsername(value) {
  const username = normalizeUsername(value)
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username must be 3–40 characters, start with a letter, and use only letters, numbers, dots, underscores or hyphens.'
  }
  if (RESERVED_USERNAME_SET.has(username)) return 'This username is reserved.'
  return ''
}

export function usernameBaseFromName(name) {
  const parts = String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || []
  const base = parts.length > 1 ? `${parts[0]}.${parts.at(-1)}` : (parts[0] || 'instructor')
  const safe = base.replace(/^[^a-z]+/, '').slice(0, 36)
  return safe.length >= 3 ? safe : `instructor.${safe || 'user'}`
}

export async function suggestInstructorUsername(name, client) {
  const base = usernameBaseFromName(name)
  for (let suffix = 1; suffix <= 9999; suffix += 1) {
    const username = suffix === 1 ? base : `${base.slice(0, 40 - String(suffix).length)}${suffix}`
    if (RESERVED_USERNAME_SET.has(username)) continue
    if (!await findUserByUsername(username, client)) return username
  }
  throw new InstructorAccountError('A username could not be generated. Enter one manually.', 409, 'USERNAME_UNAVAILABLE')
}

function secureCharacter(characters) {
  return characters[randomInt(0, characters.length)]
}

export function generateTemporaryPassword(length = 18) {
  const safeLength = Math.max(14, Math.min(64, Number(length) || 18))
  const characters = Object.values(PASSWORD_SETS).map(secureCharacter)
  while (characters.length < safeLength) characters.push(secureCharacter(PASSWORD_ALPHABET))
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index + 1)
    ;[characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]]
  }
  return characters.join('')
}

export function validateTemporaryPassword(value) {
  const password = String(value || '')
  if (password.length < 14) return 'Temporary password must contain at least 14 characters.'
  if (password.length > 128) return 'Temporary password must contain no more than 128 characters.'
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return 'Temporary password must include uppercase, lowercase, number and symbol characters.'
  }
  return ''
}

function validateProfile({ name, email }) {
  if (String(name || '').trim().length < 2) throw new InstructorAccountError('Enter the instructor’s full name.')
  if (!EMAIL_PATTERN.test(String(email || '').trim())) throw new InstructorAccountError('Enter a valid email address.')
}

function assignedCoursesFromRow(row) {
  return Array.isArray(row.assigned_courses) ? row.assigned_courses : []
}

function instructorFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    role: row.role,
    roles: Array.isArray(row.roles) ? row.roles : [],
    status: row.status,
    mustChangePassword: Boolean(row.must_change_password),
    passwordUpdatedAt: row.password_updated_at,
    lastLogin: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    assignedCourses: assignedCoursesFromRow(row),
  }
}

const INSTRUCTOR_SELECT = `
  SELECT u.*,
    coalesce(
      jsonb_agg(
        jsonb_build_object('id', c.id, 'title', c.title, 'slug', c.slug, 'status', c.status)
        ORDER BY c.title
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'::jsonb
    ) AS assigned_courses
  FROM users u
  LEFT JOIN courses c ON c.instructor_id = u.id
`

export async function getInstructorAccount(instructorId, client) {
  const row = await queryOne(`${INSTRUCTOR_SELECT}
    WHERE u.id = $1 AND u.role = 'instructor'
    GROUP BY u.id
  `, [instructorId], client)
  return instructorFromRow(row)
}

export async function listInstructorAccounts(filters = {}) {
  const values = []
  const where = ["u.role = 'instructor'"]
  if (filters.status && filters.status !== 'all') {
    values.push(String(filters.status).toLowerCase())
    where.push(`u.status = $${values.length}`)
  }
  if (filters.search) {
    values.push(`%${String(filters.search).trim().toLowerCase()}%`)
    where.push(`(lower(u.name) LIKE $${values.length} OR lower(u.email) LIKE $${values.length} OR lower(u.username) LIKE $${values.length})`)
  }
  if (filters.courseId) {
    values.push(String(filters.courseId))
    where.push(`EXISTS (SELECT 1 FROM courses assigned WHERE assigned.instructor_id = u.id AND assigned.id = $${values.length})`)
  }
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(filters.limit, 10) || 25))
  const count = await queryOne(`SELECT count(*)::integer AS count FROM users u WHERE ${where.join(' AND ')}`, values)
  values.push(limit, (page - 1) * limit)
  const rows = await queryMany(`${INSTRUCTOR_SELECT}
    WHERE ${where.join(' AND ')}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `, values)
  return {
    instructors: rows.map(instructorFromRow),
    pagination: { page, limit, total: Number(count?.count || 0), pages: Math.max(1, Math.ceil(Number(count?.count || 0) / limit)) },
  }
}

async function validateCourseIds(courseIds, client) {
  const normalized = (Array.isArray(courseIds) ? courseIds : []).map(String).filter(Boolean)
  const unique = [...new Set(normalized)]
  if (unique.length !== normalized.length) throw new InstructorAccountError('A course was selected more than once.', 409, 'DUPLICATE_COURSE_ASSIGNMENT')
  if (!unique.length) return []
  const courses = await queryMany('SELECT id, title, instructor_id FROM courses WHERE id = ANY($1::text[]) AND status != $2', [unique, 'archived'], client)
  if (courses.length !== unique.length) throw new InstructorAccountError('One or more selected courses are unavailable.', 400, 'INVALID_COURSE')
  return courses
}

async function assignCourses(instructorId, courseIds, actorId, client) {
  const courses = await validateCourseIds(courseIds, client)
  for (const course of courses) {
    await client.query('UPDATE courses SET instructor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [instructorId, course.id])
    await recordAudit('instructor.course_assigned', actorId, 'user', instructorId, { courseId: course.id }, client)
  }
  return courses
}

export async function createInstructorAccount(input, actorId) {
  validateProfile(input)
  const email = String(input.email).trim().toLowerCase()
  const temporaryPassword = input.temporaryPassword || generateTemporaryPassword()
  const passwordError = validateTemporaryPassword(temporaryPassword)
  if (passwordError) throw new InstructorAccountError(passwordError)

  return transaction(async client => {
    if (await findUserByEmail(email, client)) throw new InstructorAccountError('An account with this email already exists.', 409, 'EMAIL_IN_USE')
    const username = input.username ? normalizeUsername(input.username) : await suggestInstructorUsername(input.name, client)
    const usernameError = validateInstructorUsername(username)
    if (usernameError) throw new InstructorAccountError(usernameError)
    if (await findUserByUsername(username, client)) throw new InstructorAccountError('This username is already in use.', 409, 'USERNAME_IN_USE')
    const passwordHash = await bcrypt.hash(temporaryPassword, Number(process.env.BCRYPT_COST || 12))
    const user = await createUser({
      name: String(input.name).trim(),
      email,
      username,
      passwordHash,
      role: 'instructor',
      roles: ['instructor'],
      mustChangePassword: true,
    }, client)
    await assignCourses(user.id, input.courseIds, actorId, client)
    await recordAudit('instructor.created', actorId, 'user', user.id, {
      username: user.username,
      email: user.email,
      courseIds: [...new Set(input.courseIds || [])],
      mustChangePassword: true,
    }, client)
    return {
      instructor: await getInstructorAccount(user.id, client),
      temporaryPassword,
    }
  })
}

async function requireInstructor(instructorId, client) {
  const user = await findUserById(instructorId, client)
  if (!user || user.role !== 'instructor' || !userHasRole(user, ['instructor'])) throw new InstructorAccountError('Instructor not found.', 404, 'INSTRUCTOR_NOT_FOUND')
  return user
}

export async function updateInstructorAccount(instructorId, updates, actorId) {
  return transaction(async client => {
    const existing = await requireInstructor(instructorId, client)
    const safeUpdates = {}
    if (updates.name !== undefined) safeUpdates.name = String(updates.name).trim()
    if (updates.email !== undefined) safeUpdates.email = String(updates.email).trim().toLowerCase()
    if (updates.username !== undefined) safeUpdates.username = normalizeUsername(updates.username)
    validateProfile({ name: safeUpdates.name ?? existing.name, email: safeUpdates.email ?? existing.email })
    if (safeUpdates.username !== undefined) {
      const usernameError = validateInstructorUsername(safeUpdates.username)
      if (usernameError) throw new InstructorAccountError(usernameError)
      const owner = await findUserByUsername(safeUpdates.username, client)
      if (owner && owner.id !== instructorId) throw new InstructorAccountError('This username is already in use.', 409, 'USERNAME_IN_USE')
    }
    if (safeUpdates.email !== undefined) {
      const owner = await findUserByEmail(safeUpdates.email, client)
      if (owner && owner.id !== instructorId) throw new InstructorAccountError('An account with this email already exists.', 409, 'EMAIL_IN_USE')
    }
    await updateUser(instructorId, safeUpdates, client)
    await recordAudit('instructor.profile_updated', actorId, 'user', instructorId, { fields: Object.keys(safeUpdates) }, client)
    return getInstructorAccount(instructorId, client)
  })
}

export async function setInstructorStatus(instructorId, status, actorId, { confirmFutureClasses = false } = {}) {
  if (!['active', 'suspended', 'archived'].includes(status)) throw new InstructorAccountError('Unsupported instructor status.')
  return transaction(async client => {
    const instructor = await requireInstructor(instructorId, client)
    if (status === 'archived' && !confirmFutureClasses) {
      const future = await queryOne(`
        SELECT count(*)::integer AS count FROM live_classes
        WHERE instructor_id = $1 AND scheduled_start > CURRENT_TIMESTAMP AND status IN ('draft', 'scheduled', 'live')
      `, [instructorId], client)
      if (Number(future?.count || 0) > 0) {
        throw new InstructorAccountError('This instructor owns future live classes. Confirm the archive after reassigning or reviewing them.', 409, 'FUTURE_LIVE_CLASSES')
      }
    }
    await updateUser(instructor.id, {
      status,
      archivedAt: status === 'archived' ? new Date().toISOString() : null,
      tokenVersion: instructor.tokenVersion + 1,
    }, client)
    if (status === 'archived') {
      const assigned = await queryMany('SELECT id FROM courses WHERE instructor_id = $1', [instructor.id], client)
      await client.query('UPDATE courses SET instructor_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE instructor_id = $1', [instructor.id])
      for (const course of assigned) {
        await recordAudit('instructor.course_removed', actorId, 'user', instructor.id, { courseId: course.id, reason: 'account_archived' }, client)
      }
    }
    const action = status === 'active' ? 'instructor.reactivated' : status === 'suspended' ? 'instructor.suspended' : 'instructor.archived'
    await recordAudit(action, actorId, 'user', instructor.id, {}, client)
    return getInstructorAccount(instructor.id, client)
  })
}

export async function resetInstructorPassword(instructorId, actorId, requestedPassword = '') {
  const temporaryPassword = requestedPassword || generateTemporaryPassword()
  const passwordError = validateTemporaryPassword(temporaryPassword)
  if (passwordError) throw new InstructorAccountError(passwordError)
  const instructor = await requireInstructor(instructorId)
  const passwordHash = await bcrypt.hash(temporaryPassword, Number(process.env.BCRYPT_COST || 12))
  const updated = await updateUserPassword(instructor.id, passwordHash, {
    mustChangePassword: true,
    actorId,
    auditAction: 'instructor.password_reset',
  })
  return { instructor: await getInstructorAccount(updated.id), temporaryPassword }
}

export async function replaceInstructorCourses(instructorId, courseIds, actorId, { confirmFutureClasses = false } = {}) {
  return transaction(async client => {
    const instructor = await requireInstructor(instructorId, client)
    if (instructor.status !== 'active') throw new InstructorAccountError('Reactivate the instructor before assigning courses.', 409, 'INSTRUCTOR_INACTIVE')
    const courses = await validateCourseIds(courseIds, client)
    const selectedIds = courses.map(course => course.id)
    const current = await queryMany('SELECT id, title FROM courses WHERE instructor_id = $1', [instructorId], client)
    const removed = current.filter(course => !selectedIds.includes(course.id))
    if (removed.length && !confirmFutureClasses) {
      const future = await queryOne(`
        SELECT count(*)::integer AS count FROM live_classes
        WHERE instructor_id = $1 AND course_id = ANY($2::text[])
          AND scheduled_start > CURRENT_TIMESTAMP AND status IN ('draft', 'scheduled', 'live')
      `, [instructorId, removed.map(course => course.id)], client)
      if (Number(future?.count || 0) > 0) {
        throw new InstructorAccountError('One or more removed courses have future live classes owned by this instructor.', 409, 'FUTURE_LIVE_CLASSES')
      }
    }
    if (removed.length) {
      await client.query('UPDATE courses SET instructor_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE instructor_id = $1 AND id = ANY($2::text[])', [instructorId, removed.map(course => course.id)])
      for (const course of removed) {
        await recordAudit('instructor.course_removed', actorId, 'user', instructorId, { courseId: course.id }, client)
      }
    }
    await assignCourses(instructorId, selectedIds, actorId, client)
    return getInstructorAccount(instructorId, client)
  })
}

export async function removeInstructorCourse(instructorId, courseId, actorId, { confirmFutureClasses = false } = {}) {
  return transaction(async client => {
    await requireInstructor(instructorId, client)
    const course = await queryOne('SELECT id, title FROM courses WHERE id = $1 AND instructor_id = $2', [courseId, instructorId], client)
    if (!course) throw new InstructorAccountError('Course assignment not found.', 404, 'ASSIGNMENT_NOT_FOUND')
    const future = await queryOne(`
      SELECT count(*)::integer AS count FROM live_classes
      WHERE instructor_id = $1 AND course_id = $2 AND scheduled_start > CURRENT_TIMESTAMP
        AND status IN ('draft', 'scheduled', 'live')
    `, [instructorId, courseId], client)
    if (Number(future?.count || 0) > 0 && !confirmFutureClasses) {
      throw new InstructorAccountError('This course has future live classes owned by the instructor.', 409, 'FUTURE_LIVE_CLASSES')
    }
    await client.query('UPDATE courses SET instructor_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND instructor_id = $2', [courseId, instructorId])
    await recordAudit('instructor.course_removed', actorId, 'user', instructorId, { courseId }, client)
    return getInstructorAccount(instructorId, client)
  })
}

export async function instructorUsernameAvailability(username, excludeUserId = null) {
  const normalized = normalizeUsername(username)
  const validationError = validateInstructorUsername(normalized)
  if (validationError) return { username: normalized, available: false, error: validationError }
  const owner = await findUserByUsername(normalized)
  return { username: normalized, available: !owner || owner.id === excludeUserId, error: owner && owner.id !== excludeUserId ? 'This username is already in use.' : '' }
}
