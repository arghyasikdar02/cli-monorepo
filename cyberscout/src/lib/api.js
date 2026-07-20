function resolveApiBase() {
  const configured = String(import.meta.env.VITE_API_URL || '').trim()
  if (import.meta.env.PROD) return ''
  return (configured || 'http://localhost:3001').replace(/\/+$/, '')
}

export const API_BASE = resolveApiBase()
let csrfToken = ''
let csrfTokenPromise = null

function isUnsafeMethod(method) {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method)
}

async function loadCsrfToken() {
  if (csrfToken) return csrfToken
  if (csrfTokenPromise) return csrfTokenPromise

  csrfTokenPromise = (async () => {
    const res = await fetch(`${API_BASE}/api/auth/csrf`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      const error = new Error('Could not establish a secure request session')
      error.status = res.status
      throw error
    }
    const body = await res.json().catch(() => ({}))
    if (!/^[a-f0-9]{64}$/i.test(String(body.csrfToken || ''))) {
      throw new Error('Could not establish a secure request session')
    }
    csrfToken = body.csrfToken
    return csrfToken
  })()

  try {
    return await csrfTokenPromise
  } finally {
    csrfTokenPromise = null
  }
}

async function request(path, options = {}, allowCsrfRetry = true) {
  const method = String(options.method || 'GET').toUpperCase()
  if (isUnsafeMethod(method) && !csrfToken) await loadCsrfToken()
  const hasBody = options.body !== undefined && options.body !== null
  const { headers: optionHeaders, ...fetchOptions } = options
  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(isUnsafeMethod(method) && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...optionHeaders,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    if (res.status === 403 && err.error === 'CSRF validation failed' && allowCsrfRetry) {
      csrfToken = ''
      await loadCsrfToken()
      return request(path, options, false)
    }
    const error = new Error(err.error || 'Request failed')
    error.status = res.status
    error.requestId = err.requestId
    throw error
  }
  return res.json()
}

export const api = {
  authConfig: () => request('/api/auth/config'),
  register: (name, email, password, username) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, username }) }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  dashboard: (kind) => request(`/api/dashboards/${kind}`),
  publicCourses: () => request('/api/courses/public'),
  publicCourse: (courseId) => request(`/api/courses/public/${courseId}`),
  publicCourseBySlug: (categorySlug, courseSlug) => request(`/api/courses/public/slug/${categorySlug}/${courseSlug}`),
  course: (courseId) => request(`/api/courses/${courseId}`),
  enrollCourse: (courseId) => request(`/api/courses/${courseId}/enroll`, { method: 'POST' }),
  myCourses: () => request('/api/courses/my'),
  courseMaterials: (courseId) => request(`/api/courses/${courseId}/materials`),
  leadCapture: (lead) => request('/api/leads', { method: 'POST', body: JSON.stringify(lead) }),
  leads: (query = {}) => {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ''))
    return request(`/api/leads${params.toString() ? `?${params}` : ''}`)
  },
  updateLead: (leadId, updates) => request(`/api/leads/${leadId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  blogs: () => request('/api/blogs'),
  blog: (slug) => request(`/api/blogs/${slug}`),
  trackVisitor: (consent = {}) => request('/api/visitors/track', { method: 'POST', body: JSON.stringify(consent) }),
  saveCookieConsent: (consent) => request('/api/visitors/consent', { method: 'POST', body: JSON.stringify(consent) }),
  visitorStats: () => request('/api/visitors/stats'),
  trackEvent: (event, properties = {}) => request('/api/analytics/events', { method: 'POST', body: JSON.stringify({ event, path: window.location.pathname, properties }) }),
  googleStatus: () => request('/api/integrations/google/status'),
  disconnectGoogle: () => request('/api/integrations/google/disconnect', { method: 'POST' }),
  createGoogleMeet: (liveClassId) => request(`/api/live-classes/${liveClassId}/google-meet`, { method: 'POST' }),
  checkInLiveClass: (liveClassId) => request(`/api/live-classes/${liveClassId}/check-in`, { method: 'POST' }),
}
