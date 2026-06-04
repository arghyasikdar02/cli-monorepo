const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken() {
  return localStorage.getItem('cyberlab_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
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
}
