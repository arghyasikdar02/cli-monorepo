import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL ||= process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:55432/cyberlabin_test'
process.env.DATABASE_SSL ||= 'disable'
process.env.JWT_SECRET = 'test_secret_at_least_32_chars_1234567890'
process.env.CLIADM_ADMIN_TOKEN = 'test_admin_token'
process.env.BCRYPT_COST = '4'
process.env.SEED_DEVELOPMENT_USERS = '1'
process.env.CORS_ORIGINS = 'https://cyberlabin.com'
process.env.FRONTEND_URL = 'https://cyberlabin.com'
process.env.BACKEND_URL = 'https://cyberlabin.onrender.com'
process.env.GOOGLE_CLIENT_ID = '854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com'
process.env.GOOGLE_CLIENT_SECRET = 'test_google_client_secret_123456'
process.env.GOOGLE_REDIRECT_URI = 'https://cyberlabin.com/api/auth/google/callback'
process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = 'test_google_token_key_at_least_32_chars_1234567890'

let server
let baseUrl
let database

async function request(pathname, options = {}) {
  const {
    token,
    skipCsrf = false,
    headers: suppliedHeaders = {},
    ...fetchOptions
  } = options
  const method = String(fetchOptions.method || 'GET').toUpperCase()
  const cookieToken = token && String(token).startsWith('cli_session=') ? String(token) : ''
  const bearerToken = token && !cookieToken ? String(token) : ''
  const unsafeBrowserRequest = !skipCsrf
    && !['GET', 'HEAD', 'OPTIONS'].includes(method)
    && !bearerToken
    && !pathname.startsWith('/api/webhooks')
    && !pathname.startsWith('/api/payments/webhooks')
  let csrfHeaders = {}
  if (unsafeBrowserRequest) {
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
      headers: suppliedHeaders.Origin ? { Origin: suppliedHeaders.Origin } : {},
    })
    const csrfBody = await csrfResponse.json()
    const csrfCookie = cookieFrom(csrfResponse, 'cli_csrf')
    const existingCookie = suppliedHeaders.Cookie || cookieToken
    csrfHeaders = {
      Cookie: [existingCookie, csrfCookie].filter(Boolean).join('; '),
      'X-CSRF-Token': csrfBody.csrfToken,
    }
  }
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieToken ? { Cookie: cookieToken } : {}),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...csrfHeaders,
      ...suppliedHeaders,
    },
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

  before(async () => {
    const { resetTestDatabase } = await import('../src/db/reset-test.js')
    const { runPendingMigrations } = await import('../src/db/migrate.js')
    const { seedBaselineData } = await import('../src/db/seed.js')
    await resetTestDatabase()
    await runPendingMigrations()
    await seedBaselineData({ includeTestUsers: true, log: false })
    const { app } = await import('../src/index.js')
    database = await import('../src/db/index.js')
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
    if (database) await database.closeDatabase()
  })

  it('does not add development identities when production seeding is requested', async () => {
    const before = await database.queryOne('SELECT count(*)::integer AS count FROM users')
    const { seedBaselineData } = await import('../src/db/seed.js')
    await seedBaselineData({ force: true, includeTestUsers: false, log: false })
    const afterSeed = await database.queryOne('SELECT count(*)::integer AS count FROM users')
    assert.equal(afterSeed.count, before.count)
  })

  it('has applied the Google OAuth and Meet migration', async () => {
    const migration = await database.queryOne('SELECT name FROM schema_migrations WHERE name = $1', ['010_google_oauth_meet.sql'])
    assert.equal(migration.name, '010_google_oauth_meet.sql')
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
    const missingBootstrap = await request('/api/auth/login', {
      method: 'POST',
      skipCsrf: true,
      body: JSON.stringify({ email: 'student@cyberlabin.com', password: 'password123' }),
    })
    assert.equal(missingBootstrap.response.status, 403)
    assert.equal(missingBootstrap.body.error, 'CSRF validation failed')

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
      skipCsrf: true,
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

  it('supports production CORS, secure cookies, trusted proxy requests, and stateless sessions', async () => {
    const allowed = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://cyberlabin.com' } })
    assert.equal(allowed.status, 200)
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://cyberlabin.com')
    assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true')
    assert.match(allowed.headers.get('vary') || '', /Origin/i)

    const preflight = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://cyberlabin.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-csrf-token',
      },
    })
    assert.equal(preflight.status, 204)
    assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://cyberlabin.com')
    assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true')
    assert.match(preflight.headers.get('access-control-allow-headers') || '', /X-CSRF-Token/i)

    const blocked = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://untrusted.example' } })
    assert.equal(blocked.status, 403)

    const previousSecure = process.env.COOKIE_SECURE
    const previousSameSite = process.env.COOKIE_SAME_SITE
    process.env.COOKIE_SECURE = 'true'
    process.env.COOKIE_SAME_SITE = 'lax'
    try {
      const csrf = await fetch(`${baseUrl}/api/auth/csrf`, {
        headers: { Origin: 'https://cyberlabin.com', 'X-Forwarded-Proto': 'https' },
      })
      assert.equal(csrf.status, 200)
      const csrfBody = await csrf.json()
      const csrfSetCookie = csrf.headers.get('set-cookie') || ''
      assert.match(csrfSetCookie, /cli_csrf=/)
      assert.match(csrfSetCookie, /HttpOnly/i)
      assert.match(csrfSetCookie, /Secure/i)
      assert.match(csrfSetCookie, /SameSite=Lax/i)
      assert.match(csrfSetCookie, /Path=\//i)
      assert.doesNotMatch(csrfSetCookie, /Domain=/i)

      const csrfCookie = cookieFrom(csrf, 'cli_csrf')
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          Origin: 'https://cyberlabin.com',
          'X-Forwarded-Proto': 'https',
          'Content-Type': 'application/json',
          Cookie: csrfCookie,
          'X-CSRF-Token': csrfBody.csrfToken,
        },
        body: JSON.stringify({ email: 'student@cyberlabin.com', password: 'password123' }),
      })
      assert.equal(loginResponse.status, 200)
      const productionSession = cookieFrom(loginResponse, 'cli_session')
      const authSetCookie = loginResponse.headers.get('set-cookie') || ''
      assert.ok(productionSession)
      assert.match(authSetCookie, /HttpOnly/i)
      assert.match(authSetCookie, /Secure/i)
      assert.match(authSetCookie, /SameSite=Lax/i)
      assert.doesNotMatch(authSetCookie, /Domain=/i)

      const { app } = await import('../src/index.js')
      const secondServer = app.listen(0)
      await new Promise(resolve => secondServer.once('listening', resolve))
      try {
        const secondBaseUrl = `http://127.0.0.1:${secondServer.address().port}`
        const me = await fetch(`${secondBaseUrl}/api/auth/me`, {
          headers: { Cookie: productionSession, 'X-Forwarded-Proto': 'https' },
        })
        assert.equal(me.status, 200)
        assert.equal((await me.json()).user.email, 'student@cyberlabin.com')
      } finally {
        secondServer.closeAllConnections?.()
        await new Promise(resolve => secondServer.close(resolve))
      }

      const logoutCsrf = await fetch(`${baseUrl}/api/auth/csrf`)
      const logoutCsrfBody = await logoutCsrf.json()
      const logout = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${productionSession}; ${cookieFrom(logoutCsrf, 'cli_csrf')}`,
          'X-CSRF-Token': logoutCsrfBody.csrfToken,
        },
      })
      assert.equal(logout.status, 200)
      const clearCookie = logout.headers.get('set-cookie') || ''
      assert.match(clearCookie, /cli_session=/)
      assert.match(clearCookie, /Max-Age=0|Expires=/i)
      assert.match(clearCookie, /Secure/i)
      assert.match(clearCookie, /SameSite=Lax/i)
      assert.match(clearCookie, /Path=\//i)
      assert.doesNotMatch(clearCookie, /Domain=/i)
    } finally {
      if (previousSecure === undefined) delete process.env.COOKIE_SECURE
      else process.env.COOKIE_SECURE = previousSecure
      if (previousSameSite === undefined) delete process.env.COOKIE_SAME_SITE
      else process.env.COOKIE_SAME_SITE = previousSameSite
    }
  })

  it('uses first-party state and PKCE cookies for the Google callback and rejects unsafe redirects', async () => {
    const previousSecure = process.env.COOKIE_SECURE
    const previousSameSite = process.env.COOKIE_SAME_SITE
    process.env.COOKIE_SECURE = 'true'
    process.env.COOKIE_SAME_SITE = 'lax'
    try {
      const initiation = await fetch(`${baseUrl}/api/auth/google?redirect=${encodeURIComponent('//untrusted.example/path')}`, {
        redirect: 'manual',
        headers: {
          Origin: 'https://cyberlabin.com',
          'X-Forwarded-Proto': 'https',
        },
      })
      assert.equal(initiation.status, 302)
      const googleLocation = new URL(initiation.headers.get('location'))
      assert.equal(googleLocation.origin, 'https://accounts.google.com')
      assert.equal(googleLocation.searchParams.get('redirect_uri'), 'https://cyberlabin.com/api/auth/google/callback')

      const state = googleLocation.searchParams.get('state')
      const stateCookie = cookieFrom(initiation, 'cli_oauth_state')
      const pkceCookie = cookieFrom(initiation, 'cli_oauth_pkce')
      assert.ok(state)
      assert.ok(stateCookie)
      assert.ok(pkceCookie)
      const setCookies = initiation.headers.get('set-cookie') || ''
      assert.match(setCookies, /HttpOnly/i)
      assert.match(setCookies, /Secure/i)
      assert.match(setCookies, /SameSite=Lax/i)
      assert.doesNotMatch(setCookies, /Domain=/i)

      const { verifyOAuthState } = await import('../src/lib/jwt.js')
      const decodedState = verifyOAuthState(state)
      assert.equal(decodedState.redirect, '')
      assert.equal(decodedState.verifier, undefined)

      const rejected = await fetch(`${baseUrl}/api/auth/google/callback?code=unused&state=invalid`, {
        redirect: 'manual',
        headers: {
          Cookie: `${stateCookie}; ${pkceCookie}`,
          'X-Forwarded-Proto': 'https',
        },
      })
      assert.equal(rejected.status, 302)
      assert.equal(rejected.headers.get('location'), 'https://cyberlabin.com/login?error=oauth_state')
    } finally {
      if (previousSecure === undefined) delete process.env.COOKIE_SECURE
      else process.env.COOKIE_SECURE = previousSecure
      if (previousSameSite === undefined) delete process.env.COOKIE_SAME_SITE
      else process.env.COOKIE_SAME_SITE = previousSameSite
    }
  })

  it('completes Google login through the cyberlabin.com callback using the PKCE cookie', async () => {
    const nativeFetch = globalThis.fetch
    const initiation = await nativeFetch(`${baseUrl}/api/auth/google?redirect=${encodeURIComponent('/courses')}`, { redirect: 'manual' })
    const googleLocation = new URL(initiation.headers.get('location'))
    const state = googleLocation.searchParams.get('state')
    const oauthCookies = `${cookieFrom(initiation, 'cli_oauth_state')}; ${cookieFrom(initiation, 'cli_oauth_pkce')}`
    let receivedVerifier = ''

    globalThis.fetch = async (input, options = {}) => {
      const url = String(input)
      if (url === 'https://oauth2.googleapis.com/token') {
        receivedVerifier = String(options.body?.get('code_verifier') || '')
        return new Response(JSON.stringify({
          access_token: 'test-access-token',
          expires_in: 3600,
          scope: 'openid email profile',
          token_type: 'Bearer',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (url === 'https://openidconnect.googleapis.com/v1/userinfo') {
        return new Response(JSON.stringify({
          sub: `google-test-${Date.now()}`,
          email: `google-test-${Date.now()}@example.com`,
          email_verified: true,
          name: 'Google Test Learner',
        }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return nativeFetch(input, options)
    }

    try {
      const callback = await nativeFetch(`${baseUrl}/api/auth/google/callback?code=test-code&state=${encodeURIComponent(state)}`, {
        redirect: 'manual',
        headers: { Cookie: oauthCookies, 'X-Forwarded-Proto': 'https' },
      })
      assert.equal(callback.status, 302)
      assert.equal(callback.headers.get('location'), 'https://cyberlabin.com/oauth/callback?redirect=%2Fcourses')
      assert.ok(receivedVerifier.length >= 43)
      const sessionCookie = cookieFrom(callback, 'cli_session')
      assert.ok(sessionCookie)
      const me = await nativeFetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: sessionCookie } })
      assert.equal(me.status, 200)
      assert.equal((await me.json()).user.name, 'Google Test Learner')
    } finally {
      globalThis.fetch = nativeFetch
    }
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
    const [root, health, rootHealth, blogs] = await Promise.all([
      request('/'),
      request('/api/health'),
      request('/health'),
      request('/api/blogs'),
    ])
    assert.equal(root.response.status, 200)
    assert.equal(root.body.health, '/health')
    assert.equal(health.response.status, 200)
    assert.equal(health.body.ok, true)
    assert.equal(health.body.database, 'connected')
    assert.equal(rootHealth.response.status, 200)
    assert.equal(rootHealth.body.service, 'cyberlabin-api')
    assert.equal(blogs.response.status, 200)
    assert.ok(blogs.body.blogs.some(blog => blog.slug === 'what-is-cybersecurity'))
  })

  it('returns safe public Google authentication configuration', async () => {
    const { response, body } = await request('/api/auth/config')
    assert.equal(response.status, 200)
    assert.deepEqual(body, {
      googleCallbackUrl: 'https://cyberlabin.com/api/auth/google/callback',
      googleEnabled: true,
    })
    assert.equal(JSON.stringify(body).includes(process.env.GOOGLE_CLIENT_SECRET), false)
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

    await database.execute("INSERT INTO batches (id, course_id, name, status) VALUES ('batch_test_c001', 'c001', 'Test batch', 'active')")
    await database.execute("UPDATE enrollments SET batch_id = 'batch_test_c001' WHERE user_id = (SELECT id FROM users WHERE email = 'student@cyberlabin.com') AND course_id = 'c001'")
    const instructorId = (await database.queryOne("SELECT id FROM users WHERE email = 'instructor@cyberlabin.com'")).id
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

  it('protects CLI mutations with admin token, dry-run, confirmation, and audit-safe behavior', async () => {
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
    assert.equal((await database.queryOne('SELECT count(*)::integer AS count FROM users WHERE email = $1', [dryRunEmail])).count, 0)

    const studentId = (await database.queryOne("SELECT id FROM users WHERE email = 'student@cyberlabin.com'")).id
    const blockedSuspend = cli('user', 'suspend', '--user-id', studentId, '--admin-token', 'test_admin_token')
    assert.notEqual(blockedSuspend.status, 0)
    assert.match(blockedSuspend.stderr, /confirm YES/)
    assert.equal((await database.queryOne('SELECT status FROM users WHERE id = $1', [studentId])).status, 'active')
  })
})
