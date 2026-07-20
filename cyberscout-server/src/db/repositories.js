import { createHash, randomUUID } from 'node:crypto'
import { execute, queryMany, queryOne, transaction } from './index.js'
import { canonicalRoles, normalizeRole, rolesForUser, VALID_ROLES } from '../lib/roles.js'

export { VALID_ROLES }

function id(prefix) {
  return `${prefix}_${randomUUID()}`
}

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function parameter(values, value) {
  values.push(value)
  return `$${values.length}`
}

function inParameters(values, items) {
  return items.map(item => parameter(values, item)).join(', ')
}

async function countQuery(sql, values = [], client) {
  const row = await queryOne(sql, values, client)
  return Number(row?.count || 0)
}

function userFromRow(row) {
  if (!row) return null
  const roles = canonicalRoles(parseJson(row.roles, []), normalizeRole(row.role))
  const role = normalizeRole(row.role) || roles[0] || null
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    googleId: row.google_id,
    role,
    roles,
    status: row.status,
    tokenVersion: Number(row.token_version || 0),
    passwordUpdatedAt: row.password_updated_at,
    lastLogin: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function publicUser(user) {
  if (!user) return null
  const roles = rolesForUser(user)
  const role = normalizeRole(user.role) || roles[0] || null
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role,
    roles,
    status: user.status,
    hasPassword: Boolean(user.passwordHash),
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function courseFromRow(row, extra = {}) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    level: row.level,
    duration: row.duration,
    description: row.description,
    overview: row.overview,
    instructor: { name: row.instructor_name, title: row.instructor_title },
    instructorName: row.instructor_name,
    instructorTitle: row.instructor_title,
    instructorId: row.instructor_id || null,
    status: row.status,
    price: Number(row.price || 0),
    mode: row.mode || 'Online',
    credential: row.credential || 'Certificate of Completion',
    prerequisites: row.prerequisites || 'Basic computer and internet knowledge',
    brochureUrl: row.brochure_url,
    categorySlug: row.category_slug || slugify(row.category || 'Cybersecurity'),
    audience: parseJson(row.audience, []),
    outcomes: parseJson(row.outcomes, []),
    labs: parseJson(row.labs, []),
    moduleCount: Number(extra.moduleCount ?? row.module_count ?? 0),
    lessonCount: Number(extra.lessonCount ?? row.lesson_count ?? 0),
    materialCount: Number(extra.materialCount ?? row.material_count ?? 0),
    enrolled: Boolean(extra.enrolled ?? row.enrolled ?? false),
    progress: Number(extra.progress ?? row.progress ?? 0),
    currentLessonId: extra.currentLessonId ?? row.current_lesson_id ?? null,
    currentModule: Number(extra.currentModule ?? row.current_module ?? 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function moduleFromRow(row) {
  return { id: row.id, courseId: row.course_id, title: row.title, order: row.sort_order, lessons: [] }
}

function lessonFromRow(row, completed = false) {
  return {
    id: row.id,
    courseId: row.course_id,
    moduleId: row.module_id,
    title: row.title,
    duration: row.duration,
    content: row.content,
    order: row.sort_order,
    status: row.status,
    completed,
  }
}

function materialFromRow(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    lessonId: row.lesson_id,
    type: row.type,
    title: row.title,
    description: row.description,
    content: row.content,
    resourceUrl: row.resource_url,
    isPublic: Boolean(row.is_public),
    order: row.sort_order,
    createdAt: row.created_at,
  }
}

export async function findUserByEmail(email, client) {
  const normalized = String(email || '').trim().toLowerCase()
  return userFromRow(await queryOne('SELECT * FROM users WHERE lower(email) = $1', [normalized], client))
}

export async function findUserByUsername(username, client) {
  const normalized = String(username || '').trim().toLowerCase()
  if (!normalized) return null
  return userFromRow(await queryOne('SELECT * FROM users WHERE lower(username) = $1', [normalized], client))
}

export async function findUserByGoogleId(googleId, client) {
  return userFromRow(await queryOne('SELECT * FROM users WHERE google_id = $1', [googleId], client))
}

export async function findUserById(userId, client) {
  return userFromRow(await queryOne('SELECT * FROM users WHERE id = $1', [userId], client))
}

export async function listUsers() {
  const rows = await queryMany('SELECT * FROM users ORDER BY created_at DESC')
  return rows.map(userFromRow).map(publicUser)
}

export function userHasRole(user, allowedRoles) {
  const allowed = canonicalRoles(allowedRoles)
  return rolesForUser(user).some(role => allowed.includes(role))
}

export async function createUser({ name, email, username, passwordHash, googleId = null, role = 'student', roles = ['student'] }, client) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedUsername = username ? String(username).trim().toLowerCase() : null
  const primaryRole = normalizeRole(role)
  if (!primaryRole) throw new Error('Unsupported user role')
  const safeRoles = canonicalRoles(roles, primaryRole)
  if (!safeRoles.length) throw new Error('At least one supported user role is required')
  const userId = id('usr')
  await execute(`
    INSERT INTO users (id, name, username, email, password_hash, google_id, role, roles)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
  `, [userId, String(name || '').trim(), normalizedUsername, normalizedEmail, passwordHash, googleId, primaryRole, JSON.stringify(safeRoles)], client)
  return findUserById(userId, client)
}

export async function updateUser(userId, updates, client) {
  const allowed = {
    name: 'name', username: 'username', email: 'email', googleId: 'google_id', passwordHash: 'password_hash',
    role: 'role', roles: 'roles', status: 'status', lastLogin: 'last_login_at', tokenVersion: 'token_version', passwordUpdatedAt: 'password_updated_at',
  }
  const values = []
  const sets = []
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] === undefined) continue
    if (key === 'role') {
      const role = normalizeRole(updates[key])
      if (!role) throw new Error('Unsupported user role')
      sets.push(`${column} = ${parameter(values, role)}`)
      continue
    }
    if (key === 'roles') {
      const safeRoles = canonicalRoles(updates[key])
      if (!safeRoles.length) throw new Error('At least one supported user role is required')
      sets.push(`${column} = ${parameter(values, JSON.stringify(safeRoles))}::jsonb`)
      continue
    }
    const value = key === 'email' || key === 'username' ? String(updates[key]).trim().toLowerCase() : updates[key]
    sets.push(`${column} = ${parameter(values, value)}`)
  }
  if (!sets.length) return findUserById(userId, client)
  sets.push('updated_at = CURRENT_TIMESTAMP')
  const userParameter = parameter(values, userId)
  await execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ${userParameter}`, values, client)
  return findUserById(userId, client)
}

export async function updateUserPassword(userId, passwordHash) {
  await execute(`
    UPDATE users SET password_hash = $1, password_updated_at = CURRENT_TIMESTAMP,
      token_version = coalesce(token_version, 0) + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [passwordHash, userId])
  await recordAudit('auth.password_change', userId, 'user', userId, {})
  return findUserById(userId)
}

export async function assignRole(userId, role) {
  const normalizedRole = normalizeRole(role)
  if (!normalizedRole) throw new Error('Unsupported user role')
  const user = await findUserById(userId)
  if (!user) return null
  const roles = canonicalRoles(user.roles, normalizedRole)
  await execute('UPDATE users SET role = $1, roles = $2::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [normalizedRole, JSON.stringify(roles), userId])
  return findUserById(userId)
}

export async function suspendUser(userId) {
  return updateUser(userId, { status: 'suspended' })
}

const COURSE_COUNTS = `
  SELECT c.*,
    (SELECT count(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
    (SELECT count(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS lesson_count,
    (SELECT count(*) FROM course_materials cm WHERE cm.course_id = c.id) AS material_count
  FROM courses c
`

export async function listPublicCourses() {
  const rows = await queryMany(`${COURSE_COUNTS} WHERE c.status = 'published' ORDER BY c.created_at ASC`)
  return rows.map(courseFromRow)
}

export async function listCourses() {
  const rows = await queryMany(`${COURSE_COUNTS} ORDER BY c.created_at ASC`)
  return rows.map(courseFromRow)
}

export async function createCourse(input, actorId = null) {
  const courseId = input.id || id('crs')
  const title = String(input.title || '').trim()
  if (!title) throw new Error('Course title is required')
  const values = [
    courseId,
    input.slug || `${slugify(title)}-${courseId.slice(-6)}`,
    title,
    input.category || 'Cybersecurity',
    input.level || 'Beginner',
    input.duration || 'Self-paced',
    input.description || 'Course description pending.',
    input.overview || input.description || 'Course overview pending.',
    input.instructorName || input.instructor?.name || 'Cyber Lab IN Faculty',
    input.instructorTitle || input.instructor?.title || 'Cybersecurity Educators',
    input.status || 'draft',
    Number(input.price || 0),
    input.mode || 'Online',
    input.credential || 'Certificate of Completion',
    input.prerequisites || 'Basic computer and internet knowledge',
    input.brochureUrl || null,
    input.categorySlug || slugify(input.category || 'Cybersecurity'),
    JSON.stringify(input.audience || []),
    JSON.stringify(input.outcomes || []),
    JSON.stringify(input.labs || []),
    input.instructorId || null,
  ]
  await execute(`
    INSERT INTO courses (
      id, slug, title, category, level, duration, description, overview, instructor_name, instructor_title,
      status, price, mode, credential, prerequisites, brochure_url, category_slug, audience, outcomes, labs, instructor_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
      $18::jsonb, $19::jsonb, $20::jsonb, $21
    )
  `, values)
  await recordAudit('course.create', actorId, 'course', courseId, { title })
  return getCourseById(courseId)
}

export async function updateCourse(courseId, updates, actorId = null) {
  const allowed = {
    title: 'title', category: 'category', level: 'level', duration: 'duration', description: 'description', overview: 'overview',
    status: 'status', price: 'price', mode: 'mode', credential: 'credential', prerequisites: 'prerequisites',
    brochureUrl: 'brochure_url', categorySlug: 'category_slug', instructorId: 'instructor_id',
  }
  const values = []
  const sets = []
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] !== undefined) sets.push(`${column} = ${parameter(values, updates[key])}`)
  }
  for (const [key, column] of Object.entries({ audience: 'audience', outcomes: 'outcomes', labs: 'labs' })) {
    if (updates[key] !== undefined) sets.push(`${column} = ${parameter(values, JSON.stringify(Array.isArray(updates[key]) ? updates[key] : []))}::jsonb`)
  }
  if (updates.instructorName !== undefined || updates.instructor?.name !== undefined) {
    sets.push(`instructor_name = ${parameter(values, updates.instructorName || updates.instructor.name)}`)
  }
  if (updates.instructorTitle !== undefined || updates.instructor?.title !== undefined) {
    sets.push(`instructor_title = ${parameter(values, updates.instructorTitle || updates.instructor.title)}`)
  }
  if (!sets.length) return getCourseById(courseId)
  sets.push('updated_at = CURRENT_TIMESTAMP')
  const courseParameter = parameter(values, courseId)
  await execute(`UPDATE courses SET ${sets.join(', ')} WHERE id = ${courseParameter}`, values)
  await recordAudit('course.update', actorId, 'course', courseId, updates)
  return getCourseById(courseId)
}

