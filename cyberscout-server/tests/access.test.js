import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./data/test.sqlite'
process.env.JWT_SECRET = 'test_secret_at_least_32_chars'
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

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
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
  return body
}

describe('Cyber Lab IN database-backed LMS flow', () => {
  let studentToken

  before(async () => {
    const { app } = await import('../src/index.js')
    server = app.listen(0)
    await new Promise(resolve => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
    studentToken = (await login('student@cyberlabin.com')).token
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

    const me = await request('/api/auth/me', { token: signup.body.token })
    assert.equal(me.response.status, 200)
    assert.equal(me.body.user.email, email)

    const duplicate = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Duplicate', email, password: 'newPassword123' }),
    })
    assert.equal(duplicate.response.status, 409)
  })

  it('lists real courses from the database', async () => {
    const result = await request('/api/courses/public', { token: studentToken })
    assert.equal(result.response.status, 200)
    assert.deepEqual(result.body.courses.map(course => course.id), ['c001', 'c002'])
  })

  it('denies private course materials before enrollment and unlocks them after enrollment', async () => {
    const email = `unenrolled-${Date.now()}@cyberlabin.com`
    const signup = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Unenrolled Learner', email, password: 'newPassword123' }),
    })
    const token = signup.body.token

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

  it('denies student access to admin dashboard APIs', async () => {
    const result = await request('/api/dashboards/admin', { token: studentToken })
    assert.equal(result.response.status, 403)
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
})
