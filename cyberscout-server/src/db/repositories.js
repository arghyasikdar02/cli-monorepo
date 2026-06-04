import { createHash, randomUUID } from 'node:crypto'
import { db } from './index.js'

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

function id(prefix) {
  return `${prefix}_${randomUUID()}`
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function userFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    googleId: row.google_id,
    role: row.role,
    roles: parseJson(row.roles, [row.role || 'student']),
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
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    roles: user.roles || [user.role || 'student'],
    status: user.status,
    hasPassword: Boolean(user.passwordHash),
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  }
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
    instructor: {
      name: row.instructor_name,
      title: row.instructor_title,
    },
    instructorName: row.instructor_name,
    instructorTitle: row.instructor_title,
    status: row.status,
    price: row.price,
    mode: row.mode || 'Online',
    credential: row.credential || 'Certificate of Completion',
    prerequisites: row.prerequisites || 'Basic computer and internet knowledge',
    brochureUrl: row.brochure_url,
    categorySlug: row.category_slug || slugify(row.category || 'Cybersecurity'),
    audience: parseJson(row.audience, []),
    outcomes: parseJson(row.outcomes, []),
    labs: parseJson(row.labs, []),
    moduleCount: extra.moduleCount ?? row.module_count ?? 0,
    lessonCount: extra.lessonCount ?? row.lesson_count ?? 0,
    materialCount: extra.materialCount ?? row.material_count ?? 0,
    enrolled: Boolean(extra.enrolled ?? row.enrolled ?? false),
    progress: Number(extra.progress ?? row.progress ?? 0),
    currentLessonId: extra.currentLessonId ?? row.current_lesson_id ?? null,
    currentModule: extra.currentModule ?? row.current_module ?? 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function moduleFromRow(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    order: row.sort_order,
    lessons: [],
  }
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

export function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase()
  return userFromRow(db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(normalized))
}

export function findUserByUsername(username) {
  const normalized = String(username || '').trim().toLowerCase()
  if (!normalized) return null
  return userFromRow(db.prepare('SELECT * FROM users WHERE lower(username) = ?').get(normalized))
}

export function findUserByGoogleId(googleId) {
  return userFromRow(db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId))
}

export function findUserById(userId) {
  return userFromRow(db.prepare('SELECT * FROM users WHERE id = ?').get(userId))
}

export function listUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(userFromRow).map(publicUser)
}

export function userHasRole(user, allowedRoles) {
  const roles = user?.roles || [user?.role]
  return roles.some(role => allowedRoles.includes(role))
}

export function createUser({ name, email, username, passwordHash, googleId = null, role = 'student', roles = ['student'] }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedUsername = username ? String(username).trim().toLowerCase() : null
  const primaryRole = VALID_ROLES.includes(role) ? role : 'student'
  const safeRoles = Array.from(new Set((roles?.length ? roles : [primaryRole]).filter(item => VALID_ROLES.includes(item))))
  const userId = id('usr')
  db.prepare(`
    INSERT INTO users (id, name, username, email, password_hash, google_id, role, roles)
    VALUES (@id, @name, @username, @email, @passwordHash, @googleId, @role, @roles)
  `).run({
    id: userId,
    name: String(name || '').trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash,
    googleId,
    role: primaryRole,
    roles: JSON.stringify(safeRoles.length ? safeRoles : [primaryRole]),
  })
  return findUserById(userId)
}

export function updateUser(userId, updates) {
  const allowed = {
    name: 'name',
    username: 'username',
    email: 'email',
    passwordHash: 'password_hash',
    status: 'status',
    lastLogin: 'last_login_at',
    tokenVersion: 'token_version',
    passwordUpdatedAt: 'password_updated_at',
  }
  const sets = []
  const params = { id: userId }
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] !== undefined) {
      sets.push(`${column} = @${key}`)
      params[key] = key === 'email' || key === 'username' ? String(updates[key]).trim().toLowerCase() : updates[key]
    }
  }
  if (!sets.length) return findUserById(userId)
  sets.push("updated_at = datetime('now')")
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`).run(params)
  return findUserById(userId)
}

export function updateUserPassword(userId, passwordHash) {
  db.prepare(`
    UPDATE users
    SET password_hash = ?,
        password_updated_at = datetime('now'),
        token_version = coalesce(token_version, 0) + 1,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(passwordHash, userId)
  recordAudit('auth.password_change', userId, 'user', userId, {})
  return findUserById(userId)
}

export function assignRole(userId, role) {
  if (!VALID_ROLES.includes(role)) return null
  const user = findUserById(userId)
  if (!user) return null
  const roles = Array.from(new Set([...(user.roles || []), role]))
  db.prepare("UPDATE users SET role = ?, roles = ?, updated_at = datetime('now') WHERE id = ?")
    .run(role, JSON.stringify(roles), userId)
  return findUserById(userId)
}

export function suspendUser(userId) {
  return updateUser(userId, { status: 'suspended' })
}