export async function publishCourse(courseId, actorId = null) {
  return updateCourse(courseId, { status: 'published' }, actorId)
}

export async function archiveCourse(courseId, actorId = null) {
  return updateCourse(courseId, { status: 'archived' }, actorId)
}

export async function getPublicCourse(courseId) {
  const row = await queryOne(`${COURSE_COUNTS} WHERE c.id = $1 AND c.status = 'published'`, [courseId])
  if (!row) return null
  const course = courseFromRow(row)
  course.modules = await listCourseModules(courseId, null, { publicOnly: true })
  return course
}

export async function getPublicCourseBySlug(categorySlug, courseSlug) {
  const row = await queryOne(`${COURSE_COUNTS} WHERE c.category_slug = $1 AND c.slug = $2 AND c.status = 'published'`, [categorySlug, courseSlug])
  if (!row) return null
  const course = courseFromRow(row)
  course.modules = await listCourseModules(course.id, null, { publicOnly: true })
  course.materials = (await listCourseMaterials(course.id)).filter(material => material.isPublic)
  return course
}

export async function getCourseById(courseId, client) {
  return courseFromRow(await queryOne(`${COURSE_COUNTS} WHERE c.id = $1`, [courseId], client))
}

export async function hasActiveEnrollment(userId, courseId, batchId = null, client) {
  const values = [userId, courseId]
  const batchClause = batchId ? ` AND batch_id = ${parameter(values, batchId)}` : ''
  return Boolean(await queryOne(`SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2${batchClause} AND status = 'active'`, values, client))
}

export async function canReadCourse(user, courseId, allowedRoles = []) {
  if (!user || !courseId) return false
  if (userHasRole(user, ['admin', 'super_admin', 'support', ...allowedRoles])) return true
  if (userHasRole(user, ['instructor']) && allowedRoles.includes('instructor')) return true
  return hasActiveEnrollment(user.id, courseId)
}

