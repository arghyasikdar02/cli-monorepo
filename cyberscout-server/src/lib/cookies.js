function envBoolean(value, fallback) {
  if (value === undefined) return fallback
  return String(value).toLowerCase() === 'true'
}

function baseCookieOptions({ httpOnly = true, maxAge } = {}) {
  const isProduction = process.env.NODE_ENV === 'production'
  const secure = envBoolean(process.env.COOKIE_SECURE, isProduction)
  const requestedSameSite = String(process.env.COOKIE_SAME_SITE || 'lax').toLowerCase()
  const sameSite = ['lax', 'strict', 'none'].includes(requestedSameSite) ? requestedSameSite : 'lax'

  return {
    httpOnly,
    secure: sameSite === 'none' ? true : secure,
    sameSite,
    path: '/',
    ...(maxAge ? { maxAge } : {}),
  }
}

export function authCookieOptions() {
  return baseCookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000 })
}

export function csrfCookieOptions() {
  return baseCookieOptions({ maxAge: 2 * 60 * 60 * 1000 })
}

export function oauthStateCookieOptions() {
  return baseCookieOptions({ maxAge: 10 * 60 * 1000 })
}

export function visitorCookieOptions() {
  return baseCookieOptions({ maxAge: 365 * 24 * 60 * 60 * 1000 })
}

export function clearCookieOptions(options) {
  const { maxAge: _maxAge, ...rest } = options
  return rest
}