export function listPublicCourses() {
  return db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
      (SELECT count(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS lesson_count,
      (SELECT count(*) FROM course_materials cm WHERE cm.course_id = c.id) AS material_count
    FROM courses c
    WHERE c.status = 'published'
    ORDER BY c.created_at ASC
  `).all().map(row => courseFromRow(row))
}

export function listCourses() {
  return db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
      (SELECT count(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS lesson_count,
      (SELECT count(*) FROM course_materials cm WHERE cm.course_id = c.id) AS material_count
    FROM courses c
    ORDER BY c.created_at ASC
  `).all().map(row => courseFromRow(row))
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createCourse(input, actorId = null) {
  const courseId = input.id || id('crs')
  const title = String(input.title || '').trim()
  if (!title) throw new Error('Course title is required')
  const course = {
    id: courseId,
    slug: input.slug || `${slugify(title)}-${courseId.slice(-6)}`,
    title,
    category: input.category || 'Cybersecurity',
    level: input.level || 'Beginner',
    duration: input.duration || 'Self-paced',
    description: input.description || 'Course description pending.',
    overview: input.overview || input.description || 'Course overview pending.',
    instructorName: input.instructorName || input.instructor?.name || 'Cyber Lab IN Faculty',
    instructorTitle: input.instructorTitle || input.instructor?.title || 'Cybersecurity Educators',
    status: input.status || 'draft',
    price: Number(input.price || 0),
    mode: input.mode || 'Online',
    credential: input.credential || 'Certificate of Completion',
    prerequisites: input.prerequisites || 'Basic computer and internet knowledge',
    brochureUrl: input.brochureUrl || null,
    categorySlug: input.categorySlug || slugify(input.category || 'Cybersecurity'),
    audience: JSON.stringify(input.audience || []),
    outcomes: JSON.stringify(input.outcomes || []),
    labs: JSON.stringify(input.labs || []),
  }
  db.prepare(`
    INSERT INTO courses (
      id, slug, title, category, level, duration, description, overview, instructor_name, instructor_title,
      status, price, mode, credential, prerequisites, brochure_url, category_slug, audience, outcomes, labs
    )
    VALUES (
      @id, @slug, @title, @category, @level, @duration, @description, @overview, @instructorName, @instructorTitle,
      @status, @price, @mode, @credential, @prerequisites, @brochureUrl, @categorySlug, @audience, @outcomes, @labs
    )
  `).run(course)
  recordAudit('course.create', actorId, 'course', courseId, { title: course.title })
  return getCourseById(courseId)
}

export function updateCourse(courseId, updates, actorId = null) {
  const allowed = {
    title: 'title',
    category: 'category',
    level: 'level',
    duration: 'duration',
    description: 'description',
    overview: 'overview',
    status: 'status',
    price: 'price',
    mode: 'mode',
    credential: 'credential',
    prerequisites: 'prerequisites',
    brochureUrl: 'brochure_url',
    categorySlug: 'category_slug',
  }
  const sets = []
  const params = { id: courseId }
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] !== undefined) {
      sets.push(`${column} = @${key}`)
      params[key] = updates[key]
    }
  }
  for (const [key, column] of Object.entries({ audience: 'audience', outcomes: 'outcomes', labs: 'labs' })) {
    if (updates[key] !== undefined) {
      sets.push(`${column} = @${key}`)
      params[key] = JSON.stringify(Array.isArray(updates[key]) ? updates[key] : [])
    }
  }
  if (updates.instructorName !== undefined || updates.instructor?.name !== undefined) {
    sets.push('instructor_name = @instructorName')
    params.instructorName = updates.instructorName || updates.instructor.name
  }
  if (updates.instructorTitle !== undefined || updates.instructor?.title !== undefined) {
    sets.push('instructor_title = @instructorTitle')
    params.instructorTitle = updates.instructorTitle || updates.instructor.title
  }
  if (!sets.length) return getCourseById(courseId)
  sets.push("updated_at = datetime('now')")
  db.prepare(`UPDATE courses SET ${sets.join(', ')} WHERE id = @id`).run(params)
  recordAudit('course.update', actorId, 'course', courseId, updates)
  return getCourseById(courseId)
}

export function publishCourse(courseId, actorId = null) {
  return updateCourse(courseId, { status: 'published' }, actorId)
}

export function archiveCourse(courseId, actorId = null) {
  return updateCourse(courseId, { status: 'archived' }, actorId)
}