export async function enrollUser(userId, courseId, source = 'self_service', batchId = null, client) {
  if (!await findUserById(userId, client)) throw new Error('User not found')
  const course = await getCourseById(courseId, client)
  if (!course || course.status !== 'published') throw new Error('Course not found')
  const existing = await queryOne('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId], client)
  let enrollmentId
  if (existing) {
    enrollmentId = existing.id
    await execute("UPDATE enrollments SET status = 'active', batch_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [batchId, existing.id], client)
  } else {
    enrollmentId = id('enr')
    await execute('INSERT INTO enrollments (id, user_id, course_id, batch_id, source) VALUES ($1, $2, $3, $4, $5)', [enrollmentId, userId, courseId, batchId, source], client)
  }
  const firstLesson = await queryOne("SELECT id FROM lessons WHERE course_id = $1 AND status = 'published' ORDER BY sort_order ASC LIMIT 1", [courseId], client)
  if (firstLesson) await upsertProgress(userId, courseId, firstLesson.id, 0, client)
  return getEnrollment(enrollmentId, client)
}

export async function addEnrollment({ userId, courseId, batchId = null, source = 'manual' }) {
  return enrollUser(userId, courseId, source, batchId)
}

export async function getEnrollment(enrollmentId, client) {
  return queryOne(`
    SELECT e.*, u.name AS user_name, u.email AS user_email, c.title AS course_title
    FROM enrollments e JOIN users u ON u.id = e.user_id JOIN courses c ON c.id = e.course_id
    WHERE e.id = $1
  `, [enrollmentId], client)
}

export async function listEnrollmentsByUser(userId) {
  return queryMany(`
    SELECT e.*, c.title AS course_title, c.slug AS course_slug
    FROM enrollments e JOIN courses c ON c.id = e.course_id
    WHERE e.user_id = $1 ORDER BY e.enrolled_at DESC
  `, [userId])
}

export async function listEnrollmentsByCourse(courseId) {
  return queryMany(`
    SELECT e.*, u.name AS user_name, u.email AS user_email
    FROM enrollments e JOIN users u ON u.id = e.user_id
    WHERE e.course_id = $1 ORDER BY e.enrolled_at DESC
  `, [courseId])
}

export async function listAllEnrollments() {
  return queryMany(`
    SELECT e.*, u.name AS user_name, u.email AS user_email, c.title AS course_title
    FROM enrollments e JOIN users u ON u.id = e.user_id JOIN courses c ON c.id = e.course_id
    ORDER BY e.enrolled_at DESC
  `)
}

async function courseProgress(userId, courseId) {
  const total = await countQuery("SELECT count(*) FROM lessons WHERE course_id = $1 AND status = 'published'", [courseId])
  if (!total) return 0
  const complete = await countQuery('SELECT count(*) FROM user_progress WHERE user_id = $1 AND course_id = $2 AND completion_percentage >= 100', [userId, courseId])
  return Math.round((complete / total) * 100)
}

async function currentLesson(userId, courseId) {
  return queryOne(`
    SELECT l.id, m.sort_order AS module_order
    FROM lessons l JOIN course_modules m ON m.id = l.module_id
    LEFT JOIN user_progress p ON p.lesson_id = l.id AND p.user_id = $1
    WHERE l.course_id = $2 AND l.status = 'published' AND coalesce(p.completion_percentage, 0) < 100
    ORDER BY m.sort_order ASC, l.sort_order ASC LIMIT 1
  `, [userId, courseId])
}

export async function listEnrolledCourses(userId) {
  const rows = await queryMany(`${COURSE_COUNTS}
    JOIN enrollments e ON e.course_id = c.id
    WHERE e.user_id = $1 AND e.status = 'active'
    ORDER BY e.enrolled_at DESC
  `, [userId])
  return Promise.all(rows.map(async row => {
    const [lesson, progress] = await Promise.all([currentLesson(userId, row.id), courseProgress(userId, row.id)])
    return courseFromRow(row, { enrolled: true, progress, currentLessonId: lesson?.id ?? null, currentModule: lesson?.module_order ?? 1 })
  }))
}

export async function listCourseModules(courseId, userId = null, { publicOnly = false } = {}) {
  const moduleRows = await queryMany('SELECT * FROM course_modules WHERE course_id = $1 ORDER BY sort_order ASC', [courseId])
  const modules = moduleRows.map(moduleFromRow)
  const lessons = await queryMany(`
    SELECT l.*, p.completion_percentage
    FROM lessons l LEFT JOIN user_progress p ON p.lesson_id = l.id AND p.user_id = $1
    WHERE l.course_id = $2 AND l.status = 'published' ORDER BY l.sort_order ASC
  `, [userId || '', courseId])
  const byModule = new Map(modules.map(module => [module.id, module]))
  for (const lesson of lessons) {
    const target = byModule.get(lesson.module_id)
    if (target) target.lessons.push(lessonFromRow(lesson, !publicOnly && Number(lesson.completion_percentage || 0) >= 100))
  }
  return modules
}

export async function getCourseForUser(courseId, user) {
  const course = await getCourseById(courseId)
  if (!course || course.status !== 'published') return null
  const enrolled = user ? await hasActiveEnrollment(user.id, courseId) : false
  const elevated = user ? userHasRole(user, ['admin', 'super_admin', 'instructor', 'support']) : false
  const canViewPrivate = enrolled || elevated
  const [lesson, modules, allMaterials] = await Promise.all([
    user ? currentLesson(user.id, courseId) : null,
    listCourseModules(courseId, canViewPrivate ? user.id : null, { publicOnly: !canViewPrivate }),
    listCourseMaterials(courseId),
  ])
  return {
    ...course,
    enrolled,
    progress: user && enrolled ? await courseProgress(user.id, courseId) : 0,
    currentLessonId: lesson?.id ?? null,
    currentModule: lesson?.module_order ?? 1,
    modules,
    materials: canViewPrivate ? allMaterials : allMaterials.filter(material => material.isPublic),
    lockedMaterialCount: canViewPrivate ? 0 : allMaterials.filter(material => !material.isPublic).length,
  }
}

export async function listCourseMaterials(courseId) {
  const rows = await queryMany('SELECT * FROM course_materials WHERE course_id = $1 ORDER BY sort_order ASC', [courseId])
  return rows.map(materialFromRow)
}

export async function listCourseMaterialsForUser(user, courseId, reqMeta = {}) {
  if (!await canReadCourse(user, courseId, ['instructor'])) {
    return { allowed: false, materials: (await listCourseMaterials(courseId)).filter(material => material.isPublic) }
  }
  const materials = await listCourseMaterials(courseId)
  await Promise.all(materials.filter(material => material.type === 'pdf').map(material => recordDocumentAccess({
    userId: user.id, courseId, materialId: material.id, event: 'metadata_view', ...reqMeta,
  })))
  return { allowed: true, materials }
}

export async function upsertProgress(userId, courseId, lessonId, completionPercentage, client) {
  const safePercentage = Math.max(0, Math.min(100, Number(completionPercentage) || 0))
  const progressId = id('prg')
  const row = await queryOne(`
    INSERT INTO user_progress (id, user_id, course_id, lesson_id, completion_percentage, completed_at)
    VALUES ($1, $2, $3, $4, $5, CASE WHEN $5 >= 100 THEN CURRENT_TIMESTAMP ELSE NULL END)
    ON CONFLICT (user_id, course_id, lesson_id) DO UPDATE SET
      completion_percentage = EXCLUDED.completion_percentage,
      completed_at = CASE WHEN EXCLUDED.completion_percentage >= 100 THEN CURRENT_TIMESTAMP ELSE user_progress.completed_at END,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id
  `, [progressId, userId, courseId, lessonId, safePercentage], client)
  return row.id
}

export async function getStudentDashboard(userId) {
  const enrolledCourses = await listEnrolledCourses(userId)
  const enrolledCourseIds = enrolledCourses.map(course => course.id)
  const values = []
  const materialsCount = enrolledCourseIds.length
    ? await countQuery(`SELECT count(*) FROM course_materials WHERE course_id IN (${inParameters(values, enrolledCourseIds)})`, values)
    : 0
  const completedCourses = enrolledCourses.filter(course => course.progress >= 100).length
  const nextCourse = enrolledCourses.find(course => course.currentLessonId) || enrolledCourses[0] || null
  const [recommendedCourses, liveClasses] = await Promise.all([listPublicCourses(), listUpcomingLiveClasses(userId)])
  return {
    enrolledCourses,
    recommendedCourses: recommendedCourses.filter(course => !enrolledCourseIds.includes(course.id)),
    summary: {
      enrolledCourses: enrolledCourses.length,
      completedCourses,
      materialsAvailable: materialsCount,
      averageProgress: enrolledCourses.length
        ? Math.round(enrolledCourses.reduce((total, course) => total + course.progress, 0) / enrolledCourses.length)
        : 0,
    },
    activeCourse: nextCourse,
    liveClasses,
  }
}

export async function getCourseLeaderboard(courseId, limit = 25) {
  const rows = await queryMany(`
    SELECT u.id AS "userId", u.name, u.email, e.course_id AS "courseId",
      round(avg(coalesce(p.completion_percentage, 0))) AS progress,
      count(*) FILTER (WHERE coalesce(p.completion_percentage, 0) >= 100) AS "completedLessons"
    FROM enrollments e JOIN users u ON u.id = e.user_id
    LEFT JOIN user_progress p ON p.user_id = e.user_id AND p.course_id = e.course_id
    WHERE e.course_id = $1 AND e.status = 'active'
    GROUP BY u.id, u.name, u.email, e.course_id
    HAVING avg(coalesce(p.completion_percentage, 0)) > 0
      OR count(*) FILTER (WHERE coalesce(p.completion_percentage, 0) >= 100) > 0
    ORDER BY progress DESC, "completedLessons" DESC, u.name ASC LIMIT $2
  `, [courseId, Number(limit) || 25])
  return rows.map((row, index) => ({
    rank: index + 1,
    ...row,
    progress: Number(row.progress || 0),
    completedLessons: Number(row.completedLessons || 0),
    score: Number(row.progress || 0),
  }))
}

export async function getInstructorDashboard(instructorId) {
  const assignedRows = await queryMany(`${COURSE_COUNTS}
    WHERE c.status = 'published' AND c.instructor_id = $1 ORDER BY c.created_at ASC
  `, [instructorId])
  const assignedCourses = assignedRows.map(courseFromRow)
  const courseIds = assignedCourses.map(course => course.id)
  if (!courseIds.length) {
    return { instructorId, assignedCourses, students: [], attendance: [], labAttempts: [], quizResults: [], progress: [] }
  }
  const values = []
  const courseList = inParameters(values, courseIds)
  const [students, progress, attendance, labAttempts, quizResults] = await Promise.all([
    queryMany(`SELECT DISTINCT u.id, u.name, u.email FROM enrollments e JOIN users u ON u.id = e.user_id WHERE e.course_id IN (${courseList}) AND e.status = 'active' ORDER BY u.name ASC`, values),
    queryMany(`SELECT p.id, p.user_id AS "userId", p.course_id AS "courseId", p.lesson_id AS "lessonId", p.completion_percentage AS "completionPercentage", p.updated_at AS "updatedAt" FROM user_progress p WHERE p.course_id IN (${courseList}) ORDER BY p.updated_at DESC LIMIT 50`, values),
    queryMany(`SELECT a.id, a.live_class_id AS "liveClassId", a.user_id AS "userId", a.event, a.created_at AS "createdAt", lc.course_id AS "courseId" FROM live_class_attendance a JOIN live_classes lc ON lc.id = a.live_class_id WHERE lc.course_id IN (${courseList}) ORDER BY a.created_at DESC LIMIT 100`, values),
    queryMany(`SELECT id, lab_id AS "labId", course_id AS "courseId", user_id AS "userId", status, score, started_at AS "startedAt", submitted_at AS "submittedAt" FROM lab_attempts WHERE course_id IN (${courseList}) ORDER BY started_at DESC LIMIT 100`, values),
    queryMany(`SELECT id, quiz_id AS "quizId", course_id AS "courseId", user_id AS "userId", score, submitted_at AS "submittedAt" FROM quiz_attempts WHERE course_id IN (${courseList}) ORDER BY submitted_at DESC LIMIT 100`, values),
  ])
  return { instructorId, assignedCourses, students, attendance, labAttempts, quizResults, progress }
}

export async function getSalesDashboard() {
  const [leads, followUps, visitorAnalytics, courseWise] = await Promise.all([
    listLeads(),
    listFollowUps(),
    getVisitorStats(),
    queryMany(`
      SELECT coalesce(c.title, 'Unspecified') AS course, count(*)::integer AS count
      FROM leads l LEFT JOIN courses c ON c.id = l.course_id
      GROUP BY coalesce(c.title, 'Unspecified') ORDER BY count(*) DESC
    `),
  ])
  const stages = leads.reduce((acc, lead) => ({ ...acc, [lead.status]: (acc[lead.status] || 0) + 1 }), {})
  const sources = leads.reduce((acc, lead) => ({ ...acc, [lead.source]: (acc[lead.source] || 0) + 1 }), {})
  const suggestions = []
  const newLeads = stages.new || 0
  const callbackLeads = leads.filter(lead => /call|callback|counsellor/i.test(`${lead.message} ${lead.source}`)).length
  if (newLeads > 0) suggestions.push(`${newLeads} new lead${newLeads === 1 ? '' : 's'} need first contact.`)
  if (callbackLeads > 0) suggestions.push(`${callbackLeads} lead${callbackLeads === 1 ? '' : 's'} asked for a callback or counsellor contact.`)
  return { leads, followUps, visitorAnalytics, analytics: { totalLeads: leads.length, stages, sources, courseWise, suggestions } }
}

export async function getOpsDashboard() {
  const [labRows, labAttempts, liveClassAttendance, documentAccessLogs, labs, activeAttempts] = await Promise.all([
    queryMany("SELECT * FROM labs WHERE status != 'archived' ORDER BY created_at DESC LIMIT 100"),
    queryMany('SELECT id, lab_id AS "labId", course_id AS "courseId", user_id AS "userId", status, score, started_at AS "startedAt", submitted_at AS "submittedAt" FROM lab_attempts ORDER BY started_at DESC LIMIT 100'),
    queryMany('SELECT id, live_class_id AS "liveClassId", user_id AS "userId", event, created_at AS "createdAt" FROM live_class_attendance ORDER BY created_at DESC LIMIT 100'),
    listDocumentAccessLogs(100),
    countQuery("SELECT count(*) FROM labs WHERE status != 'archived'"),
    countQuery("SELECT count(*) FROM lab_attempts WHERE status = 'started'"),
  ])
  return {
    labs: labRows.map(labFromRow),
    labAttempts,
    liveClassAttendance,
    documentAccessLogs,
    systemHealth: { status: 'ok', store: 'postgresql', labs, activeAttempts, generatedAt: new Date().toISOString() },
  }
}

export async function listUpcomingLiveClasses(userId) {
  return queryMany(`
    SELECT lc.*, c.title AS course_title FROM live_classes lc
    JOIN enrollments e ON e.course_id = lc.course_id AND e.user_id = $1 AND e.status = 'active'
    JOIN courses c ON c.id = lc.course_id
    WHERE lc.status = 'scheduled' AND lc.scheduled_end >= CURRENT_TIMESTAMP
      AND (lc.batch_id IS NULL OR lc.batch_id = e.batch_id)
    ORDER BY lc.scheduled_start ASC LIMIT 10
  `, [userId])
}

export async function listUpcomingLiveClassesForUser(userId) {
  return listUpcomingLiveClasses(userId)
}

function liveClassFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.course_title,
    batchId: row.batch_id,
    instructorId: row.instructor_id,
    instructor: row.instructor_name || 'Cyber Lab IN Instructor',
    instructorTitle: row.instructor_title || 'Instructor',
    title: row.title,
    description: row.description || '',
    agenda: row.agenda || '',
    provider: row.provider,
    joinUrl: row.join_url,
    embedUrl: row.embed_url,
    meetingUrl: row.meeting_url || row.join_url,
    googleConnectionId: row.google_connection_id,
    googleSpaceName: row.google_space_name,
    googleMeetingCode: row.google_meeting_code,
    timezone: row.timezone || 'Asia/Kolkata',
    recordingUrl: row.recording_url,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    startAt: row.start_at || row.scheduled_start,
    endAt: row.end_at || row.scheduled_end,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function createLiveClass(input, actorId = null) {
  const classId = input.id || id('live')
  await execute(`
    INSERT INTO live_classes (
      id, course_id, batch_id, cohort_id, instructor_id, title, description, agenda, provider, join_url, embed_url,
      meeting_url, scheduled_start, scheduled_end, start_at, end_at, timezone, status
    )
    VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $12, $13, $14, $15)
  `, [
    classId, input.courseId, input.batchId || input.cohortId || null, input.instructorId || actorId || null,
    input.title, input.description || null, input.agenda || null, input.provider || 'manual',
    input.joinUrl || input.meetingUrl || null, input.embedUrl || null, input.meetingUrl || input.joinUrl || null,
    input.scheduledStart || input.startAt, input.scheduledEnd || input.endAt, input.timezone || 'Asia/Kolkata',
    input.status || 'scheduled',
  ])
  await recordAudit('live_class.create', actorId, 'live_class', classId, { courseId: input.courseId })
  return getLiveClassById(classId)
}

export async function updateLiveClass(liveClassId, updates, actorId = null) {
  const allowed = {
    title: 'title', description: 'description', agenda: 'agenda', provider: 'provider', joinUrl: 'join_url',
    embedUrl: 'embed_url', meetingUrl: 'meeting_url', scheduledStart: 'scheduled_start', scheduledEnd: 'scheduled_end',
    startAt: 'start_at', endAt: 'end_at', timezone: 'timezone', status: 'status', recordingUrl: 'recording_url',
    googleConnectionId: 'google_connection_id', googleSpaceName: 'google_space_name', googleMeetingCode: 'google_meeting_code',
  }
  const values = []
  const sets = []
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] !== undefined) sets.push(`${column} = ${parameter(values, updates[key])}`)
  }
  if (!sets.length) return getLiveClassById(liveClassId)
  sets.push('updated_at = CURRENT_TIMESTAMP')
  const liveParameter = parameter(values, liveClassId)
  await execute(`UPDATE live_classes SET ${sets.join(', ')} WHERE id = ${liveParameter}`, values)
  await recordAudit('live_class.update', actorId, 'live_class', liveClassId, updates)
  return getLiveClassById(liveClassId)
}

function googleConnectionFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    googleSubject: row.google_subject,
    googleEmail: row.google_email,
    googleName: row.google_name,
    googleAvatarUrl: row.google_avatar_url,
    encryptedAccessToken: row.encrypted_access_token,
    encryptedRefreshToken: row.encrypted_refresh_token,
    tokenExpiry: row.token_expiry,
    grantedScopes: parseJson(row.granted_scopes, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    revokedAt: row.revoked_at,
  }
}

export async function getGoogleConnectionByUserId(userId) {
  return googleConnectionFromRow(await queryOne('SELECT * FROM google_connections WHERE user_id = $1 AND revoked_at IS NULL', [userId]))
}

export async function getGoogleConnectionBySubject(subject) {
  return googleConnectionFromRow(await queryOne('SELECT * FROM google_connections WHERE google_subject = $1 AND revoked_at IS NULL', [subject]))
}

export async function upsertGoogleConnection(input, actorId = null) {
  const connectionId = input.id || id('gcon')
  const row = await queryOne(`
    INSERT INTO google_connections (
      id, user_id, google_subject, google_email, google_name, google_avatar_url,
      encrypted_access_token, encrypted_refresh_token, token_expiry, granted_scopes, revoked_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NULL)
    ON CONFLICT(user_id) DO UPDATE SET
      google_subject = excluded.google_subject,
      google_email = excluded.google_email,
      google_name = excluded.google_name,
      google_avatar_url = excluded.google_avatar_url,
      encrypted_access_token = excluded.encrypted_access_token,
      encrypted_refresh_token = COALESCE(excluded.encrypted_refresh_token, google_connections.encrypted_refresh_token),
      token_expiry = excluded.token_expiry,
      granted_scopes = excluded.granted_scopes,
      revoked_at = NULL,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `, [
    connectionId, input.userId, input.googleSubject, input.googleEmail, input.googleName || null, input.googleAvatarUrl || null,
    input.encryptedAccessToken || null, input.encryptedRefreshToken || null, input.tokenExpiry || null,
    JSON.stringify(input.grantedScopes || []),
  ])
  await recordAudit('google.connection_upsert', actorId || input.userId, 'user', input.userId, { googleSubject: input.googleSubject })
  return googleConnectionFromRow(row)
}

export async function updateGoogleConnectionTokens(connectionId, updates) {
  const row = await queryOne(`
    UPDATE google_connections SET encrypted_access_token = $1, encrypted_refresh_token = COALESCE($2, encrypted_refresh_token),
      token_expiry = $3, granted_scopes = $4::jsonb, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5 RETURNING *
  `, [updates.encryptedAccessToken, updates.encryptedRefreshToken || null, updates.tokenExpiry, JSON.stringify(updates.grantedScopes || []), connectionId])
  return googleConnectionFromRow(row)
}

export async function disconnectGoogleConnection(userId, actorId = null) {
  const row = await queryOne('UPDATE google_connections SET revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL RETURNING *', [userId])
  if (row) await recordAudit('google.disconnect', actorId || userId, 'user', userId, {})
  return googleConnectionFromRow(row)
}

export async function getLiveClassById(liveClassId) {
  return liveClassFromRow(await queryOne(`
    SELECT lc.*, c.title AS course_title, u.name AS instructor_name, u.role AS instructor_title
    FROM live_classes lc JOIN courses c ON c.id = lc.course_id LEFT JOIN users u ON u.id = lc.instructor_id
    WHERE lc.id = $1
  `, [liveClassId]))
}

export async function listLiveClassesByCourse(courseId) {
  const rows = await queryMany(`
    SELECT lc.*, c.title AS course_title, u.name AS instructor_name, u.role AS instructor_title
    FROM live_classes lc JOIN courses c ON c.id = lc.course_id LEFT JOIN users u ON u.id = lc.instructor_id
    WHERE lc.course_id = $1 ORDER BY lc.scheduled_start ASC
  `, [courseId])
  return rows.map(liveClassFromRow)
}

export async function recordLiveEvent(liveClassId, userId, event) {
  return queryOne(`
    INSERT INTO live_class_attendance (id, live_class_id, user_id, event)
    VALUES ($1, $2, $3, $4)
    RETURNING id, live_class_id AS "liveClassId", user_id AS "userId", event, created_at AS "createdAt"
  `, [id('att'), liveClassId, userId, event])
}

export async function getViewerCount(liveClassId) {
  const row = await queryOne(`
    SELECT greatest(0,
      count(*) FILTER (WHERE event = 'join') - count(*) FILTER (WHERE event = 'leave')
    )::integer AS count FROM live_class_attendance WHERE live_class_id = $1
  `, [liveClassId])
  return Number(row?.count || 0)
}

