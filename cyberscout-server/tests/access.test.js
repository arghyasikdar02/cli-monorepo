import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./data/test.sqlite'
process.env.JWT_SECRET = 'test_secret_at_least_32_chars_1234567890'
process.env.CLIADM_ADMIN_TOKEN = 'test_admin_token'
process.env.BCRYPT_COST = '4'

const testDb = path.resolve('data/test.sqlite')

for (const file of [testDb, `${testDb}-wal`, `${testDb}-shm`]) {
  if (fs.existsSync(file)) fs.rmSync(file)
}

for (const command of ['src/db/migrate.js', 'src/db/seed.js']) {
  const result = spawnSync(process.execPath, [command], {
    cwd: process.cwd(),
    env: process.env,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
}

let server
let baseUrl
let database

async function request(pathname, options = {}) {
  const unsafeCookieRequest = options.token && String(options.token).startsWith('cli_session=') && !['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET')
  let csrfHeaders = {}
  if (unsafeCookieRequest) {
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    const csrfBody = await csrfResponse.json()
    const csrfCookie = cookieFrom(csrfResponse, 'cli_csrf')
    csrfHeaders = { Cookie: `${options.token}; ${csrfCookie}`, 'X-CSRF-Token': csrfBody.csrfToken }
  }
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? (String(options.token).startsWith('cli_session=') ? { Cookie: options.token } : { Authorization: `Bearer ${options.token}` }) : {}),
      ...csrfHeaders,
      ...(options.headers || {}),
    },
    ...options,
  })
  const body = await response.json().catch(() => ({}))
  return { response, body }
}

async function login(email, password = 'password123') {
  const { response, body } = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  assert.equal(response.status, 200, body.error)
  const sessionCookie = cookieFrom(response, 'cli_session')
  assert.ok(sessionCookie)
  return { ...body, token: sessionCookie }
}