export function getPublicCourse(courseId) {
  const row = db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
      (SELECT count(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS lesson_count,
      (SELECT count(*) FROM course_materials cm WHERE cm.course_id = c.id) AS material_count
    FROM courses c
    WHERE c.id = ? AND c.status = 'published'
  `).get(courseId)
  if (!row) return null
  const course = courseFromRow(row)
  course.modules = listCourseModules(courseId, null, { publicOnly: true })
  return course
}

export function getPublicCourseBySlug(categorySlug, courseSlug) {
  const row = db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
      (SELECT count(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS lesson_count,
      (SELECT count(*) FROM course_materials cm WHERE cm.course_id = c.id) AS material_count
    FROM courses c
    WHERE c.category_slug = ? AND c.slug = ? AND c.status = 'published'
  `).get(categorySlug, courseSlug)
  if (!row) return null
  const course = courseFromRow(row)
  course.modules = listCourseModules(course.id, null, { publicOnly: true })
  course.materials = listCourseMaterials(course.id).filter(material => material.isPublic)
  return course
}

export function getCourseById(courseId) {
  const row = db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
      (SELECT count(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS lesson_count,
      (SELECT count(*) FROM course_materials cm WHERE cm.course_id = c.id) AS material_count
    FROM courses c
    WHERE c.id = ?
  `).get(courseId)
  return courseFromRow(row)
}

export function hasActiveEnrollment(userId, courseId) {
  return Boolean(db.prepare(`
    SELECT 1 FROM enrollments
    WHERE user_id = ? AND course_id = ? AND status = 'active'
  `).get(userId, courseId))
}

export function canReadCourse(user, courseId, allowedRoles = []) {
  if (!user || !courseId) return false
  if (userHasRole(user, ['admin', 'super_admin', 'support', ...allowedRoles])) return true
  if (userHasRole(user, ['instructor']) && allowedRoles.includes('instructor')) return true
  return hasActiveEnrollment(user.id, courseId)
}

export function enrollUser(userId, courseId, source = 'self_service') {
  if (!findUserById(userId)) throw new Error('User not found')
  const course = getCourseById(courseId)
  if (!course || course.status !== 'published') throw new Error('Course not found')
  const existing = db.prepare('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?').get(userId, courseId)
  if (existing) {
    db.prepare("UPDATE enrollments SET status = 'active', updated_at = datetime('now') WHERE id = ?").run(existing.id)
    return getEnrollment(existing.id)
  }
  const enrollmentId = id('enr')
  db.prepare(`
    INSERT INTO enrollments (id, user_id, course_id, source)
    VALUES (?, ?, ?, ?)
  `).run(enrollmentId, userId, courseId, source)
  const firstLesson = db.prepare(`
    SELECT id FROM lessons WHERE course_id = ? AND status = 'published' ORDER BY sort_order ASC LIMIT 1
  `).get(courseId)
  if (firstLesson) {
    upsertProgress(userId, courseId, firstLesson.id, 0)
  }
  return getEnrollment(enrollmentId)
}

export function addEnrollment({ userId, courseId, source = 'manual' }) {
  return enrollUser(userId, courseId, source)
}

export function getEnrollment(enrollmentId) {
  return db.prepare(`
    SELECT e.*, u.name AS user_name, u.email AS user_email, c.title AS course_title
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    JOIN courses c ON c.id = e.course_id
    WHERE e.id = ?
  `).get(enrollmentId)
}

export function listEnrollmentsByUser(userId) {
  return db.prepare(`
    SELECT e.*, c.title AS course_title, c.slug AS course_slug
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC
  `).all(userId)
}

export function listEnrollmentsByCourse(courseId) {
  return db.prepare(`
    SELECT e.*, u.name AS user_name, u.email AS user_email
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    WHERE e.course_id = ?
    ORDER BY e.enrolled_at DESC
  `).all(courseId)
}

export function listAllEnrollments() {
  return db.prepare(`
    SELECT e.*, u.name AS user_name, u.email AS user_email, c.title AS course_title
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    JOIN courses c ON c.id = e.course_id
    ORDER BY e.enrolled_at DESC
  `).all()
}

function courseProgress(userId, courseId) {
  const total = db.prepare("SELECT count(*) AS count FROM lessons WHERE course_id = ? AND status = 'published'").get(courseId).count
  if (!total) return 0
  const complete = db.prepare(`
    SELECT count(*) AS count FROM user_progress
    WHERE user_id = ? AND course_id = ? AND completion_percentage >= 100
  `).get(userId, courseId).count
  return Math.round((complete / total) * 100)
}

function currentLesson(userId, courseId) {
  return db.prepare(`
    SELECT l.id, m.sort_order AS module_order
    FROM lessons l
    JOIN course_modules m ON m.id = l.module_id
    LEFT JOIN user_progress p ON p.lesson_id = l.id AND p.user_id = ?
    WHERE l.course_id = ? AND l.status = 'published' AND coalesce(p.completion_percentage, 0) < 100
    ORDER BY m.sort_order ASC, l.sort_order ASC
    LIMIT 1
  `).get(userId, courseId)
}

export function listEnrolledCourses(userId) {
  const rows = db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
      (SELECT count(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS lesson_count,
      (SELECT count(*) FROM course_materials cm WHERE cm.course_id = c.id) AS material_count
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.user_id = ? AND e.status = 'active'
    ORDER BY e.enrolled_at DESC
  `).all(userId)
  return rows.map(row => {
    const lesson = currentLesson(userId, row.id)
    return courseFromRow(row, {
      enrolled: true,
      progress: courseProgress(userId, row.id),
      currentLessonId: lesson?.id ?? null,
      currentModule: lesson?.module_order ?? 1,
    })
  })
}

export function listCourseModules(courseId, userId = null, { publicOnly = false } = {}) {
  const modules = db.prepare(`
    SELECT * FROM course_modules WHERE course_id = ? ORDER BY sort_order ASC
  `).all(courseId).map(moduleFromRow)
  const lessons = db.prepare(`
    SELECT l.*, p.completion_percentage
    FROM lessons l
    LEFT JOIN user_progress p ON p.lesson_id = l.id AND p.user_id = ?
    WHERE l.course_id = ? AND l.status = 'published'
    ORDER BY l.sort_order ASC
  `).all(userId || '', courseId)
  const byModule = new Map(modules.map(module => [module.id, module]))
  for (const lesson of lessons) {
    const target = byModule.get(lesson.module_id)
    if (!target) continue
    target.lessons.push(lessonFromRow(lesson, !publicOnly && Number(lesson.completion_percentage || 0) >= 100))
  }
  return modules
}

export function getCourseForUser(courseId, user) {
  const course = getCourseById(courseId)
  if (!course || course.status !== 'published') return null
  const enrolled = user ? hasActiveEnrollment(user.id, courseId) : false
  const elevated = user ? userHasRole(user, ['admin', 'super_admin', 'instructor', 'support']) : false
  const canViewPrivate = enrolled || elevated
  const lesson = user ? currentLesson(user.id, courseId) : null
  return {
    ...course,
    enrolled,
    progress: user && enrolled ? courseProgress(user.id, courseId) : 0,
    currentLessonId: lesson?.id ?? null,
    currentModule: lesson?.module_order ?? 1,
    modules: listCourseModules(courseId, canViewPrivate ? user.id : null, { publicOnly: !canViewPrivate }),
    materials: canViewPrivate ? listCourseMaterials(courseId) : listCourseMaterials(courseId).filter(material => material.isPublic),
    lockedMaterialCount: canViewPrivate ? 0 : listCourseMaterials(courseId).filter(material => !material.isPublic).length,
  }
}

export function listCourseMaterials(courseId) {
  return db.prepare(`
    SELECT * FROM course_materials
    WHERE course_id = ?
    ORDER BY sort_order ASC
  `).all(courseId).map(materialFromRow)
}

export function listCourseMaterialsForUser(user, courseId, reqMeta = {}) {
  if (!canReadCourse(user, courseId, ['instructor'])) {
    const publicMaterials = listCourseMaterials(courseId).filter(material => material.isPublic)
    return { allowed: false, materials: publicMaterials }
  }
  const materials = listCourseMaterials(courseId)
  for (const material of materials) {
    if (material.type === 'pdf') {
      recordDocumentAccess({
        userId: user.id,
        courseId,
        materialId: material.id,
        event: 'metadata_view',
        ...reqMeta,
      })
    }
  }
  return { allowed: true, materials }
}

export function upsertProgress(userId, courseId, lessonId, completionPercentage) {
  const existing = db.prepare(`
    SELECT id FROM user_progress WHERE user_id = ? AND course_id = ? AND lesson_id = ?
  `).get(userId, courseId, lessonId)
  const safePercentage = Math.max(0, Math.min(100, Number(completionPercentage) || 0))
  if (existing) {
    db.prepare(`
      UPDATE user_progress
      SET completion_percentage = ?, completed_at = CASE WHEN ? >= 100 THEN datetime('now') ELSE completed_at END, updated_at = datetime('now')
      WHERE id = ?
    `).run(safePercentage, safePercentage, existing.id)
    return existing.id
  }
  const progressId = id('prg')
  db.prepare(`
    INSERT INTO user_progress (id, user_id, course_id, lesson_id, completion_percentage, completed_at)
    VALUES (?, ?, ?, ?, ?, CASE WHEN ? >= 100 THEN datetime('now') ELSE NULL END)
  `).run(progressId, userId, courseId, lessonId, safePercentage, safePercentage)
  return progressId
}

export function getStudentDashboard(userId) {
  const enrolledCourses = listEnrolledCourses(userId)
  const enrolledCourseIds = enrolledCourses.map(course => course.id)
  const materialsCount = enrolledCourseIds.length
    ? db.prepare(`SELECT count(*) AS count FROM course_materials WHERE course_id IN (${enrolledCourseIds.map(() => '?').join(',')})`).get(...enrolledCourseIds).count
    : 0
  const completedCourses = enrolledCourses.filter(course => course.progress >= 100).length
  const nextCourse = enrolledCourses.find(course => course.currentLessonId) || enrolledCourses[0] || null
  return {
    enrolledCourses,
    recommendedCourses: listPublicCourses().filter(course => !enrolledCourseIds.includes(course.id)),
    summary: {
      enrolledCourses: enrolledCourses.length,
      completedCourses,
      materialsAvailable: materialsCount,
      averageProgress: enrolledCourses.length
        ? Math.round(enrolledCourses.reduce((total, course) => total + course.progress, 0) / enrolledCourses.length)
        : 0,
    },
    activeCourse: nextCourse,
    liveClasses: listUpcomingLiveClasses(userId),
  }
}

export function getCourseLeaderboard(courseId, limit = 25) {
  return db.prepare(`
    SELECT
      u.id AS userId,
      u.name,
      u.email,
      e.course_id AS courseId,
      round(avg(coalesce(p.completion_percentage, 0))) AS progress,
      count(CASE WHEN coalesce(p.completion_percentage, 0) >= 100 THEN 1 END) AS completedLessons
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    LEFT JOIN user_progress p ON p.user_id = e.user_id AND p.course_id = e.course_id
    WHERE e.course_id = ? AND e.status = 'active'
    GROUP BY u.id, u.name, u.email, e.course_id
    HAVING progress > 0 OR completedLessons > 0
    ORDER BY progress DESC, completedLessons DESC, u.name ASC
    LIMIT ?
  `).all(courseId, Number(limit) || 25).map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: row.name,
    email: row.email,
    courseId: row.courseId,
    progress: Number(row.progress || 0),
    completedLessons: Number(row.completedLessons || 0),
    score: Number(row.progress || 0),
  }))
}