export async function listAttendance({ liveClassId }) {
  return queryMany(`
    SELECT a.id, a.live_class_id AS "liveClassId", a.user_id AS "userId", u.email AS "userEmail", a.event, a.created_at AS "createdAt"
    FROM live_class_attendance a JOIN users u ON u.id = a.user_id
    WHERE a.live_class_id = $1 ORDER BY a.created_at DESC
  `, [liveClassId])
}

function visitorFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    visitorId: row.visitor_id,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    visits: Number(row.visits || 0),
    consentAnalytics: Boolean(row.consent_analytics),
    consentMarketing: Boolean(row.consent_marketing),
  }
}

function hashIp(ipAddress = '') {
  const salt = process.env.VISITOR_HASH_SALT || process.env.JWT_SECRET || 'cyberlabin-local-salt'
  return createHash('sha256').update(`${salt}:${ipAddress || ''}`).digest('hex')
}

export async function recordVisitor({ visitorId, ipAddress, userAgent, consentAnalytics = false, consentMarketing = false }) {
  const safeVisitorId = visitorId || id('visitor')
  const row = await queryOne(`
    INSERT INTO visitor_analytics (id, visitor_id, consent_analytics, consent_marketing, user_agent, ip_hash)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (visitor_id) DO UPDATE SET
      last_seen_at = CURRENT_TIMESTAMP,
      visits = visitor_analytics.visits + 1,
      consent_analytics = visitor_analytics.consent_analytics OR EXCLUDED.consent_analytics,
      consent_marketing = visitor_analytics.consent_marketing OR EXCLUDED.consent_marketing,
      user_agent = EXCLUDED.user_agent
    RETURNING *
  `, [id('vis'), safeVisitorId, Boolean(consentAnalytics), Boolean(consentMarketing), userAgent || null, hashIp(ipAddress)])
  return visitorFromRow(row)
}

export async function recordCookieConsent({ visitorId, necessary = true, analytics = false, marketing = false }) {
  if (!visitorId) throw new Error('visitorId is required')
  await recordVisitor({ visitorId, consentAnalytics: analytics, consentMarketing: marketing })
  const row = await queryOne(`
    INSERT INTO cookie_consents (id, visitor_id, necessary, analytics, marketing)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (visitor_id) DO UPDATE SET
      necessary = EXCLUDED.necessary, analytics = EXCLUDED.analytics,
      marketing = EXCLUDED.marketing, updated_at = CURRENT_TIMESTAMP
    RETURNING id
  `, [id('consent'), visitorId, Boolean(necessary), Boolean(analytics), Boolean(marketing)])
  return row.id
}

export async function getVisitorStats() {
  const row = await queryOne(`
    SELECT
      count(*)::integer AS total,
      count(*) FILTER (WHERE first_seen_at >= CURRENT_DATE)::integer AS today,
      count(*) FILTER (WHERE first_seen_at >= CURRENT_TIMESTAMP - INTERVAL '7 days')::integer AS week,
      count(*) FILTER (WHERE first_seen_at >= CURRENT_TIMESTAMP - INTERVAL '30 days')::integer AS month
    FROM visitor_analytics
  `)
  return { totalUniqueVisitors: row.total, visitorsToday: row.today, visitorsThisWeek: row.week, visitorsThisMonth: row.month }
}

export async function getAdminAnalytics() {
  const [counts, visitors] = await Promise.all([
    queryOne(`
      SELECT
        (SELECT count(*) FROM users)::integer AS users,
        (SELECT count(*) FROM courses WHERE status = 'published')::integer AS courses,
        (SELECT count(*) FROM enrollments WHERE status = 'active')::integer AS enrollments,
        (SELECT count(*) FROM course_materials)::integer AS materials,
        (SELECT count(*) FROM document_access_logs)::integer AS "documentAccesses",
        (SELECT count(*) FROM leads)::integer AS leads,
        (SELECT count(*) FROM payment_intents)::integer AS payments,
        (SELECT count(*) FROM live_class_attendance)::integer AS "liveAttendanceEvents",
        (SELECT count(*) FROM lab_attempts)::integer AS "labAttempts",
        (SELECT count(*) FROM ai_chat_messages)::integer AS "aiMessages",
        (SELECT count(*) FROM analytics_events)::integer AS "analyticsEvents"
    `),
    getVisitorStats(),
  ])
  return { ...counts, visitors }
}

export async function recordAnalyticsEvent({ event, userId = null, visitorId = null, path = '', properties = {} }) {
  const eventId = id('evt')
  await execute(`
    INSERT INTO analytics_events (id, event, user_id, visitor_id, path, properties)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
  `, [eventId, event, userId || null, visitorId || null, String(path || '').slice(0, 300), JSON.stringify(properties)])
  return { id: eventId, event }
}

export async function recordAudit(action, actorId, entityType, entityId, metadata = {}, client) {
  await execute(`
    INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
  `, [id('aud'), actorId || null, action, entityType, entityId || null, JSON.stringify(metadata)], client)
}

export async function countAuditActionsSince(actorId, action, entityId, sinceIso) {
  return countQuery('SELECT count(*) FROM audit_logs WHERE actor_id = $1 AND action = $2 AND entity_id = $3 AND created_at >= $4', [actorId, action, entityId, sinceIso])
}

export async function createAiSession(userId, courseId, title = 'Course chat') {
  const sessionId = id('ais')
  await execute('INSERT INTO ai_chat_sessions (id, user_id, course_id, title) VALUES ($1, $2, $3, $4)', [sessionId, userId, courseId, title])
  return getAiSession(sessionId, userId, courseId)
}

export async function getAiSession(sessionId, userId, courseId) {
  return queryOne(`
    SELECT id, user_id AS "userId", course_id AS "courseId", title, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM ai_chat_sessions WHERE id = $1 AND user_id = $2 AND course_id = $3
  `, [sessionId, userId, courseId])
}

export async function listAiSessions(userId, courseId) {
  return queryMany(`
    SELECT id, user_id AS "userId", course_id AS "courseId", title, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM ai_chat_sessions WHERE user_id = $1 AND course_id = $2 ORDER BY updated_at DESC
  `, [userId, courseId])
}