function cookieFrom(response, name) {
  const values = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie') || '']
  for (const value of values) {
    const match = value.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`))
    if (match) return `${name}=${match[1]}`
  }
  return ''
}

describe('Cyber Lab IN database-backed LMS flow', () => {
  let studentToken
  let adminToken
  let marketingToken
  let instructorToken
  let opsToken
  let neelToken

  it('never creates predictable development identities in production mode', () => {
    const productionSeedDb = path.resolve('data/production-seed-test.sqlite')
    for (const file of [productionSeedDb, `${productionSeedDb}-wal`, `${productionSeedDb}-shm`]) {
      if (fs.existsSync(file)) fs.rmSync(file)
    }
    const script = `
      import { seedBaselineData } from './src/db/seed.js';
      import { db } from './src/db/index.js';
      await seedBaselineData({ force: true, log: false });
      console.log(JSON.stringify({
        users: db.prepare('SELECT count(*) AS count FROM users').get().count,
        courses: db.prepare('SELECT count(*) AS count FROM courses').get().count
      }));
      db.close();
    `
    const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DATABASE_URL: 'file:./data/production-seed-test.sqlite',
      },
      encoding: 'utf8',
    })
    assert.equal(result.status, 0, result.stderr || result.stdout)
    const summary = JSON.parse(result.stdout.trim().split('\n').at(-1))
    assert.equal(summary.users, 0)
    assert.equal(summary.courses, 2)
    for (const file of [productionSeedDb, `${productionSeedDb}-wal`, `${productionSeedDb}-shm`]) {
      if (fs.existsSync(file)) fs.rmSync(file)
    }
  })

  before(async () => {
    const { app } = await import('../src/index.js')
    database = (await import('../src/db/index.js')).db
    server = app.listen(0)
    await new Promise(resolve => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
    studentToken = (await login('student@cyberlabin.com')).token
    adminToken = (await login('admin@cyberlabin.com')).token
    marketingToken = (await login('marketing@cyberlabin.com')).token
    instructorToken = (await login('instructor@cyberlabin.com')).token
    opsToken = (await login('ops@cyberlabin.com')).token
    neelToken = (await login('neel0409@gmail.com')).token
  })

  after(async () => {
    if (server) await new Promise(resolve => server.close(resolve))
  })

  it('registers a real user, hashes the password, and returns a working session', async () => {
    const email = `learner-${Date.now()}@cyberlabin.com`
    const signup = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Real Learner', email, password: 'newPassword123' }),
    })
    assert.equal(signup.response.status, 200, signup.body.error)
    assert.equal(signup.body.user.email, email)
    assert.equal(signup.body.user.role, 'student')

    const me = await request('/api/auth/me', { token: cookieFrom(signup.response, 'cli_session') })
    assert.equal(me.response.status, 200)
    assert.equal(me.body.user.email, email)

    const duplicate = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Duplicate', email, password: 'newPassword123' }),
    })
    assert.equal(duplicate.response.status, 409)
  })

  it('uses an HTTP-only cookie session and enforces CSRF on cookie-authenticated writes', async () => {
    const loginResult = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@cyberlabin.com', password: 'password123' }),
    })
    const sessionCookie = cookieFrom(loginResult.response, 'cli_session')
    assert.ok(sessionCookie)
    assert.match(loginResult.response.headers.get('set-cookie') || '', /HttpOnly/i)

    const me = await request('/api/auth/me', { headers: { Cookie: sessionCookie } })
    assert.equal(me.response.status, 200)
    assert.equal(me.body.user.email, 'student@cyberlabin.com')

    const denied = await request('/api/auth/change-password', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({ currentPassword: 'password123', newPassword: 'a-long-test-passphrase' }),
    })
    assert.equal(denied.response.status, 403)
    assert.equal(denied.body.error, 'CSRF validation failed')

    const csrf = await request('/api/auth/csrf')
    const csrfCookie = cookieFrom(csrf.response, 'cli_csrf')
    assert.ok(csrfCookie)
    const logout = await request('/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: `${sessionCookie}; ${csrfCookie}`,
        'X-CSRF-Token': csrf.body.csrfToken,
      },
    })
    assert.equal(logout.response.status, 200)
    assert.equal(logout.body.ok, true)
  })

  it('sets production-oriented API security headers', async () => {
    const { response } = await request('/api/health')
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(response.headers.get('x-frame-options'), 'DENY')
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
    assert.match(response.headers.get('permissions-policy') || '', /camera=\(\)/)
    assert.ok(response.headers.get('x-request-id'))
  })

  it('lists real courses from the database', async () => {
    const [publicCourses, courseIndex, courseDetail] = await Promise.all([
      request('/api/courses/public', { token: studentToken }),
      request('/api/courses'),
      request('/api/courses/public/slug/cybersecurity/cyber-security-essentials'),
    ])
    assert.equal(publicCourses.response.status, 200)
    assert.deepEqual(publicCourses.body.courses.map(course => course.id), ['c001', 'c002'])
    assert.equal(courseIndex.response.status, 200)
    assert.deepEqual(courseIndex.body.courses.map(course => course.id), ['c001', 'c002'])
    assert.equal(courseDetail.response.status, 200)
    assert.equal(courseDetail.body.course.id, 'c002')
  })

  it('returns health and published blogs', async () => {
    const [health, blogs] = await Promise.all([
      request('/api/health'),
      request('/api/blogs'),
    ])
    assert.equal(health.response.status, 200)
    assert.equal(health.body.ok, true)
    assert.equal(blogs.response.status, 200)
    assert.ok(blogs.body.blogs.some(blog => blog.slug === 'what-is-cybersecurity'))
  })

  it('logs in seeded dashboard roles with role-aware redirects', async () => {
    const cases = [
      ['student@cyberlabin.com', '/dashboard'],
      ['admin@cyberlabin.com', '/admin/dashboard'],
      ['marketing@cyberlabin.com', '/marketing/dashboard'],
      ['instructor@cyberlabin.com', '/instructor/dashboard'],
      ['ops@cyberlabin.com', '/ops/dashboard'],
    ]
    for (const [email, redirectTo] of cases) {
      const result = await login(email)
      assert.equal(result.redirectTo, redirectTo)
      assert.ok(result.token)
      assert.equal(result.user.email, email)
    }
  })

  it('loads database-backed role dashboards without 500 errors', async () => {
    const [admin, marketing, instructor, ops] = await Promise.all([
      request('/api/dashboards/admin', { token: adminToken }),
      request('/api/dashboards/marketing', { token: marketingToken }),
      request('/api/dashboards/instructor', { token: instructorToken }),
      request('/api/dashboards/ops', { token: opsToken }),
    ])

    assert.equal(admin.response.status, 200, admin.body.error)
    assert.equal(typeof admin.body.dashboard.analytics.users, 'number')
    assert.equal(typeof admin.body.dashboard.analytics.enrollments, 'number')
    assert.ok(Array.isArray(admin.body.dashboard.users))
    assert.ok(Array.isArray(admin.body.dashboard.auditLogs))

    assert.equal(marketing.response.status, 200, marketing.body.error)
    assert.ok(Array.isArray(marketing.body.dashboard.leads))
    assert.equal(typeof marketing.body.dashboard.analytics.totalLeads, 'number')
    assert.equal(typeof marketing.body.dashboard.visitorAnalytics.totalUniqueVisitors, 'number')

    assert.equal(instructor.response.status, 200, instructor.body.error)
    assert.ok(Array.isArray(instructor.body.dashboard.assignedCourses))
    assert.ok(Array.isArray(instructor.body.dashboard.progress))

    assert.equal(ops.response.status, 200, ops.body.error)
    assert.equal(ops.body.dashboard.systemHealth.status, 'ok')
    assert.ok(Array.isArray(ops.body.dashboard.labs))
    assert.ok(Array.isArray(ops.body.dashboard.labAttempts))
    assert.ok(Array.isArray(ops.body.dashboard.liveClassAttendance))
    assert.ok(Array.isArray(ops.body.dashboard.documentAccessLogs))
  })

  it('tracks visitors and stores all lead capture sources', async () => {
    const visitor = await request('/api/visitors/track', {
      method: 'POST',
      body: JSON.stringify({ analytics: true, marketing: false }),
    })
    assert.equal(visitor.response.status, 201, visitor.body.error)
    assert.ok(visitor.body.visitorId)

    const sources = ['landing_form', 'chatbot', 'course_popup']
    for (const source of sources) {
      const lead = await request('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: `Lead ${source}`,
          phone: '+919999999999',
          email: `${source}-${Date.now()}@example.com`,
          message: `Interested through ${source}`,
          source,
          courseId: source === 'course_popup' ? 'c002' : undefined,
        }),
      })
      assert.equal(lead.response.status, 201, lead.body.error)
      assert.equal(lead.body.lead.source, source)
    }

    const marketingLeads = await request('/api/leads', { token: marketingToken })
    assert.equal(marketingLeads.response.status, 200)
    for (const source of sources) {
      assert.ok(marketingLeads.body.leads.some(lead => lead.source === source))
    }
  })

  it('does not return fake leaderboard users', async () => {
    const result = await request('/api/leaderboards/course/c001', { token: studentToken })
    assert.equal(result.response.status, 200)
    assert.ok(Array.isArray(result.body.leaderboard))
    assert.equal(result.body.leaderboard.length, 0)
  })

  it('denies private course materials before enrollment and unlocks them after enrollment', async () => {
    const email = `unenrolled-${Date.now()}@cyberlabin.com`
    const signup = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Unenrolled Learner', email, password: 'newPassword123' }),
    })
    const token = cookieFrom(signup.response, 'cli_session')

    const locked = await request('/api/courses/c002/materials', { token })
    assert.equal(locked.response.status, 403)
    assert.equal(locked.body.publicMaterials.length, 1)

    const enroll = await request('/api/courses/c002/enroll', { method: 'POST', token })
    assert.equal(enroll.response.status, 201, enroll.body.error)

    const unlocked = await request('/api/courses/c002/materials', { token })
    assert.equal(unlocked.response.status, 200, unlocked.body.error)
    assert.ok(unlocked.body.materials.some(material => material.isPublic === false))

    const dashboard = await request('/api/dashboards/student', { token })
    assert.equal(dashboard.response.status, 200)
    assert.deepEqual(dashboard.body.dashboard.enrolledCourses.map(course => course.id), ['c002'])
  })

  it('keeps Course A and Course B materials isolated', async () => {
    const denied = await request('/api/courses/c002/materials', { token: studentToken })
    assert.equal(denied.response.status, 403)

    const allowed = await request('/api/courses/c001/materials', { token: studentToken })
    assert.equal(allowed.response.status, 200)
    assert.ok(allowed.body.materials.every(material => material.courseId === 'c001'))
  })

  it('persists learning modules and denies cross-course access', async () => {
    const emptyLabs = await request('/api/labs/course/c001', { token: studentToken })
    assert.equal(emptyLabs.response.status, 200)
    assert.deepEqual(emptyLabs.body.labs, [])

    const lab = await request('/api/labs', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ courseId: 'c001', title: 'Controlled phishing review', description: 'Test evidence and report a finding.', points: 25, flag: 'TEST-FLAG', status: 'published' }),
    })
    assert.equal(lab.response.status, 201, lab.body.error)
    const labId = lab.body.lab.id

    const deniedLab = await request(`/api/labs/${labId}/launch`, { method: 'POST', token: neelToken, body: '{}' })
    assert.equal(deniedLab.response.status, 403)
    const launched = await request(`/api/labs/${labId}/launch`, { method: 'POST', token: studentToken, body: '{}' })
    assert.equal(launched.response.status, 200, launched.body.error)
    const passed = await request(`/api/labs/${labId}/submit-flag`, { method: 'POST', token: studentToken, body: JSON.stringify({ flag: 'TEST-FLAG' }) })
    assert.equal(passed.response.status, 200, passed.body.error)
    assert.equal(passed.body.attempt.status, 'passed')

    const document = await request('/api/documents', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ courseId: 'c001', title: 'Protected test workbook', storageKey: 'private/c001/test.pdf', pageCount: 4 }),
    })
    assert.equal(document.response.status, 201, document.body.error)
    const deniedDocument = await request(`/api/documents/${document.body.document.id}/view?page=1`, { token: neelToken })
    assert.equal(deniedDocument.response.status, 403)
    const protectedPage = await request(`/api/documents/${document.body.document.id}/view?page=1`, { token: studentToken })
    assert.equal(protectedPage.response.status, 200, protectedPage.body.error)
    assert.equal(protectedPage.body.document.courseId, 'c001')
    assert.equal(protectedPage.body.document.storageKey, undefined)

    const quiz = await request('/api/quizzes', { method: 'POST', token: adminToken, body: JSON.stringify({ courseId: 'c001', title: 'Foundation check', status: 'published' }) })
    const question = await request(`/api/quizzes/${quiz.body.quiz.id}/questions`, { method: 'POST', token: adminToken, body: JSON.stringify({ prompt: 'What should be verified first?', choices: ['Evidence', 'Assumption'], answer: 'Evidence' }) })
    assert.equal(question.response.status, 201, question.body.error)
    const listedQuiz = await request('/api/quizzes/course/c001', { token: studentToken })
    assert.equal(listedQuiz.response.status, 200)
    assert.equal(listedQuiz.body.quizzes[0].questions[0].answer, undefined)
    const quizDetail = await request(`/api/quizzes/${quiz.body.quiz.id}`, { token: studentToken })
    assert.equal(quizDetail.response.status, 200)
    assert.equal(quizDetail.body.quiz.questions[0].answer, undefined)
    const attempt = await request(`/api/quizzes/${quiz.body.quiz.id}/attempts`, { method: 'POST', token: studentToken, body: JSON.stringify({ answers: { [question.body.question.id]: 'Evidence' } }) })
    assert.equal(attempt.response.status, 200, attempt.body.error)
    assert.equal(attempt.body.attempt.score, 100)
    assert.equal(attempt.body.attempt.results[0].correct, true)

    const certificate = await request('/api/certificates', { method: 'POST', token: adminToken, body: JSON.stringify({ userId: (await login('student@cyberlabin.com')).user.id, courseId: 'c001' }) })
    assert.equal(certificate.response.status, 201, certificate.body.error)
    const myCertificates = await request('/api/certificates/me', { token: studentToken })
    assert.ok(myCertificates.body.certificates.some(item => item.id === certificate.body.certificate.id))
  })

  it('enforces live class time and batch membership', async () => {
    const early = await request('/api/live-classes/live_c001_01/validate', { token: studentToken })
    assert.equal(early.response.status, 200)
    assert.equal(early.body.allowed, false)
    assert.equal(early.body.reason, 'outside_join_window_early')

    database.prepare("INSERT INTO batches (id, course_id, name, status) VALUES ('batch_test_c001', 'c001', 'Test batch', 'active')").run()
    database.prepare("UPDATE enrollments SET batch_id = 'batch_test_c001' WHERE user_id = (SELECT id FROM users WHERE email = 'student@cyberlabin.com') AND course_id = 'c001'").run()
    const instructorId = database.prepare("SELECT id FROM users WHERE email = 'instructor@cyberlabin.com'").get().id
    const start = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const end = new Date(Date.now() + 55 * 60 * 1000).toISOString()
    const created = await request('/api/live-classes', { method: 'POST', token: adminToken, body: JSON.stringify({ courseId: 'c001', batchId: 'batch_test_c001', instructorId, title: 'Batch access test', scheduledStart: start, scheduledEnd: end, provider: 'external' }) })
    assert.equal(created.response.status, 201, created.body.error)
    const liveId = created.body.liveClass.id
    const wrongCourse = await request(`/api/live-classes/${liveId}/join`, { method: 'POST', token: neelToken, body: '{}' })
    assert.equal(wrongCourse.response.status, 403)
    const joined = await request(`/api/live-classes/${liveId}/join`, { method: 'POST', token: studentToken, body: '{}' })
    assert.equal(joined.response.status, 200, joined.body.error)
    assert.equal(joined.body.viewerCount, 1)
    const left = await request(`/api/live-classes/${liveId}/leave`, { method: 'POST', token: studentToken, body: '{}' })
    assert.equal(left.response.status, 200)
    assert.equal(left.body.viewerCount, 0)
  })

  it('denies student access to admin dashboard APIs', async () => {
    const result = await request('/api/dashboards/admin', { token: studentToken })
    assert.equal(result.response.status, 403)
  })

  it('limits instructors to assigned courses', async () => {
    const denied = await request('/api/labs/course/c001', { token: instructorToken })
    assert.equal(denied.response.status, 403)
    const assigned = await request('/api/labs/course/c002', { token: instructorToken })
    assert.equal(assigned.response.status, 200)
  })

  it('answers AI questions only from enrolled course materials', async () => {
    const result = await request('/api/ai/courses/c001/chat', {
      method: 'POST',
      token: studentToken,
      body: JSON.stringify({ message: 'How should I think about passwords and MFA?' }),
    })
    assert.equal(result.response.status, 200, result.body.error)
    assert.ok(result.body.citations.length > 0)
    assert.ok(result.body.citations.every(citation => citation.courseId === 'c001'))

    const denied = await request('/api/ai/courses/c002/chat', {
      method: 'POST',
      token: studentToken,
      body: JSON.stringify({ message: 'Summarize this course' }),
    })
    assert.equal(denied.response.status, 403)
  })

  it('protects CLI mutations with admin token, dry-run, confirmation, and audit-safe behavior', () => {
    const cli = (...cliArgs) => spawnSync(process.execPath, ['src/cli/cliadm.js', ...cliArgs], {
      cwd: process.cwd(),
      env: process.env,
      encoding: 'utf8',
    })

    const health = cli('system', 'health', '--json')
    assert.equal(health.status, 0, health.stderr)
    assert.equal(JSON.parse(health.stdout).ok, true)

    const dryRunEmail = `cli-dry-run-${Date.now()}@example.com`
    const dryRun = cli('user', 'create', '--email', dryRunEmail, '--name', 'Dry Run User', '--password', 'a-long-cli-passphrase', '--role', 'student', '--admin-token', 'test_admin_token', '--dry-run', '--json')
    assert.equal(dryRun.status, 0, dryRun.stderr)
    assert.equal(JSON.parse(dryRun.stdout).dryRun, true)
    assert.equal(database.prepare('SELECT count(*) AS count FROM users WHERE email = ?').get(dryRunEmail).count, 0)

    const studentId = database.prepare("SELECT id FROM users WHERE email = 'student@cyberlabin.com'").get().id
    const blockedSuspend = cli('user', 'suspend', '--user-id', studentId, '--admin-token', 'test_admin_token')
    assert.notEqual(blockedSuspend.status, 0)
    assert.match(blockedSuspend.stderr, /confirm YES/)
    assert.equal(database.prepare('SELECT status FROM users WHERE id = ?').get(studentId).status, 'active')
  })
})
