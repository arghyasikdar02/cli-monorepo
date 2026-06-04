// Legacy in-memory fallback store for routes not yet migrated to the SQLite repository.
// Active auth, courses, enrollments, leads, analytics, audits, and leaderboards use the database repository.

let idCounter = 1
const now = () => new Date().toISOString()
const nextId = (prefix) => `${prefix}_${Date.now()}_${idCounter++}`

export const courses = [
  {
    id: 'c001',
    title: 'Introduction to Cyber Security',
    slug: 'introduction-to-cyber-security',
    description: 'A practical beginner program covering scam awareness, digital footprint review, phishing safety, account protection, and core defensive thinking.',
    status: 'published',
    level: 'Beginner',
    duration: '7h',
    price: 0,
    instructorId: 'usr_instructor',
    tags: ['Beginner', 'Personal Safety', 'Labs'],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'c002',
    title: 'Cyber Security Essentials',
    slug: 'cyber-security-essentials',
    description: 'A practical web security foundation covering HTTP, unsafe input, SQL Injection concepts, XSS concepts, sessions, and defensive reporting.',
    status: 'published',
    level: 'Beginner',
    duration: '7h',
    price: 0,
    instructorId: 'usr_instructor',
    tags: ['Web Security', 'Hands-On', 'AI'],
    createdAt: now(),
    updatedAt: now(),
  },
]

export const batches = [
  { id: 'batch_intro_001', courseId: 'c001', name: 'Introduction Cohort 001', status: 'active', startsAt: '2026-06-01T00:00:00.000Z', endsAt: null, createdAt: now() },
  { id: 'batch_web_001', courseId: 'c002', name: 'Essentials Cohort 001', status: 'active', startsAt: '2026-06-01T00:00:00.000Z', endsAt: null, createdAt: now() },
]

export const enrollments = [
  { id: 'enr_001', userId: 'usr_001', courseId: 'c001', batchId: 'batch_intro_001', status: 'active', source: 'seed', createdAt: now() },
  { id: 'enr_002', userId: 'usr_student', courseId: 'c001', batchId: 'batch_intro_001', status: 'active', source: 'seed', createdAt: now() },
]

export const lessons = [
  { id: 'l001_01_01', courseId: 'c001', moduleId: 'm001_01', title: 'Digital Footprint Basics', order: 1, status: 'published', createdAt: now() },
  { id: 'l002_01_01', courseId: 'c002', moduleId: 'm002_01', title: 'Browser-Server-Database Model', order: 1, status: 'published', createdAt: now() },
]

export const liveClasses = [
  {
    id: 'lc001',
    courseId: 'c001',
    batchId: 'batch_intro_001',
    instructorId: 'usr_instructor',
    title: 'Introduction to Cyber Security Lab Walkthrough',
    provider: 'external_embed',
    embedUrl: 'https://example.com/embed/intro-lab',
    joinUrl: 'https://example.com/join/intro-lab',
    scheduledStart: '2026-06-03T10:00:00.000Z',
    scheduledEnd: '2026-06-03T11:00:00.000Z',
    joinWindowBeforeMinutes: 15,
    joinWindowAfterMinutes: 15,
    recordingUrl: null,
    recordingStatus: 'not_available',
    status: 'scheduled',
    createdAt: now(),
  },
  {
    id: 'lc002',
    courseId: 'c002',
    batchId: 'batch_web_001',
    instructorId: 'usr_instructor',
    title: 'Cyber Security Essentials Lab Walkthrough',
    provider: 'external_embed',
    embedUrl: 'https://example.com/embed/web-lab',
    joinUrl: 'https://example.com/join/web-lab',
    scheduledStart: '2026-06-04T10:00:00.000Z',
    scheduledEnd: '2026-06-04T11:00:00.000Z',
    joinWindowBeforeMinutes: 15,
    joinWindowAfterMinutes: 15,
    recordingUrl: null,
    recordingStatus: 'not_available',
    status: 'scheduled',
    createdAt: now(),
  },
]

export const liveClassAttendance = []

export const videos = [
  { id: 'vid001', courseId: 'c001', title: 'Digital Footprint Basics', provider: 'youtube_unlisted', embedId: 'intro-digital-footprint', order: 1, createdAt: now() },
  { id: 'vid002', courseId: 'c002', title: 'HTTP Request Structure', provider: 'youtube_unlisted', embedId: 'web-http-basics', order: 1, createdAt: now() },
]

export const documents = [
  { id: 'doc001', courseId: 'c001', title: 'Introduction to Cyber Security Workbook', storageKey: 'private/c001/workbook.pdf', pageCount: 24, status: 'active', createdAt: now() },
  { id: 'doc002', courseId: 'c002', title: 'Cyber Security Essentials Workbook', storageKey: 'private/c002/workbook.pdf', pageCount: 28, status: 'active', createdAt: now() },
]