export async function addAiMessage(sessionId, userId, courseId, role, content, citations = []) {
  if (!await getAiSession(sessionId, userId, courseId)) throw new Error('AI chat session not found')
  const messageId = id('aim')
  const row = await queryOne(`
    INSERT INTO ai_chat_messages (id, session_id, user_id, course_id, role, content, citations)
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    RETURNING created_at
  `, [messageId, sessionId, userId, courseId, role, content, JSON.stringify(citations)])
  await execute('UPDATE ai_chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [sessionId])
  return { id: messageId, sessionId, userId, courseId, role, content, citations, createdAt: row.created_at }
}

export async function listAiMessages(sessionId, userId, courseId) {
  const rows = await queryMany(`
    SELECT id, session_id AS "sessionId", user_id AS "userId", course_id AS "courseId", role, content, citations, created_at AS "createdAt"
    FROM ai_chat_messages WHERE session_id = $1 AND user_id = $2 AND course_id = $3 ORDER BY created_at ASC
  `, [sessionId, userId, courseId])
  return rows.map(message => ({ ...message, citations: parseJson(message.citations, []) }))
}

function leadFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    courseId: row.course_id,
    courseTitle: row.course_title,
    source: row.source,
    stage: row.stage,
    status: row.stage,
    ownerId: row.owner_id,
    visitorId: row.visitor_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const VALID_LEAD_STAGES = ['new', 'contacted', 'converted', 'closed']
const VALID_LEAD_SOURCES = ['landing_form', 'chatbot', 'course_popup', 'course_page', 'course_waitlist', 'locked_prompt', 'website']

function normalizeLeadStage(value = 'new') {
  const normalized = String(value || 'new').trim().toLowerCase()
  return VALID_LEAD_STAGES.includes(normalized) ? normalized : 'new'
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').slice(0, 18)
}

export async function createLead({
  name = '', phone = '', email, message = '', courseId = null, source = 'landing_form',
  visitorId = null, ipAddress = null, userAgent = null,
}) {
  const normalizedName = String(name || '').trim()
  if (normalizedName.length < 2) throw new Error('Name is required')
  if (normalizedName.length > 100) throw new Error('Name must be 100 characters or fewer')
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error('Enter a valid email address')
  if (normalizedEmail.length > 254) throw new Error('Email address is too long')
  const normalizedPhone = normalizePhone(phone)
  if (normalizedPhone.replace(/\D/g, '').length < 7) throw new Error('Enter a valid phone number')
  const safeMessage = String(message || '').trim()
  if (safeMessage.length < 5) throw new Error('Message is required')
  if (safeMessage.length > 2000) throw new Error('Message must be 2000 characters or fewer')
  const safeSource = VALID_LEAD_SOURCES.includes(source) ? source : 'website'
  const recentDuplicate = await queryOne(`
    SELECT id FROM leads WHERE lower(email) = $1 AND phone = $2 AND source = $3
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '15 minutes' LIMIT 1
  `, [normalizedEmail, normalizedPhone, safeSource])
  if (recentDuplicate) throw new Error('We already received this request recently. Please wait a few minutes before submitting again.')
  const leadId = id('lead')
  await execute(`
    INSERT INTO leads (id, name, phone, email, message, course_id, source, visitor_id, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [leadId, normalizedName, normalizedPhone, normalizedEmail, safeMessage, courseId || null, safeSource, visitorId || null, ipAddress || null, userAgent || null])
  return getLead(leadId)
}

export async function getLead(leadId) {
  return leadFromRow(await queryOne(`
    SELECT l.*, c.title AS course_title FROM leads l LEFT JOIN courses c ON c.id = l.course_id WHERE l.id = $1
  `, [leadId]))
}

export async function listLeads(filters = {}) {
  const clauses = []
  const values = []
  const add = (sql, value) => clauses.push(sql.replace('$value', parameter(values, value)))
  if (filters.courseId) add('l.course_id = $value', filters.courseId)
  if (filters.ownerId) add('l.owner_id = $value', filters.ownerId)
  if (filters.stage) add('l.stage = $value', normalizeLeadStage(filters.stage))
  if (filters.status) add('l.stage = $value', normalizeLeadStage(filters.status))
  if (filters.source) add('l.source = $value', filters.source)
  if (filters.search) add("(lower(l.name) LIKE $value OR lower(l.email) LIKE $value OR l.phone LIKE $value)", `%${String(filters.search).trim().toLowerCase()}%`)
  if (filters.name) add('lower(l.name) LIKE $value', `%${String(filters.name).trim().toLowerCase()}%`)
  if (filters.email) add('lower(l.email) LIKE $value', `%${String(filters.email).trim().toLowerCase()}%`)
  if (filters.phone) add('l.phone LIKE $value', `%${normalizePhone(filters.phone)}%`)
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const rows = await queryMany(`
    SELECT l.*, c.title AS course_title FROM leads l LEFT JOIN courses c ON c.id = l.course_id
    ${where} ORDER BY l.created_at DESC
  `, values)
  return rows.map(leadFromRow)
}

export async function updateLead(leadId, updates, actorId = null) {
  const allowed = { name: 'name', phone: 'phone', email: 'email', message: 'message', courseId: 'course_id', source: 'source', stage: 'stage', status: 'stage', ownerId: 'owner_id' }
  const sets = []
  const values = []
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] === undefined) continue
    let value = updates[key]
    if (key === 'email') value = String(value).trim().toLowerCase()
    if (key === 'phone') value = normalizePhone(value)
    if (key === 'stage' || key === 'status') value = normalizeLeadStage(value)
    sets.push(`${column} = ${parameter(values, value)}`)
  }
  if (!sets.length) return getLead(leadId)
  sets.push('updated_at = CURRENT_TIMESTAMP')
  const leadParameter = parameter(values, leadId)
  await execute(`UPDATE leads SET ${sets.join(', ')} WHERE id = ${leadParameter}`, values)
  await recordAudit('lead.update', actorId, 'lead', leadId, updates)
  return getLead(leadId)
}

export async function addLeadNote(leadId, authorId, note) {
  if (!await getLead(leadId)) return null
  const noteId = id('lnote')
  const row = await queryOne(`
    INSERT INTO lead_notes (id, lead_id, author_id, note) VALUES ($1, $2, $3, $4)
    RETURNING id, lead_id AS "leadId", author_id AS "authorId", note, created_at AS "createdAt"
  `, [noteId, leadId, authorId || null, note])
  await recordAudit('lead.note', authorId, 'lead', leadId, {})
  return row
}

export async function createFollowUp(leadId, ownerId, dueAt, note = '') {
  if (!await getLead(leadId)) return null
  const followUpId = id('fup')
  await execute('INSERT INTO follow_ups (id, lead_id, owner_id, due_at, note) VALUES ($1, $2, $3, $4, $5)', [followUpId, leadId, ownerId || null, dueAt, note])
  await recordAudit('follow_up.create', ownerId, 'lead', leadId, { dueAt })
  return getFollowUp(followUpId)
}

export async function getFollowUp(followUpId) {
  return queryOne(`
    SELECT id, lead_id AS "leadId", owner_id AS "ownerId", due_at AS "dueAt", note, status, created_at AS "createdAt"
    FROM follow_ups WHERE id = $1
  `, [followUpId])
}

export async function listFollowUps(filters = {}) {
  const values = []
  const where = filters.status ? `WHERE status = ${parameter(values, filters.status)}` : ''
  return queryMany(`
    SELECT id, lead_id AS "leadId", owner_id AS "ownerId", due_at AS "dueAt", note, status, created_at AS "createdAt"
    FROM follow_ups ${where} ORDER BY due_at ASC
  `, values)
}

export async function getAuditLogs(limit = 50) {
  const rows = await queryMany(`
    SELECT a.*, u.email AS actor_email FROM audit_logs a LEFT JOIN users u ON u.id = a.actor_id
    ORDER BY a.created_at DESC LIMIT $1
  `, [Number(limit) || 50])
  return rows.map(row => ({
    id: row.id,
    actorId: row.actor_id,
    actorEmail: row.actor_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: parseJson(row.metadata, {}),
    createdAt: row.created_at,
  }))
}

export async function listDocumentAccessLogs(limit = 100) {
  return queryMany(`
    SELECT dl.*, u.email AS user_email, c.title AS course_title, cm.title AS material_title
    FROM document_access_logs dl JOIN users u ON u.id = dl.user_id
    JOIN courses c ON c.id = dl.course_id JOIN course_materials cm ON cm.id = dl.material_id
    ORDER BY dl.created_at DESC LIMIT $1
  `, [Number(limit) || 100])
}

export async function recordDocumentAccess({ userId, courseId, materialId, event, ipAddress, userAgent }) {
  await execute(`
    INSERT INTO document_access_logs (id, user_id, course_id, material_id, event, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [id('doclog'), userId, courseId, materialId, event, ipAddress || null, userAgent || null])
}

function blogFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    category: row.category || 'Beginner Cybersecurity',
    authorName: row.author_name || 'Arghya Sikdar',
    publishedAt: row.published_at || row.created_at,
    lastReviewedAt: row.last_reviewed_at || row.updated_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listPublishedBlogs() {
  return (await queryMany("SELECT * FROM blogs WHERE status = 'published' ORDER BY published_at DESC, created_at DESC")).map(blogFromRow)
}

export async function getPublishedBlogBySlug(slug) {
  return blogFromRow(await queryOne("SELECT * FROM blogs WHERE slug = $1 AND status = 'published'", [slug]))
}

export async function ingestRagSource(data, actorId = null) {
  if (!await getCourseById(data.courseId)) throw new Error('Course not found')
  const materialId = id('rag')
  await execute(`
    INSERT INTO course_materials (id, course_id, lesson_id, type, title, description, content, is_public, sort_order)
    VALUES ($1, $2, $3, 'text', $4, $5, $6, false, $7)
  `, [materialId, data.courseId, data.lessonId || null, String(data.title).trim(), 'Course-specific knowledge source added through cliadm.', String(data.content || '').slice(0, 100000), Number(data.sortOrder || 999)])
  await recordAudit('rag.ingest', actorId, 'course_material', materialId, { courseId: data.courseId })
  return { source: { id: materialId, courseId: data.courseId, title: data.title, type: 'text', status: 'ready' } }
}

function videoFromRow(row) {
  if (!row) return null
  return { id: row.id, courseId: row.course_id, lessonId: row.lesson_id, title: row.title, provider: row.provider, embedId: row.embed_id, order: row.sort_order, status: row.status, createdAt: row.created_at }
}

function documentFromRow(row) {
  if (!row) return null
  return { id: row.id, courseId: row.course_id, lessonId: row.lesson_id, title: row.title, storageKey: row.storage_key, pageCount: row.page_count, status: row.status, createdAt: row.created_at }
}

function labFromRow(row) {
  if (!row) return null
  return { id: row.id, courseId: row.course_id, lessonId: row.lesson_id, title: row.title, description: row.description, points: Number(row.points || 0), hints: parseJson(row.hints, []), dockerReady: Boolean(row.docker_ready), unsafeCloudInfra: false, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at }
}

function assignmentFromRow(row) {
  if (!row) return null
  return { id: row.id, courseId: row.course_id, title: row.title, description: row.description, status: row.status, dueAt: row.due_at, createdAt: row.created_at }
}

function certificateFromRow(row) {
  if (!row) return null
  return { id: row.id, userId: row.user_id, courseId: row.course_id, code: row.verification_code, issuedBy: row.issued_by, status: row.status, issuedAt: row.issued_at, userName: row.user_name, courseTitle: row.course_title }
}

async function quizFromRow(row) {
  if (!row) return null
  const questions = await queryMany('SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY sort_order ASC, id ASC', [row.id])
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    status: row.status,
    questions: questions.map(question => ({ id: question.id, prompt: question.prompt, choices: parseJson(question.choices, []), answer: question.answer })),
    createdAt: row.created_at,
  }
}

export async function getBatchById(batchId) {
  const row = await queryOne('SELECT * FROM batches WHERE id = $1', [batchId])
  return row ? { id: row.id, courseId: row.course_id, name: row.name, status: row.status, startsAt: row.starts_at, endsAt: row.ends_at, createdAt: row.created_at } : null
}

export async function hasBatchMembership(userId, courseId, batchId) {
  return Boolean(await queryOne("SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2 AND batch_id = $3 AND status = 'active'", [userId, courseId, batchId]))
}

export async function isInstructorAssigned(userId, courseId) {
  return Boolean(await queryOne('SELECT 1 FROM courses WHERE id = $1 AND instructor_id = $2', [courseId, userId]))
}

export async function listVideosByCourse(courseId) {
  return (await queryMany("SELECT * FROM course_videos WHERE course_id = $1 AND status = 'active' ORDER BY sort_order ASC, created_at ASC", [courseId])).map(videoFromRow)
}

export async function registerVideo(data, actorId) {
  if (!await getCourseById(data.courseId)) throw new Error('Course not found')
  const videoId = id('vid')
  const row = await queryOne(`
    INSERT INTO course_videos (id, course_id, lesson_id, title, provider, embed_id, sort_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
  `, [videoId, data.courseId, data.lessonId || null, String(data.title).trim(), String(data.provider).trim(), String(data.embedId).trim(), Number(data.order || 0)])
  await recordAudit('video.register', actorId, 'video', videoId, { courseId: data.courseId, provider: data.provider })
  return videoFromRow(row)
}

export async function listDocumentsByCourse(courseId) {
  return (await queryMany("SELECT * FROM protected_documents WHERE course_id = $1 AND status = 'active' ORDER BY created_at ASC", [courseId])).map(documentFromRow)
}

export async function getDocumentById(documentId) {
  return documentFromRow(await queryOne('SELECT * FROM protected_documents WHERE id = $1', [documentId]))
}

export async function registerDocument(data, actorId) {
  if (!await getCourseById(data.courseId)) throw new Error('Course not found')
  const documentId = id('doc')
  await execute(`
    INSERT INTO protected_documents (id, course_id, lesson_id, title, storage_key, page_count)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [documentId, data.courseId, data.lessonId || null, String(data.title).trim(), String(data.storageKey).trim(), data.pageCount ? Number(data.pageCount) : null])
  await recordAudit('document.register', actorId, 'document', documentId, { courseId: data.courseId, title: data.title })
  return getDocumentById(documentId)
}

export async function logDocumentAccess(documentId, userId, metadata = {}) {
  const document = await getDocumentById(documentId)
  if (!document) return null
  const eventId = id('docevt')
  const safeMetadata = { requestId: metadata.requestId || null, userAgent: String(metadata.userAgent || '').slice(0, 300) }
  await execute(`
    INSERT INTO protected_document_events (id, document_id, course_id, user_id, page, event, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
  `, [eventId, documentId, document.courseId, userId, Number(metadata.page || 1), metadata.event || 'view', JSON.stringify(safeMetadata)])
  await recordAudit('document.access', userId, 'document', documentId, { courseId: document.courseId, page: Number(metadata.page || 1) })
  return { id: eventId, documentId, courseId: document.courseId, userId, page: Number(metadata.page || 1), createdAt: new Date().toISOString() }
}

export async function listLabsByCourse(courseId) {
  return (await queryMany("SELECT * FROM labs WHERE course_id = $1 AND status != 'archived' ORDER BY created_at ASC", [courseId])).map(labFromRow)
}

export async function getLabById(labId) {
  return labFromRow(await queryOne('SELECT * FROM labs WHERE id = $1', [labId]))
}

export async function assignLabToCourse(labId, courseId, actorId) {
  if (!await getCourseById(courseId)) throw new Error('Course not found')
  const result = await execute('UPDATE labs SET course_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id', [courseId, labId])
  if (!result.rowCount) return null
  await recordAudit('lab.assign_course', actorId, 'lab', labId, { courseId })
  return getLabById(labId)
}

function hashLabFlag(value) {
  return createHash('sha256').update(`${process.env.LAB_FLAG_SALT || 'local-lab-flag-salt'}:${String(value || '').trim().toUpperCase()}`).digest('hex')
}

export async function createLab(data, actorId) {
  if (!await getCourseById(data.courseId)) throw new Error('Course not found')
  const labId = id('lab')
  await transaction(async client => {
    await execute(`
      INSERT INTO labs (id, course_id, lesson_id, title, description, points, hints, docker_ready, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
    `, [labId, data.courseId, data.lessonId || null, String(data.title).trim(), String(data.description || ''), Number(data.points || 0), JSON.stringify(Array.isArray(data.hints) ? data.hints : []), data.dockerReady !== false, data.status || 'draft'], client)
    if (data.flag) {
      await execute('INSERT INTO lab_flags (id, lab_id, flag_hash, points) VALUES ($1, $2, $3, $4)', [id('flag'), labId, hashLabFlag(data.flag), Number(data.points || 0)], client)
    }
    await recordAudit('lab.create', actorId, 'lab', labId, { courseId: data.courseId, title: data.title }, client)
  })
  return getLabById(labId)
}

export async function launchLab(labId, userId) {
  const lab = await getLabById(labId)
  if (!lab) return null
  const attemptId = id('labatt')
  const row = await queryOne(`
    INSERT INTO lab_attempts (id, lab_id, course_id, user_id) VALUES ($1, $2, $3, $4)
    RETURNING id, lab_id AS "labId", course_id AS "courseId", user_id AS "userId", status, score, started_at AS "startedAt", submitted_at AS "submittedAt"
  `, [attemptId, labId, lab.courseId, userId])
  await recordAudit('lab.launch', userId, 'lab', labId, { attemptId })
  return row
}

export async function submitLabFlag(labId, userId, flag) {
  const lab = await getLabById(labId)
  if (!lab) return null
  const matched = await queryOne('SELECT points FROM lab_flags WHERE lab_id = $1 AND flag_hash = $2', [labId, hashLabFlag(flag)])
  const attemptId = id('labatt')
  const status = matched ? 'passed' : 'failed'
  const score = Number(matched?.points || 0)
  const row = await queryOne(`
    INSERT INTO lab_attempts (id, lab_id, course_id, user_id, status, score, submitted_at)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    RETURNING id, lab_id AS "labId", course_id AS "courseId", user_id AS "userId", status, score, started_at AS "startedAt", submitted_at AS "submittedAt"
  `, [attemptId, labId, lab.courseId, userId, status, score])
  await recordAudit('lab.submit_flag', userId, 'lab', labId, { passed: Boolean(matched), score })
  return row
}

export async function listLabAttempts(filter = {}) {
  const clauses = []
  const values = []
  for (const [key, column] of Object.entries({ courseId: 'course_id', userId: 'user_id', labId: 'lab_id' })) {
    if (filter[key]) clauses.push(`${column} = ${parameter(values, filter[key])}`)
  }
  return queryMany(`
    SELECT id, lab_id AS "labId", course_id AS "courseId", user_id AS "userId", status, score,
      started_at AS "startedAt", submitted_at AS "submittedAt"
    FROM lab_attempts ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} ORDER BY started_at DESC
  `, values)
}

export async function createQuiz(data, actorId) {
  if (!await getCourseById(data.courseId)) throw new Error('Course not found')
  const quizId = id('quiz')
  await transaction(async client => {
    await execute('INSERT INTO quizzes (id, course_id, title, status) VALUES ($1, $2, $3, $4)', [quizId, data.courseId, String(data.title).trim(), data.status || 'draft'], client)
    for (const question of Array.isArray(data.questions) ? data.questions : []) {
      await addQuizQuestion(quizId, question, actorId, client)
    }
    await recordAudit('quiz.create', actorId, 'quiz', quizId, { courseId: data.courseId, title: data.title }, client)
  })
  return getQuizById(quizId)
}

export async function addQuizQuestion(quizId, question, actorId, client) {
  if (!await queryOne('SELECT 1 FROM quizzes WHERE id = $1', [quizId], client)) return null
  if (!Array.isArray(question.choices) || question.choices.length < 2 || !question.choices.includes(question.answer)) {
    throw new Error('Question choices must include the answer')
  }
  const questionId = id('qq')
  await execute(`
    INSERT INTO quiz_questions (id, quiz_id, prompt, choices, answer, sort_order)
    VALUES ($1, $2, $3, $4::jsonb, $5, $6)
  `, [questionId, quizId, String(question.prompt).trim(), JSON.stringify(question.choices), String(question.answer), Number(question.order || 0)], client)
  await recordAudit('quiz.add_question', actorId, 'quiz', quizId, { questionId }, client)
  return { id: questionId, prompt: question.prompt, choices: question.choices, answer: question.answer }
}

export async function listQuizzesByCourse(courseId) {
  const rows = await queryMany('SELECT * FROM quizzes WHERE course_id = $1 ORDER BY created_at ASC', [courseId])
  return Promise.all(rows.map(quizFromRow))
}

export async function getQuizById(quizId) {
  return quizFromRow(await queryOne('SELECT * FROM quizzes WHERE id = $1', [quizId]))
}

export async function submitQuizAttempt(quizId, userId, answers = {}) {
  const quiz = await getQuizById(quizId)
  if (!quiz) return null
  const correct = quiz.questions.filter(question => answers[question.id] === question.answer).length
  const score = quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0
  const results = quiz.questions.map(question => ({
    questionId: question.id,
    prompt: question.prompt,
    selectedAnswer: answers[question.id] ?? null,
    correctAnswer: question.answer,
    correct: answers[question.id] === question.answer,
  }))
  const attemptId = id('qatt')
  await execute(`
    INSERT INTO quiz_attempts (id, quiz_id, course_id, user_id, answers, score)
    VALUES ($1, $2, $3, $4, $5::jsonb, $6)
  `, [attemptId, quizId, quiz.courseId, userId, JSON.stringify(answers), score])
  await recordAudit('quiz.submit', userId, 'quiz', quizId, { score })
  return { id: attemptId, quizId, courseId: quiz.courseId, userId, answers, results, score, submittedAt: new Date().toISOString() }
}

export async function createAssignment(data, actorId) {
  if (!await getCourseById(data.courseId)) throw new Error('Course not found')
  const assignmentId = id('asn')
  await execute(`
    INSERT INTO assignments (id, course_id, title, description, status, due_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [assignmentId, data.courseId, String(data.title).trim(), String(data.description || ''), data.status || 'draft', data.dueAt || null])
  await recordAudit('assignment.create', actorId, 'assignment', assignmentId, { courseId: data.courseId })
  return getAssignmentById(assignmentId)
}

export async function getAssignmentById(assignmentId) {
  return assignmentFromRow(await queryOne('SELECT * FROM assignments WHERE id = $1', [assignmentId]))
}

export async function listAssignmentsByCourse(courseId) {
  return (await queryMany('SELECT * FROM assignments WHERE course_id = $1 ORDER BY created_at ASC', [courseId])).map(assignmentFromRow)
}

const SUBMISSION_SELECT = `
  SELECT id, assignment_id AS "assignmentId", course_id AS "courseId", user_id AS "userId", content,
    status, score, feedback, reviewed_by AS "reviewedBy", submitted_at AS "submittedAt", reviewed_at AS "reviewedAt"
  FROM assignment_submissions
`

export async function submitAssignment(assignmentId, userId, content) {
  const assignment = await getAssignmentById(assignmentId)
  if (!assignment) return null
  const submissionId = id('sub')
  await execute('INSERT INTO assignment_submissions (id, assignment_id, course_id, user_id, content) VALUES ($1, $2, $3, $4, $5)', [submissionId, assignmentId, assignment.courseId, userId, String(content).slice(0, 50000)])
  await recordAudit('assignment.submit', userId, 'assignment', assignmentId, {})
  return queryOne(`${SUBMISSION_SELECT} WHERE id = $1`, [submissionId])
}

export async function reviewAssignment(submissionId, reviewerId, review) {
  const result = await execute(`
    UPDATE assignment_submissions SET status = 'reviewed', score = $1, feedback = $2,
      reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id
  `, [review.score === undefined ? null : Number(review.score), review.feedback || null, reviewerId, submissionId])
  if (!result.rowCount) return null
  await recordAudit('assignment.review', reviewerId, 'submission', submissionId, { score: review.score })
  return queryOne(`${SUBMISSION_SELECT} WHERE id = $1`, [submissionId])
}

export async function getAssignmentSubmission(submissionId) {
  return queryOne(`${SUBMISSION_SELECT} WHERE id = $1`, [submissionId])
}

export async function getCourseProgress(userId, courseId) {
  const row = await queryOne('SELECT * FROM user_progress WHERE user_id = $1 AND course_id = $2 AND lesson_id IS NULL ORDER BY updated_at DESC LIMIT 1', [userId, courseId])
  return row
    ? { id: row.id, userId: row.user_id, courseId: row.course_id, lessonProgress: row.lesson_progress, videoProgress: row.video_progress, documentProgress: row.document_progress, labProgress: row.lab_progress, quizProgress: row.quiz_progress, completionPercentage: row.completion_percentage, updatedAt: row.updated_at }
    : { id: null, userId, courseId, lessonProgress: 0, videoProgress: 0, documentProgress: 0, labProgress: 0, quizProgress: 0, completionPercentage: 0 }
}

export async function updateCourseProgress(userId, courseId, updates) {
  const current = await getCourseProgress(userId, courseId)
  const values = {}
  for (const key of ['lessonProgress', 'videoProgress', 'documentProgress', 'labProgress', 'quizProgress']) {
    values[key] = Math.max(0, Math.min(100, Number(updates[key] ?? current[key] ?? 0)))
  }
  const completion = Math.round(Object.values(values).reduce((sum, value) => sum + value, 0) / 5)
  if (current.id) {
    await execute(`
      UPDATE user_progress SET lesson_progress = $1, video_progress = $2, document_progress = $3,
        lab_progress = $4, quiz_progress = $5, completion_percentage = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [values.lessonProgress, values.videoProgress, values.documentProgress, values.labProgress, values.quizProgress, completion, current.id])
  } else {
    await execute(`
      INSERT INTO user_progress (id, user_id, course_id, lesson_id, completion_percentage, lesson_progress, video_progress, document_progress, lab_progress, quiz_progress)
      VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8, $9)
    `, [id('prg'), userId, courseId, completion, values.lessonProgress, values.videoProgress, values.documentProgress, values.labProgress, values.quizProgress])
  }
  await recordAudit('progress.update', userId, 'course', courseId, { completionPercentage: completion })
  return getCourseProgress(userId, courseId)
}

export async function issueCertificate(data, actorId) {
  if (!await hasActiveEnrollment(data.userId, data.courseId)) throw new Error('Active enrollment required')
  const certificateId = id('cert')
  const code = data.code || `CLI-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`
  await execute('INSERT INTO certificates (id, user_id, course_id, verification_code, issued_by) VALUES ($1, $2, $3, $4, $5)', [certificateId, data.userId, data.courseId, code, actorId || null])
  await recordAudit('certificate.issue', actorId, 'certificate', certificateId, { userId: data.userId, courseId: data.courseId })
  return verifyCertificate(code)
}

export async function verifyCertificate(code) {
  return certificateFromRow(await queryOne(`
    SELECT cert.*, u.name AS user_name, c.title AS course_title FROM certificates cert
    JOIN users u ON u.id = cert.user_id JOIN courses c ON c.id = cert.course_id
    WHERE cert.verification_code = $1 AND cert.status = 'issued'
  `, [code]))
}

export async function listCertificates(filter = {}) {
  const clauses = []
  const values = []
  if (filter.userId) clauses.push(`cert.user_id = ${parameter(values, filter.userId)}`)
  if (filter.courseId) clauses.push(`cert.course_id = ${parameter(values, filter.courseId)}`)
  const rows = await queryMany(`
    SELECT cert.*, u.name AS user_name, c.title AS course_title FROM certificates cert
    JOIN users u ON u.id = cert.user_id JOIN courses c ON c.id = cert.course_id
    ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} ORDER BY cert.issued_at DESC
  `, values)
  return rows.map(certificateFromRow)
}

export async function createPaymentOrder(data, actorId) {
  const paymentId = id('pay')
  const row = await queryOne(`
    INSERT INTO payment_intents (id, user_id, course_id, amount, currency, provider_order_id, status, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
    RETURNING id, user_id AS "userId", course_id AS "courseId", amount, currency, provider,
      provider_order_id AS "providerOrderId", status, created_at AS "createdAt"
  `, [paymentId, data.userId, data.courseId, Number(data.amount), data.currency || 'INR', data.providerOrderId, data.status || 'created', JSON.stringify(data.metadata || {})])
  await recordAudit('payment.create', actorId, 'payment', paymentId, { courseId: data.courseId, amount: Number(data.amount), providerOrderId: data.providerOrderId })
  return row
}

export async function recordPaymentWebhook(eventId, payload) {
  return transaction(async client => {
    const existing = await queryOne('SELECT id FROM payment_events WHERE provider_event_id = $1', [eventId], client)
    if (existing) return { duplicate: true, eventId }
    const eventType = String(payload?.event || 'received')
    const paymentEntity = payload?.payload?.payment?.entity || {}
    const paymentEventId = id('payevt')
    await execute('INSERT INTO payment_events (id, provider_event_id, event_type, payload) VALUES ($1, $2, $3, $4::jsonb)', [paymentEventId, eventId, eventType, JSON.stringify(payload || {})], client)
    const intent = paymentEntity.order_id
      ? await queryOne('SELECT * FROM payment_intents WHERE provider_order_id = $1', [paymentEntity.order_id], client)
      : null
    if (intent) {
      await execute('UPDATE payment_intents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [eventType === 'payment.captured' ? 'paid' : eventType, intent.id], client)
    }
    if (eventType === 'payment.captured' && intent) await enrollUser(intent.user_id, intent.course_id, 'razorpay', null, client)
    await recordAudit('payment.webhook', null, 'payment_event', paymentEventId, { eventId, eventType }, client)
    return { duplicate: false, payment: { id: paymentEventId, providerEventId: eventId, eventType } }
  })
}