export function getInstructorDashboard(instructorId) {
  const assignedCourses = db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM course_modules m WHERE m.course_id = c.id) AS module_count,
      (SELECT count(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS lesson_count,
      (SELECT count(*) FROM course_materials cm WHERE cm.course_id = c.id) AS material_count
    FROM courses c
    WHERE c.status = 'published'
    ORDER BY c.created_at ASC
  `).all().map(row => courseFromRow(row))
  const courseIds = assignedCourses.map(course => course.id)
  const students = courseIds.length
    ? db.prepare(`
      SELECT DISTINCT u.id, u.name, u.email
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      WHERE e.course_id IN (${courseIds.map(() => '?').join(',')}) AND e.status = 'active'
      ORDER BY u.name ASC
    `).all(...courseIds)
    : []
  const progress = courseIds.length
    ? db.prepare(`
      SELECT p.id, p.user_id AS userId, p.course_id AS courseId, p.lesson_id AS lessonId, p.completion_percentage AS completionPercentage, p.updated_at AS updatedAt
      FROM user_progress p
      WHERE p.course_id IN (${courseIds.map(() => '?').join(',')})
      ORDER BY p.updated_at DESC
      LIMIT 50
    `).all(...courseIds)
    : []
  return {
    instructorId,
    assignedCourses,
    students,
    attendance: [],
    labAttempts: [],
    progress,
  }
}

export function getSalesDashboard() {
  const leads = listLeads()
  const stages = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {})
  const sources = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1
    return acc
  }, {})
  const courseWise = db.prepare(`
    SELECT coalesce(c.title, 'Unspecified') AS course, count(*) AS count
    FROM leads l
    LEFT JOIN courses c ON c.id = l.course_id
    GROUP BY coalesce(c.title, 'Unspecified')
    ORDER BY count(*) DESC
  `).all()
  const suggestions = []
  const newLeads = stages.new || 0
  const callbackLeads = leads.filter(lead => /call|callback|counsellor/i.test(`${lead.message} ${lead.source}`)).length
  if (newLeads > 0) suggestions.push(`${newLeads} new lead${newLeads === 1 ? '' : 's'} need first contact.`)
  if (callbackLeads > 0) suggestions.push(`${callbackLeads} lead${callbackLeads === 1 ? '' : 's'} asked for a callback or counsellor contact.`)
  return {
    leads,
    followUps: listFollowUps(),
    visitorAnalytics: getVisitorStats(),
    analytics: {
      totalLeads: leads.length,
      stages,
      sources,
      courseWise,
      suggestions,
    },
  }
}

export function getOpsDashboard() {
  return {
    labs: [],
    labAttempts: [],
    liveClassAttendance: [],
    documentAccessLogs: listDocumentAccessLogs(100),
    systemHealth: {
      status: 'ok',
      store: 'sqlite',
      generatedAt: new Date().toISOString(),
    },
  }
}

export function listUpcomingLiveClasses(userId) {
  return db.prepare(`
    SELECT lc.*, c.title AS course_title
    FROM live_classes lc
    JOIN enrollments e ON e.course_id = lc.course_id AND e.user_id = ? AND e.status = 'active'
    JOIN courses c ON c.id = lc.course_id
    WHERE lc.status = 'scheduled'
    ORDER BY lc.scheduled_start ASC
    LIMIT 10
  `).all(userId)
}

export function listUpcomingLiveClassesForUser(userId) {
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
    provider: row.provider,
    joinUrl: row.join_url,
    embedUrl: row.embed_url,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    status: row.status,
    createdAt: row.created_at,
  }
}

export function createLiveClass(input, actorId = null) {
  const classId = input.id || id('live')
  db.prepare(`
    INSERT INTO live_classes (id, course_id, batch_id, instructor_id, title, provider, join_url, embed_url, scheduled_start, scheduled_end, status)
    VALUES (@id, @courseId, @batchId, @instructorId, @title, @provider, @joinUrl, @embedUrl, @scheduledStart, @scheduledEnd, @status)
  `).run({
    id: classId,
    courseId: input.courseId,
    batchId: input.batchId || null,
    instructorId: input.instructorId || null,
    title: input.title,
    provider: input.provider || 'external',
    joinUrl: input.joinUrl || null,
    embedUrl: input.embedUrl || null,
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
    status: input.status || 'scheduled',
  })
  recordAudit('live_class.create', actorId, 'live_class', classId, { courseId: input.courseId })
  return getLiveClassById(classId)
}

export function updateLiveClass(liveClassId, updates, actorId = null) {
  const allowed = {
    title: 'title',
    provider: 'provider',
    joinUrl: 'join_url',
    embedUrl: 'embed_url',
    scheduledStart: 'scheduled_start',
    scheduledEnd: 'scheduled_end',
    status: 'status',
  }
  const sets = []
  const params = { id: liveClassId }
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] !== undefined) {
      sets.push(`${column} = @${key}`)
      params[key] = updates[key]
    }
  }
  if (!sets.length) return getLiveClassById(liveClassId)
  db.prepare(`UPDATE live_classes SET ${sets.join(', ')} WHERE id = @id`).run(params)
  recordAudit('live_class.update', actorId, 'live_class', liveClassId, updates)
  return getLiveClassById(liveClassId)
}

export function getLiveClassById(liveClassId) {
  return liveClassFromRow(db.prepare(`
    SELECT lc.*, c.title AS course_title, u.name AS instructor_name, u.role AS instructor_title
    FROM live_classes lc
    JOIN courses c ON c.id = lc.course_id
    LEFT JOIN users u ON u.id = lc.instructor_id
    WHERE lc.id = ?
  `).get(liveClassId))
}

export function listLiveClassesByCourse(courseId) {
  return db.prepare(`
    SELECT lc.*, c.title AS course_title, u.name AS instructor_name, u.role AS instructor_title
    FROM live_classes lc
    JOIN courses c ON c.id = lc.course_id
    LEFT JOIN users u ON u.id = lc.instructor_id
    WHERE lc.course_id = ?
    ORDER BY lc.scheduled_start ASC
  `).all(courseId).map(liveClassFromRow)
}

export function recordLiveEvent(liveClassId, userId, event) {
  const eventId = id('att')
  db.prepare(`
    INSERT INTO live_class_attendance (id, live_class_id, user_id, event)
    VALUES (?, ?, ?, ?)
  `).run(eventId, liveClassId, userId, event)
  return db.prepare(`
    SELECT id, live_class_id AS liveClassId, user_id AS userId, event, created_at AS createdAt
    FROM live_class_attendance WHERE id = ?
  `).get(eventId)
}

export function getViewerCount(liveClassId) {
  const joined = db.prepare(`
    SELECT count(*) AS count FROM live_class_attendance WHERE live_class_id = ? AND event = 'join'
  `).get(liveClassId).count
  const left = db.prepare(`
    SELECT count(*) AS count FROM live_class_attendance WHERE live_class_id = ? AND event = 'leave'
  `).get(liveClassId).count
  return Math.max(0, joined - left)
}

export function listAttendance({ liveClassId }) {
  return db.prepare(`
    SELECT a.id, a.live_class_id AS liveClassId, a.user_id AS userId, u.email AS userEmail, a.event, a.created_at AS createdAt
    FROM live_class_attendance a
    JOIN users u ON u.id = a.user_id
    WHERE a.live_class_id = ?
    ORDER BY a.created_at DESC
  `).all(liveClassId)
}

function visitorFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    visitorId: row.visitor_id,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    visits: row.visits,
    consentAnalytics: Boolean(row.consent_analytics),
    consentMarketing: Boolean(row.consent_marketing),
  }
}

function hashIp(ipAddress = '') {
  const salt = process.env.VISITOR_HASH_SALT || process.env.JWT_SECRET || 'cyberlabin-local-salt'
  return createHash('sha256').update(`${salt}:${ipAddress || ''}`).digest('hex')
}

export function recordVisitor({ visitorId, ipAddress, userAgent, consentAnalytics = false, consentMarketing = false }) {
  const safeVisitorId = visitorId || id('visitor')
  const existing = db.prepare('SELECT * FROM visitor_analytics WHERE visitor_id = ?').get(safeVisitorId)
  if (existing) {
    db.prepare(`
      UPDATE visitor_analytics
      SET last_seen_at = datetime('now'),
          visits = visits + 1,
          consent_analytics = CASE WHEN @consentAnalytics = 1 THEN 1 ELSE consent_analytics END,
          consent_marketing = CASE WHEN @consentMarketing = 1 THEN 1 ELSE consent_marketing END,
          user_agent = @userAgent
      WHERE visitor_id = @visitorId
    `).run({
      visitorId: safeVisitorId,
      consentAnalytics: consentAnalytics ? 1 : 0,
      consentMarketing: consentMarketing ? 1 : 0,
      userAgent: userAgent || null,
    })
    return visitorFromRow(db.prepare('SELECT * FROM visitor_analytics WHERE visitor_id = ?').get(safeVisitorId))
  }
  db.prepare(`
    INSERT INTO visitor_analytics (id, visitor_id, consent_analytics, consent_marketing, user_agent, ip_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id('vis'), safeVisitorId, consentAnalytics ? 1 : 0, consentMarketing ? 1 : 0, userAgent || null, hashIp(ipAddress))
  return visitorFromRow(db.prepare('SELECT * FROM visitor_analytics WHERE visitor_id = ?').get(safeVisitorId))
}

export function recordCookieConsent({ visitorId, necessary = true, analytics = false, marketing = false }) {
  if (!visitorId) throw new Error('visitorId is required')
  recordVisitor({ visitorId, consentAnalytics: analytics, consentMarketing: marketing })
  const existing = db.prepare('SELECT id FROM cookie_consents WHERE visitor_id = ?').get(visitorId)
  if (existing) {
    db.prepare(`
      UPDATE cookie_consents
      SET necessary = ?, analytics = ?, marketing = ?, updated_at = datetime('now')
      WHERE visitor_id = ?
    `).run(necessary ? 1 : 0, analytics ? 1 : 0, marketing ? 1 : 0, visitorId)
    return existing.id
  }
  const consentId = id('consent')
  db.prepare(`
    INSERT INTO cookie_consents (id, visitor_id, necessary, analytics, marketing)
    VALUES (?, ?, ?, ?, ?)
  `).run(consentId, visitorId, necessary ? 1 : 0, analytics ? 1 : 0, marketing ? 1 : 0)
  return consentId
}

export function getVisitorStats() {
  const one = (sql) => db.prepare(sql).get().count
  return {
    totalUniqueVisitors: one('SELECT count(*) AS count FROM visitor_analytics'),
    visitorsToday: one("SELECT count(*) AS count FROM visitor_analytics WHERE first_seen_at >= date('now')"),
    visitorsThisWeek: one("SELECT count(*) AS count FROM visitor_analytics WHERE first_seen_at >= datetime('now', '-7 days')"),
    visitorsThisMonth: one("SELECT count(*) AS count FROM visitor_analytics WHERE first_seen_at >= datetime('now', '-30 days')"),
  }
}

export function getAdminAnalytics() {
  const one = (sql) => db.prepare(sql).get().count
  return {
    users: one('SELECT count(*) AS count FROM users'),
    courses: one("SELECT count(*) AS count FROM courses WHERE status = 'published'"),
    enrollments: one("SELECT count(*) AS count FROM enrollments WHERE status = 'active'"),
    materials: one('SELECT count(*) AS count FROM course_materials'),
    documentAccesses: one('SELECT count(*) AS count FROM document_access_logs'),
    leads: one('SELECT count(*) AS count FROM leads'),
    visitors: getVisitorStats(),
  }
}

export function recordAudit(action, actorId, entityType, entityId, metadata = {}) {
  db.prepare(`
    INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id('aud'), actorId || null, action, entityType, entityId || null, JSON.stringify(metadata))
}

export function countAuditActionsSince(actorId, action, entityId, sinceIso) {
  return db.prepare(`
    SELECT count(*) AS count
    FROM audit_logs
    WHERE actor_id = ? AND action = ? AND entity_id = ? AND created_at >= ?
  `).get(actorId, action, entityId, sinceIso).count
}

export function createAiSession(userId, courseId, title = 'Course chat') {
  const sessionId = id('ais')
  db.prepare(`
    INSERT INTO ai_chat_sessions (id, user_id, course_id, title)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, userId, courseId, title)
  return getAiSession(sessionId, userId, courseId)
}

export function getAiSession(sessionId, userId, courseId) {
  return db.prepare(`
    SELECT id, user_id AS userId, course_id AS courseId, title, created_at AS createdAt, updated_at AS updatedAt
    FROM ai_chat_sessions
    WHERE id = ? AND user_id = ? AND course_id = ?
  `).get(sessionId, userId, courseId)
}

export function listAiSessions(userId, courseId) {
  return db.prepare(`
    SELECT id, user_id AS userId, course_id AS courseId, title, created_at AS createdAt, updated_at AS updatedAt
    FROM ai_chat_sessions
    WHERE user_id = ? AND course_id = ?
    ORDER BY updated_at DESC
  `).all(userId, courseId)
}

export function addAiMessage(sessionId, userId, courseId, role, content, citations = []) {
  const existingSession = getAiSession(sessionId, userId, courseId)
  if (!existingSession) throw new Error('AI chat session not found')
  const messageId = id('aim')
  db.prepare(`
    INSERT INTO ai_chat_messages (id, session_id, user_id, course_id, role, content, citations)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(messageId, sessionId, userId, courseId, role, content, JSON.stringify(citations))
  db.prepare("UPDATE ai_chat_sessions SET updated_at = datetime('now') WHERE id = ?").run(sessionId)
  return {
    id: messageId,
    sessionId,
    userId,
    courseId,
    role,
    content,
    citations,
    createdAt: new Date().toISOString(),
  }
}

export function listAiMessages(sessionId, userId, courseId) {
  return db.prepare(`
    SELECT id, session_id AS sessionId, user_id AS userId, course_id AS courseId, role, content, citations, created_at AS createdAt
    FROM ai_chat_messages
    WHERE session_id = ? AND user_id = ? AND course_id = ?
    ORDER BY created_at ASC
  `).all(sessionId, userId, courseId).map(message => ({
    ...message,
    citations: parseJson(message.citations, []),
  }))
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
const VALID_LEAD_SOURCES = ['landing_form', 'chatbot', 'course_popup', 'course_page', 'locked_prompt', 'website']

function normalizeLeadStage(value = 'new') {
  const normalized = String(value || 'new').trim().toLowerCase()
  return VALID_LEAD_STAGES.includes(normalized) ? normalized : 'new'
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').slice(0, 18)
}

export function createLead({
  name = '',
  phone = '',
  email,
  message = '',
  courseId = null,
  source = 'landing_form',
  visitorId = null,
  ipAddress = null,
  userAgent = null,
}) {
  const normalizedName = String(name || '').trim()
  if (normalizedName.length < 2) throw new Error('Name is required')
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error('Enter a valid email address')
  const normalizedPhone = normalizePhone(phone)
  if (normalizedPhone.replace(/\D/g, '').length < 7) throw new Error('Enter a valid phone number')
  const safeMessage = String(message || '').trim()
  if (safeMessage.length < 5) throw new Error('Message is required')
  const safeSource = VALID_LEAD_SOURCES.includes(source) ? source : 'website'
  const recentDuplicate = db.prepare(`
    SELECT id
    FROM leads
    WHERE lower(email) = ?
      AND phone = ?
      AND source = ?
      AND created_at >= datetime('now', '-15 minutes')
    LIMIT 1
  `).get(normalizedEmail, normalizedPhone, safeSource)
  if (recentDuplicate) throw new Error('We already received this request recently. Please wait a few minutes before submitting again.')
  const leadId = id('lead')
  db.prepare(`
    INSERT INTO leads (id, name, phone, email, message, course_id, source, visitor_id, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    leadId,
    normalizedName,
    normalizedPhone,
    normalizedEmail,
    safeMessage,
    courseId || null,
    safeSource,
    visitorId || null,
    ipAddress || null,
    userAgent || null
  )
  return getLead(leadId)
}

export function getLead(leadId) {
  return leadFromRow(db.prepare(`
    SELECT l.*, c.title AS course_title
    FROM leads l
    LEFT JOIN courses c ON c.id = l.course_id
    WHERE l.id = ?
  `).get(leadId))
}

export function listLeads(filters = {}) {
  const clauses = []
  const params = {}
  if (filters.courseId) {
    clauses.push('l.course_id = @courseId')
    params.courseId = filters.courseId
  }
  if (filters.ownerId) {
    clauses.push('l.owner_id = @ownerId')
    params.ownerId = filters.ownerId
  }
  if (filters.stage) {
    clauses.push('l.stage = @stage')
    params.stage = normalizeLeadStage(filters.stage)
  }
  if (filters.status) {
    clauses.push('l.stage = @status')
    params.status = normalizeLeadStage(filters.status)
  }
  if (filters.source) {
    clauses.push('l.source = @source')
    params.source = filters.source
  }
  if (filters.search) {
    clauses.push('(lower(l.name) LIKE @search OR lower(l.email) LIKE @search OR l.phone LIKE @search)')
    params.search = `%${String(filters.search).trim().toLowerCase()}%`
  }
  if (filters.name) {
    clauses.push('lower(l.name) LIKE @name')
    params.name = `%${String(filters.name).trim().toLowerCase()}%`
  }
  if (filters.email) {
    clauses.push('lower(l.email) LIKE @email')
    params.email = `%${String(filters.email).trim().toLowerCase()}%`
  }
  if (filters.phone) {
    clauses.push('l.phone LIKE @phone')
    params.phone = `%${normalizePhone(filters.phone)}%`
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  return db.prepare(`
    SELECT l.*, c.title AS course_title
    FROM leads l
    LEFT JOIN courses c ON c.id = l.course_id
    ${where}
    ORDER BY l.created_at DESC
  `).all(params).map(leadFromRow)
}

export function updateLead(leadId, updates, actorId = null) {
  const allowed = {
    name: 'name',
    phone: 'phone',
    email: 'email',
    message: 'message',
    courseId: 'course_id',
    source: 'source',
    stage: 'stage',
    status: 'stage',
    ownerId: 'owner_id',
  }
  const sets = []
  const params = { id: leadId }
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] !== undefined) {
      sets.push(`${column} = @${key}`)
      if (key === 'email') params[key] = String(updates[key]).trim().toLowerCase()
      else if (key === 'phone') params[key] = normalizePhone(updates[key])
      else if (key === 'stage' || key === 'status') params[key] = normalizeLeadStage(updates[key])
      else params[key] = updates[key]
    }
  }
  if (!sets.length) return getLead(leadId)
  sets.push("updated_at = datetime('now')")
  db.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = @id`).run(params)
  recordAudit('lead.update', actorId, 'lead', leadId, updates)
  return getLead(leadId)
}

export function addLeadNote(leadId, authorId, note) {
  if (!getLead(leadId)) return null
  const noteId = id('lnote')
  db.prepare(`
    INSERT INTO lead_notes (id, lead_id, author_id, note)
    VALUES (?, ?, ?, ?)
  `).run(noteId, leadId, authorId || null, note)
  recordAudit('lead.note', authorId, 'lead', leadId, {})
  return db.prepare(`
    SELECT id, lead_id AS leadId, author_id AS authorId, note, created_at AS createdAt
    FROM lead_notes WHERE id = ?
  `).get(noteId)
}

export function createFollowUp(leadId, ownerId, dueAt, note = '') {
  if (!getLead(leadId)) return null
  const followUpId = id('fup')
  db.prepare(`
    INSERT INTO follow_ups (id, lead_id, owner_id, due_at, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(followUpId, leadId, ownerId || null, dueAt, note)
  recordAudit('follow_up.create', ownerId, 'lead', leadId, { dueAt })
  return getFollowUp(followUpId)
}

export function getFollowUp(followUpId) {
  return db.prepare(`
    SELECT id, lead_id AS leadId, owner_id AS ownerId, due_at AS dueAt, note, status, created_at AS createdAt
    FROM follow_ups WHERE id = ?
  `).get(followUpId)
}

export function listFollowUps(filters = {}) {
  const clauses = []
  const params = {}
  if (filters.status) {
    clauses.push('status = @status')
    params.status = filters.status
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  return db.prepare(`
    SELECT id, lead_id AS leadId, owner_id AS ownerId, due_at AS dueAt, note, status, created_at AS createdAt
    FROM follow_ups
    ${where}
    ORDER BY due_at ASC
  `).all(params)
}

export function getAuditLogs(limit = 50) {
  return db.prepare(`
    SELECT a.*, u.email AS actor_email
    FROM audit_logs a
    LEFT JOIN users u ON u.id = a.actor_id
    ORDER BY a.created_at DESC
    LIMIT ?
  `).all(limit).map(row => ({
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

export function listDocumentAccessLogs(limit = 100) {
  return db.prepare(`
    SELECT dl.*, u.email AS user_email, c.title AS course_title, cm.title AS material_title
    FROM document_access_logs dl
    JOIN users u ON u.id = dl.user_id
    JOIN courses c ON c.id = dl.course_id
    JOIN course_materials cm ON cm.id = dl.material_id
    ORDER BY dl.created_at DESC
    LIMIT ?
  `).all(limit)
}

export function recordDocumentAccess({ userId, courseId, materialId, event, ipAddress, userAgent }) {
  db.prepare(`
    INSERT INTO document_access_logs (id, user_id, course_id, material_id, event, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id('doclog'), userId, courseId, materialId, event, ipAddress || null, userAgent || null)
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
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function listPublishedBlogs() {
  return db.prepare(`
    SELECT * FROM blogs
    WHERE status = 'published'
    ORDER BY created_at DESC
  `).all().map(blogFromRow)
}

export function getPublishedBlogBySlug(slug) {
  return blogFromRow(db.prepare(`
    SELECT * FROM blogs
    WHERE slug = ? AND status = 'published'
  `).get(slug))
}