export const documentAccessLogs = []

export const labs = [
  { id: 'lab001', courseId: 'c001', lessonId: 'l001_01_01', title: 'Spot the Phishing Pattern', description: 'Review a simulated message and identify defensive red flags.', points: 50, hints: ['Check sender identity.', 'Look for urgency and unsafe links.'], dockerReady: true, unsafeCloudInfra: false, status: 'published', createdAt: now() },
  { id: 'lab002', courseId: 'c002', lessonId: 'l002_01_01', title: 'Unsafe Input Review', description: 'Inspect a controlled training form and identify input validation risks.', points: 75, hints: ['Compare client and server validation.', 'Look for untrusted input boundaries.'], dockerReady: true, unsafeCloudInfra: false, status: 'published', createdAt: now() },
]

export const labAttempts = []
export const labFlags = [
  { id: 'flag001', labId: 'lab001', courseId: 'c001', value: 'DEFEND', points: 50, createdAt: now() },
  { id: 'flag002', labId: 'lab002', courseId: 'c002', value: 'WEBSAFE', points: 75, createdAt: now() },
]

export const quizzes = [
  {
    id: 'q001',
    courseId: 'c001',
    title: 'Introduction to Cyber Security Checkpoint',
    status: 'published',
    questions: [
      { id: 'qq001', prompt: 'What is a safe first step when a message creates urgency?', choices: ['Verify through another channel', 'Click immediately', 'Forward it'], answer: 'Verify through another channel' },
    ],
    createdAt: now(),
  },
  {
    id: 'q002',
    courseId: 'c002',
    title: 'Cyber Security Essentials Checkpoint',
    status: 'published',
    questions: [
      { id: 'qq002', prompt: 'What should server-side validation protect?', choices: ['Trusted input only', 'All untrusted input', 'Only images'], answer: 'All untrusted input' },
    ],
    createdAt: now(),
  },
]

export const quizAttempts = []

export const assignments = [
  { id: 'asn001', courseId: 'c001', title: 'Account Safety Checklist', description: 'Submit a short checklist of three account hardening actions.', status: 'published', dueAt: null, createdAt: now() },
]

export const submissions = []

export const progress = [
  { id: 'prg001', userId: 'usr_student', courseId: 'c001', lessonProgress: 18, videoProgress: 12, documentProgress: 5, labProgress: 0, quizProgress: 0, completionPercentage: 9, updatedAt: now() },
  { id: 'prg002', userId: 'usr_001', courseId: 'c001', lessonProgress: 38, videoProgress: 44, documentProgress: 20, labProgress: 10, quizProgress: 0, completionPercentage: 24, updatedAt: now() },
]

export const certificates = []

export const aiChatSessions = [
  { id: 'ais001', userId: 'usr_student', courseId: 'c001', title: 'Getting started', createdAt: now(), updatedAt: now() },
]

export const aiChatMessages = [
  { id: 'aim001', sessionId: 'ais001', userId: 'usr_student', courseId: 'c001', role: 'assistant', content: 'Ask me about the Introduction to Cyber Security course and I will keep the answer course-specific.', createdAt: now() },
]

export const ragSources = [
  { id: 'kb001', courseId: 'c001', title: 'Cyber safety course outline', status: 'ready', sourceType: 'seed', createdAt: now() },
  { id: 'kb002', courseId: 'c002', title: 'Web security course outline', status: 'ready', sourceType: 'seed', createdAt: now() },
]

export const ragChunks = [
  { id: 'chunk001', sourceId: 'kb001', courseId: 'c001', content: 'Introduction to Cyber Security covers digital footprint review, scam psychology, phishing red flags, account hardening, and everyday cyber safety.', citation: 'Cyber safety course outline', createdAt: now() },
  { id: 'chunk002', sourceId: 'kb002', courseId: 'c002', content: 'Cyber Security Essentials covers HTTP, unsafe input, SQL Injection concepts, XSS concepts, session security, and defensive reporting.', citation: 'Web security course outline', createdAt: now() },
]

export const leads = []

export const leadNotes = []
export const followUps = []

export const payments = []
export const paymentIntents = []
export const processedPaymentEvents = new Set()
export const analyticsEvents = []

export const auditLogs = [
  { id: 'aud001', actorId: 'system', action: 'seed.loaded', targetType: 'system', targetId: 'legacy-mvp', metadata: {}, createdAt: now() },
]

export function recordAudit(action, actorId = 'system', targetType = 'system', targetId = null, metadata = {}) {
  const log = { id: nextId('aud'), actorId, action, targetType, targetId, metadata, createdAt: now() }
  auditLogs.unshift(log)
  return log
}

export function recordAnalyticsEvent(eventName, actorId = null, courseId = null, metadata = {}) {
  const event = { id: nextId('evt'), eventName, actorId, courseId, metadata, createdAt: now() }
  analyticsEvents.unshift(event)
  return event
}

export function getAuditLogs(filter = {}) {
  return auditLogs.filter(log => {
    if (filter.actorId && log.actorId !== filter.actorId) return false
    if (filter.action && !log.action.includes(filter.action)) return false
    return true
  })
}

export function getCourseById(courseId) {
  return courses.find(course => course.id === courseId) || null
}

export function getBatchById(batchId) {
  return batches.find(batch => batch.id === batchId) || null
}

export function getLessonById(lessonId) {
  return lessons.find(lesson => lesson.id === lessonId) || null
}

export function isInstructorAssigned(userId, courseId) {
  const course = getCourseById(courseId)
  return Boolean(course && course.instructorId === userId)
}

export function listPublicCourses() {
  return courses.filter(course => course.status === 'published')
}

export function createCourse(data, actorId) {
  const course = {
    id: data.id || nextId('course'),
    title: data.title,
    slug: data.slug || String(data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: data.description || '',
    status: data.status || 'draft',
    level: data.level || 'Beginner',
    duration: data.duration || null,
    price: data.price || 0,
    instructorId: data.instructorId || null,
    tags: data.tags || [],
    createdAt: now(),
    updatedAt: now(),
  }
  courses.push(course)
  recordAudit('course.create', actorId, 'course', course.id, { title: course.title })
  return course
}

export function updateCourse(courseId, updates, actorId) {
  const course = getCourseById(courseId)
  if (!course) return null
  Object.assign(course, updates, { updatedAt: now() })
  recordAudit('course.update', actorId, 'course', course.id, updates)
  return course
}

export function publishCourse(courseId, actorId) {
  return updateCourse(courseId, { status: 'published' }, actorId)
}

export function archiveCourse(courseId, actorId) {
  return updateCourse(courseId, { status: 'archived' }, actorId)
}

export function hasActiveEnrollment(userId, courseId, batchId = null) {
  return enrollments.some(enrollment =>
    enrollment.userId === userId &&
    enrollment.courseId === courseId &&
    enrollment.status === 'active' &&
    (!batchId || enrollment.batchId === batchId)
  )
}

export function hasBatchMembership(userId, courseId, batchId) {
  if (!batchId) return false
  const batch = getBatchById(batchId)
  if (!batch || batch.courseId !== courseId || batch.status !== 'active') return false
  return hasActiveEnrollment(userId, courseId, batchId)
}

export function listEnrollmentsByUser(userId) {
  return enrollments.filter(enrollment => enrollment.userId === userId)
}

export function listEnrollmentsByCourse(courseId) {
  return enrollments.filter(enrollment => enrollment.courseId === courseId)
}

export function listEnrolledCourses(userId) {
  return listEnrollmentsByUser(userId)
    .filter(enrollment => enrollment.status === 'active')
    .map(enrollment => ({ ...getCourseById(enrollment.courseId), enrollment }))
    .filter(course => course.id)
}

export function addEnrollment(data, actorId = 'system') {
  const existing = enrollments.find(enrollment => enrollment.userId === data.userId && enrollment.courseId === data.courseId)
  if (existing) {
    Object.assign(existing, { status: data.status || 'active', batchId: data.batchId || existing.batchId, updatedAt: now() })
    recordAudit('enrollment.update', actorId, 'enrollment', existing.id, existing)
    return existing
  }
  const enrollment = {
    id: nextId('enr'),
    userId: data.userId,
    courseId: data.courseId,
    batchId: data.batchId || null,
    status: data.status || 'active',
    source: data.source || 'manual',
    createdAt: now(),
  }
  enrollments.push(enrollment)
  recordAudit('enrollment.add', actorId, 'enrollment', enrollment.id, enrollment)
  return enrollment
}

export function createLiveClass(data, actorId) {
  const liveClass = {
    id: nextId('lc'),
    courseId: data.courseId,
    batchId: data.batchId || null,
    instructorId: data.instructorId,
    title: data.title,
    provider: data.provider || 'external_embed',
    embedUrl: data.embedUrl || null,
    joinUrl: data.joinUrl || null,
    scheduledStart: data.scheduledStart,
    scheduledEnd: data.scheduledEnd,
    joinWindowBeforeMinutes: Number(data.joinWindowBeforeMinutes ?? 15),
    joinWindowAfterMinutes: Number(data.joinWindowAfterMinutes ?? 15),
    recordingUrl: data.recordingUrl || null,
    recordingStatus: data.recordingStatus || 'not_available',
    status: data.status || 'scheduled',
    createdAt: now(),
  }
  liveClasses.push(liveClass)
  recordAudit('live_class.create', actorId, 'live_class', liveClass.id, liveClass)
  return liveClass
}

export function updateLiveClass(liveClassId, updates, actorId) {
  const liveClass = liveClasses.find(item => item.id === liveClassId)
  if (!liveClass) return null
  Object.assign(liveClass, updates, { updatedAt: now() })
  recordAudit('live_class.update', actorId, 'live_class', liveClass.id, updates)
  return liveClass
}

export function getLiveClassById(liveClassId) {
  return liveClasses.find(item => item.id === liveClassId) || null
}

export function listLiveClassesByCourse(courseId) {
  return liveClasses.filter(item => item.courseId === courseId)
}

export function listUpcomingLiveClassesForUser(userId) {
  const activeEnrollments = listEnrollmentsByUser(userId).filter(item => item.status === 'active')
  return liveClasses.filter(item => activeEnrollments.some(enrollment =>
    enrollment.courseId === item.courseId &&
    (!item.batchId || enrollment.batchId === item.batchId)
  ))
}

export function getLiveClassJoinDecision(liveClass, user, at = new Date()) {
  if (!liveClass) return { allowed: false, reason: 'live_class_not_found' }
  if (!user) return { allowed: false, reason: 'auth_required' }
  const start = Date.parse(liveClass.scheduledStart)
  const end = Date.parse(liveClass.scheduledEnd)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return { allowed: false, reason: 'invalid_live_class_window' }
  const beforeMs = Number(liveClass.joinWindowBeforeMinutes ?? 15) * 60 * 1000
  const afterMs = Number(liveClass.joinWindowAfterMinutes ?? 15) * 60 * 1000
  const atMs = at instanceof Date ? at.getTime() : Date.parse(at)
  if (atMs < start - beforeMs) return { allowed: false, reason: 'outside_join_window_early' }
  if (atMs > end + afterMs) return { allowed: false, reason: 'outside_join_window_late' }
  if (!hasActiveEnrollment(user.id, liveClass.courseId, liveClass.batchId)) return { allowed: false, reason: 'active_enrollment_required' }
  return { allowed: true, reason: 'allowed' }
}

export function recordLiveEvent(liveClassId, userId, eventType) {
  const liveClass = getLiveClassById(liveClassId)
  if (!liveClass) return null
  if (eventType === 'join') {
    const attendance = {
      id: nextId('att'),
      liveClassId,
      courseId: liveClass.courseId,
      batchId: liveClass.batchId,
      userId,
      joinedAt: now(),
      leftAt: null,
      watchSeconds: 0,
      status: 'online',
    }
    liveClassAttendance.push(attendance)
    recordAudit('live_class.join', userId, 'live_class', liveClassId, { attendanceId: attendance.id })
    recordAnalyticsEvent('live_class.join', userId, liveClass.courseId, { liveClassId, batchId: liveClass.batchId })
    return attendance
  }
  const active = [...liveClassAttendance].reverse().find(item => item.liveClassId === liveClassId && item.userId === userId && item.status === 'online')
  if (!active) return null
  active.leftAt = now()
  active.status = 'left'
  active.watchSeconds = Math.max(0, Math.round((Date.parse(active.leftAt) - Date.parse(active.joinedAt)) / 1000))
  recordAudit('live_class.leave', userId, 'live_class', liveClassId, { attendanceId: active.id, watchSeconds: active.watchSeconds })
  recordAnalyticsEvent('live_class.leave', userId, active.courseId, { liveClassId, batchId: active.batchId, watchSeconds: active.watchSeconds })
  return active
}

export function getViewerCount(liveClassId) {
  return liveClassAttendance.filter(item => item.liveClassId === liveClassId && item.status === 'online').length
}

export function listAttendance(filter = {}) {
  return liveClassAttendance.filter(item => {
    if (filter.liveClassId && item.liveClassId !== filter.liveClassId) return false
    if (filter.courseId && item.courseId !== filter.courseId) return false
    if (filter.userId && item.userId !== filter.userId) return false
    return true
  })
}

export function listVideosByCourse(courseId) {
  return videos.filter(video => video.courseId === courseId)
}

export function registerVideo(data, actorId) {
  const video = { id: nextId('vid'), courseId: data.courseId, title: data.title, provider: data.provider, embedId: data.embedId, order: data.order || 0, createdAt: now() }
  videos.push(video)
  recordAudit('video.register', actorId, 'video', video.id, video)
  return video
}

export function listDocumentsByCourse(courseId) {
  return documents.filter(document => document.courseId === courseId && document.status !== 'archived')
}

export function getDocumentById(documentId) {
  return documents.find(document => document.id === documentId) || null
}

export function registerDocument(data, actorId) {
  const document = { id: nextId('doc'), courseId: data.courseId, title: data.title, storageKey: data.storageKey, pageCount: data.pageCount || null, status: 'active', createdAt: now() }
  documents.push(document)
  recordAudit('document.register', actorId, 'document', document.id, { courseId: document.courseId, title: document.title })
  recordAnalyticsEvent('document.register', actorId, document.courseId, { documentId: document.id })
  return document
}

export function logDocumentAccess(documentId, userId, metadata = {}) {
  const document = getDocumentById(documentId)
  if (!document) return null
  const log = { id: nextId('doclog'), documentId, courseId: document.courseId, userId, metadata, createdAt: now() }
  documentAccessLogs.unshift(log)
  recordAudit('document.access', userId, 'document', documentId, metadata)
  recordAnalyticsEvent('document.access', userId, document.courseId, { documentId, ...metadata })
  return log
}

export function listLabsByCourse(courseId) {
  return labs.filter(lab => lab.courseId === courseId && lab.status !== 'archived')
}

export function getLabById(labId) {
  return labs.find(lab => lab.id === labId) || null
}

export function assignLabToCourse(labId, courseId, actorId) {
  const lab = getLabById(labId)
  if (!lab) return null
  lab.courseId = courseId
  lab.updatedAt = now()
  recordAudit('lab.assign_course', actorId, 'lab', labId, { courseId })
  return lab
}

export function createLab(data, actorId) {
  const lab = {
    id: nextId('lab'),
    courseId: data.courseId,
    lessonId: data.lessonId || null,
    title: data.title,
    description: data.description || '',
    points: data.points || 0,
    hints: data.hints || [],
    dockerReady: data.dockerReady !== false,
    unsafeCloudInfra: false,
    status: data.status || 'draft',
    createdAt: now(),
  }
  labs.push(lab)
  if (data.flag) labFlags.push({ id: nextId('flag'), labId: lab.id, courseId: lab.courseId, value: data.flag, points: lab.points, createdAt: now() })
  recordAudit('lab.create', actorId, 'lab', lab.id, { courseId: lab.courseId, title: lab.title })
  return lab
}

export function launchLab(labId, userId) {
  const lab = labs.find(item => item.id === labId)
  if (!lab) return null
  const attempt = { id: nextId('labatt'), labId, courseId: lab.courseId, userId, status: 'started', score: 0, startedAt: now(), submittedAt: null }
  labAttempts.push(attempt)
  recordAudit('lab.launch', userId, 'lab', labId, { attemptId: attempt.id })
  return attempt
}

export function submitLabFlag(labId, userId, flag) {
  const lab = labs.find(item => item.id === labId)
  if (!lab) return null
  const matchingFlag = labFlags.find(item => item.labId === labId && String(flag || '').trim().toUpperCase() === String(item.value).toUpperCase())
  const passed = Boolean(matchingFlag)
  const attempt = { id: nextId('labatt'), labId, courseId: lab.courseId, userId, status: passed ? 'passed' : 'failed', score: passed ? matchingFlag.points : 0, submittedAt: now() }
  labAttempts.push(attempt)
  recordAudit('lab.submit_flag', userId, 'lab', labId, { passed })
  recordAnalyticsEvent('lab.submit_flag', userId, lab.courseId, { labId, passed, score: attempt.score })
  return attempt
}

export function listLabAttempts(filter = {}) {
  return labAttempts.filter(item => {
    if (filter.courseId && item.courseId !== filter.courseId) return false
    if (filter.userId && item.userId !== filter.userId) return false
    if (filter.labId && item.labId !== filter.labId) return false
    return true
  })
}

export function createQuiz(data, actorId) {
  const quiz = { id: nextId('quiz'), courseId: data.courseId, title: data.title, status: data.status || 'draft', questions: data.questions || [], createdAt: now() }
  quizzes.push(quiz)
  recordAudit('quiz.create', actorId, 'quiz', quiz.id, { courseId: quiz.courseId, title: quiz.title })
  return quiz
}

export function addQuizQuestion(quizId, question, actorId) {
  const quiz = quizzes.find(item => item.id === quizId)
  if (!quiz) return null
  const nextQuestion = { id: nextId('qq'), ...question }
  quiz.questions.push(nextQuestion)
  recordAudit('quiz.add_question', actorId, 'quiz', quiz.id, { questionId: nextQuestion.id })
  return nextQuestion
}

export function listQuizzesByCourse(courseId) {
  return quizzes.filter(quiz => quiz.courseId === courseId)
}

export function getQuizById(quizId) {
  return quizzes.find(quiz => quiz.id === quizId) || null
}

export function submitQuizAttempt(quizId, userId, answers = {}) {
  const quiz = quizzes.find(item => item.id === quizId)
  if (!quiz) return null
  const correct = quiz.questions.filter(question => answers[question.id] === question.answer).length
  const score = quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0
  const attempt = { id: nextId('qatt'), quizId, courseId: quiz.courseId, userId, answers, score, submittedAt: now() }
  quizAttempts.push(attempt)
  recordAudit('quiz.submit', userId, 'quiz', quizId, { score })
  return attempt
}

export function createAssignment(data, actorId) {
  const assignment = { id: nextId('asn'), courseId: data.courseId, title: data.title, description: data.description || '', status: data.status || 'draft', dueAt: data.dueAt || null, createdAt: now() }
  assignments.push(assignment)
  recordAudit('assignment.create', actorId, 'assignment', assignment.id, { courseId: assignment.courseId })
  return assignment
}

export function submitAssignment(assignmentId, userId, content) {
  const assignment = assignments.find(item => item.id === assignmentId)
  if (!assignment) return null
  const submission = { id: nextId('sub'), assignmentId, courseId: assignment.courseId, userId, content, status: 'submitted', score: null, feedback: null, submittedAt: now() }
  submissions.push(submission)
  recordAudit('assignment.submit', userId, 'assignment', assignmentId, {})
  return submission
}

export function reviewAssignment(submissionId, reviewerId, review) {
  const submission = submissions.find(item => item.id === submissionId)
  if (!submission) return null
  Object.assign(submission, { status: 'reviewed', score: review.score || null, feedback: review.feedback || null, reviewedBy: reviewerId, reviewedAt: now() })
  recordAudit('assignment.review', reviewerId, 'submission', submissionId, { score: submission.score })
  return submission
}

export function listAssignmentsByCourse(courseId) {
  return assignments.filter(assignment => assignment.courseId === courseId)
}

export function getAssignmentById(assignmentId) {
  return assignments.find(assignment => assignment.id === assignmentId) || null
}

export function getCourseProgress(userId, courseId) {
  return progress.find(item => item.userId === userId && item.courseId === courseId) || {
    id: null,
    userId,
    courseId,
    lessonProgress: 0,
    videoProgress: 0,
    documentProgress: 0,
    labProgress: 0,
    quizProgress: 0,
    completionPercentage: 0,
  }
}

export function updateCourseProgress(userId, courseId, updates) {
  let item = progress.find(row => row.userId === userId && row.courseId === courseId)
  if (!item) {
    item = { id: nextId('prg'), userId, courseId, lessonProgress: 0, videoProgress: 0, documentProgress: 0, labProgress: 0, quizProgress: 0, completionPercentage: 0, updatedAt: now() }
    progress.push(item)
  }
  Object.assign(item, updates, { updatedAt: now() })
  const pieces = ['lessonProgress', 'videoProgress', 'documentProgress', 'labProgress', 'quizProgress']
  item.completionPercentage = Math.round(pieces.reduce((sum, key) => sum + Number(item[key] || 0), 0) / pieces.length)
  recordAudit('progress.update', userId, 'course', courseId, { completionPercentage: item.completionPercentage })
  return item
}

export function issueCertificate(data, actorId) {
  const certificate = { id: nextId('cert'), userId: data.userId, courseId: data.courseId, code: data.code || nextId('CLI-CERT'), issuedBy: actorId, issuedAt: now(), status: 'issued' }
  certificates.push(certificate)
  recordAudit('certificate.issue', actorId, 'certificate', certificate.id, certificate)
  return certificate
}

export function verifyCertificate(code) {
  return certificates.find(certificate => certificate.code === code && certificate.status === 'issued') || null
}

export function listCertificates(filter = {}) {
  return certificates.filter(item => {
    if (filter.userId && item.userId !== filter.userId) return false
    if (filter.courseId && item.courseId !== filter.courseId) return false
    return true
  })
}

export function listAiSessions(userId, courseId) {
  return aiChatSessions.filter(session => session.userId === userId && session.courseId === courseId)
}

export function createAiSession(userId, courseId, title = 'New chat') {
  const session = { id: nextId('ais'), userId, courseId, title, createdAt: now(), updatedAt: now() }
  aiChatSessions.push(session)
  return session
}

export function getAiMessages(sessionId, userId, courseId) {
  return aiChatMessages.filter(message => message.sessionId === sessionId && message.userId === userId && message.courseId === courseId)
}

export function getAiUsage(userId, courseId) {
  return aiChatMessages.filter(message => message.userId === userId && message.courseId === courseId && message.role === 'user').length
}

export function addAiMessage(sessionId, userId, courseId, role, content) {
  const message = { id: nextId('aim'), sessionId, userId, courseId, role, content, createdAt: now() }
  aiChatMessages.push(message)
  const session = aiChatSessions.find(item => item.id === sessionId)
  if (session) session.updatedAt = now()
  return message
}

export function courseMaterialReply(courseId, prompt) {
  const course = getCourseById(courseId)
  return courseMaterialAnswer(courseId, prompt).answer || (course ? `From ${course.title}: focus on the practical defensive workflow.` : 'I cannot answer because the selected course was not found.')
}

export function listKnowledgeBaseDocuments(courseId) {
  return ragSources.filter(document => document.courseId === courseId)
}

export const knowledgeBaseDocuments = ragSources

export function ingestRagSource(data, actorId) {
  const source = { id: nextId('kb'), courseId: data.courseId, title: data.title, status: 'ready', sourceType: data.sourceType || 'manual', createdAt: now() }
  ragSources.push(source)
  const chunks = (data.chunks || [data.content || '']).filter(Boolean).map(content => {
    const chunk = { id: nextId('chunk'), sourceId: source.id, courseId: source.courseId, content, citation: source.title, createdAt: now() }
    ragChunks.push(chunk)
    return chunk
  })
  recordAudit('rag.ingest', actorId, 'rag_source', source.id, { courseId: source.courseId, chunks: chunks.length })
  return { source, chunks }
}

export function retrieveRagChunks(courseId, query, limit = 3) {
  const terms = String(query || '').toLowerCase().split(/\s+/).filter(Boolean)
  return ragChunks
    .filter(chunk => chunk.courseId === courseId)
    .map(chunk => ({
      ...chunk,
      score: terms.reduce((sum, term) => sum + (chunk.content.toLowerCase().includes(term) ? 1 : 0), 0),
    }))
    .filter(chunk => chunk.score > 0 || terms.length === 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function courseMaterialAnswer(courseId, prompt) {
  const course = getCourseById(courseId)
  const text = String(prompt || '')
  if (!course) {
    return { refused: true, answer: 'I cannot answer because the selected course was not found.', citations: [] }
  }
  const otherCourses = courses.filter(item => item.id !== courseId)
  const asksOtherCourse = otherCourses.some(item =>
    text.toLowerCase().includes(item.title.toLowerCase()) ||
    text.toLowerCase().includes(item.slug.toLowerCase())
  ) || /another course|other course|course b|course a/i.test(text)
  if (asksOtherCourse) {
    return {
      refused: true,
      answer: 'I can only answer from the selected course knowledge base. Please switch courses if you want help with different material.',
      citations: [],
    }
  }
  const chunks = retrieveRagChunks(courseId, text)
  if (!chunks.length) {
    return {
      refused: true,
      answer: 'I could not find this in the selected course knowledge base, so I should not guess.',
      citations: [],
    }
  }
  return {
    refused: false,
    answer: `From ${course.title}: ${chunks[0].content}`,
    citations: chunks.map(chunk => ({ sourceId: chunk.sourceId, chunkId: chunk.id, title: chunk.citation })),
  }
}

export function createLead(data) {
  const score = scoreLead(data)
  const lead = {
    id: nextId('lead'),
    name: data.name || 'Unknown',
    email: data.email,
    phone: data.phone || null,
    courseId: data.courseId || null,
    source: data.source || 'website',
    stage: data.stage || 'new',
    ownerId: data.ownerId || null,
    status: data.status || (score >= 75 ? 'hot' : score >= 40 ? 'warm' : 'cold'),
    score,
    followUpDate: data.followUpDate || null,
    createdAt: now(),
    updatedAt: now(),
  }
  leads.unshift(lead)
  recordAudit('lead.create', 'system', 'lead', lead.id, { source: lead.source, courseId: lead.courseId })
  recordAnalyticsEvent('lead.create', null, lead.courseId, { source: lead.source, score: lead.score })
  return lead
}

export function scoreLead(data = {}) {
  let score = 20
  if (data.courseId) score += 20
  if (data.source && ['course_page', 'locked_course_card', 'pricing', 'post_login'].includes(data.source)) score += 20
  if (data.phone) score += 15
  if (data.email && /@(gmail|outlook|yahoo|icloud)\./i.test(data.email)) score += 5
  if (data.stage === 'qualified') score += 25
  return Math.min(score, 100)
}

export function listLeads(filter = {}) {
  return leads.filter(lead => {
    if (filter.courseId && lead.courseId !== filter.courseId) return false
    if (filter.ownerId && lead.ownerId !== filter.ownerId) return false
    if (filter.stage && lead.stage !== filter.stage) return false
    return true
  })
}

export function updateLead(leadId, updates, actorId) {
  const lead = leads.find(item => item.id === leadId)
  if (!lead) return null
  Object.assign(lead, updates, { updatedAt: now() })
  recordAudit('lead.update', actorId, 'lead', leadId, updates)
  return lead
}

export function addLeadNote(leadId, actorId, note) {
  const lead = leads.find(item => item.id === leadId)
  if (!lead) return null
  const row = { id: nextId('lnote'), leadId, actorId, note, createdAt: now() }
  leadNotes.unshift(row)
  recordAudit('lead.note', actorId, 'lead', leadId, {})
  return row
}

export function createFollowUp(leadId, actorId, dueAt, note = '') {
  const lead = leads.find(item => item.id === leadId)
  if (!lead) return null
  const followUp = { id: nextId('follow'), leadId, ownerId: actorId, dueAt, note, status: 'open', createdAt: now() }
  followUps.unshift(followUp)
  lead.followUpDate = dueAt
  lead.updatedAt = now()
  recordAudit('lead.follow_up.create', actorId, 'lead', leadId, { followUpId: followUp.id, dueAt })
  return followUp
}

export function getSalesAnalytics() {
  const courseWise = courses.map(course => ({
    courseId: course.id,
    title: course.title,
    leads: leads.filter(lead => lead.courseId === course.id).length,
    hot: leads.filter(lead => lead.courseId === course.id && lead.status === 'hot').length,
  }))
  return {
    totalLeads: leads.length,
    openFollowUps: followUps.filter(item => item.status === 'open').length,
    courseWise,
    stages: leads.reduce((acc, lead) => ({ ...acc, [lead.stage]: (acc[lead.stage] || 0) + 1 }), {}),
    suggestions: ['Follow up with hot leads within 24 hours.', 'Create a short intro lab walkthrough for undecided course leads.'],
  }
}

export function createPaymentOrder(data, actorId = 'system') {
  const payment = {
    id: nextId('pay'),
    userId: data.userId || null,
    courseId: data.courseId,
    amount: data.amount || 0,
    currency: data.currency || 'INR',
    provider: 'razorpay',
    providerOrderId: data.providerOrderId || nextId('rzp_order'),
    status: 'created',
    metadata: data.metadata || {},
    createdAt: now(),
  }
  payments.push(payment)
  paymentIntents.push({
    id: payment.id,
    userId: payment.userId,
    courseId: payment.courseId,
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    providerIntentId: payment.providerOrderId,
    status: payment.status,
    metadata: payment.metadata,
    createdAt: payment.createdAt,
  })
  recordAudit('payment.create', actorId, 'payment', payment.id, payment)
  recordAnalyticsEvent('payment_intent.create', actorId, payment.courseId, { paymentId: payment.id, amount: payment.amount })
  return payment
}

export function recordPaymentWebhook(eventId, payload, actorId = 'razorpay') {
  if (processedPaymentEvents.has(eventId)) {
    return { duplicate: true, eventId }
  }
  processedPaymentEvents.add(eventId)
  const payment = {
    id: nextId('payevt'),
    provider: 'razorpay',
    providerEventId: eventId,
    status: payload?.event || 'received',
    metadata: payload,
    createdAt: now(),
  }
  payments.push(payment)
  recordAudit('payment.webhook', actorId, 'payment', payment.id, { eventId })
  const notes = payload?.payload?.payment?.entity?.notes || payload?.notes || {}
  if (payload?.event === 'payment.captured' && notes.userId && notes.courseId) {
    addEnrollment({ userId: notes.userId, courseId: notes.courseId, batchId: notes.batchId || null, source: 'razorpay' }, actorId)
  }
  return { duplicate: false, payment }
}

export function getAdminAnalytics() {
  return {
    users: null,
    courses: courses.length,
    enrollments: enrollments.length,
    payments: payments.length,
    liveAttendanceEvents: liveClassAttendance.length,
    labAttempts: labAttempts.length,
    aiMessages: aiChatMessages.length,
    documentAccesses: documentAccessLogs.length,
    analyticsEvents: analyticsEvents.length,
  }
}

export function getStudentDashboard(userId) {
  const enrolledCourses = listEnrolledCourses(userId)
  return {
    enrolledCourses,
    liveClasses: listUpcomingLiveClassesForUser(userId),
    progress: enrolledCourses.map(course => getCourseProgress(userId, course.id)),
    labs: enrolledCourses.flatMap(course => listLabsByCourse(course.id)),
    certificates: listCertificates({ userId }),
    aiSessions: enrolledCourses.flatMap(course => listAiSessions(userId, course.id)),
  }
}

export function getInstructorDashboard(userId) {
  const assignedCourses = courses.filter(course => course.instructorId === userId)
  return {
    assignedCourses,
    students: assignedCourses.flatMap(course => listEnrollmentsByCourse(course.id)),
    attendance: assignedCourses.flatMap(course => listAttendance({ courseId: course.id })),
    quizResults: quizAttempts.filter(attempt => assignedCourses.some(course => course.id === attempt.courseId)),
    labAttempts: labAttempts.filter(attempt => assignedCourses.some(course => course.id === attempt.courseId)),
    progress: progress.filter(item => assignedCourses.some(course => course.id === item.courseId)),
  }
}

export function getOpsDashboard() {
  return {
    labs,
    labAttempts,
    liveClassAttendance,
    documentAccessLogs,
    systemHealth: {
      status: 'ok',
      store: 'in-memory-dev',
      generatedAt: now(),
    },
  }
}
