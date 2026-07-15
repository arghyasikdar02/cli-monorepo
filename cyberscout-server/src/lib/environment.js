const PLACEHOLDER_PATTERN = /change[_-]?me|replace(?:[_-]|\s+)(?:me|with)|your[_-]|placeholder|dummy|password123|test[_-]?secret/i
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

function isPlaceholder(value) {
  return !value || PLACEHOLDER_PATTERN.test(String(value))
}

function normalizeUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return ''
    return url.origin
  } catch {
    return ''
  }
}

export function normalizeOrigin(value) {
  return normalizeUrl(value)
}

export function getAllowedOrigins(env = process.env) {
  const isProduction = env.NODE_ENV === 'production'
  const configured = String(env.CORS_ORIGINS || env.FRONTEND_URL || (isProduction ? '' : 'http://localhost:5173'))
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
  const local = isProduction
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173']
  return [...new Set([...configured, ...local])]
}

function validateSecret(env, name, minimumLength, errors, { required = true } = {}) {
  const value = String(env[name] || '')
  if (!value && !required) return
  if (isPlaceholder(value) || value.length < minimumLength) {
    errors.push(`${name}: set a non-placeholder random value of at least ${minimumLength} characters`)
  }
}

function validateHttpsOrigin(env, name, errors) {
  const raw = String(env[name] || '').trim()
  if (!raw) {
    errors.push(`${name}: required in production; set an absolute HTTPS origin`)
    return ''
  }
  let url
  try {
    url = new URL(raw)
  } catch {
    errors.push(`${name}: must be an absolute HTTPS URL such as https://service.example.com`)
    return ''
  }
  if (url.protocol !== 'https:' || url.username || url.password || LOCAL_HOSTS.has(url.hostname)) {
    errors.push(`${name}: must be a public absolute HTTPS URL without credentials`)
    return ''
  }
  if ((url.pathname && url.pathname !== '/') || url.search || url.hash) {
    errors.push(`${name}: must contain only the HTTPS origin, without a path, query or fragment`)
    return ''
  }
  return url.origin
}

function validateHttpsUrl(env, name, errors) {
  const raw = String(env[name] || '').trim()
  if (!raw) {
    errors.push(`${name}: required when Google OAuth is enabled`)
    return ''
  }
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.username || url.password || LOCAL_HOSTS.has(url.hostname)) {
      errors.push(`${name}: must be a public absolute HTTPS URL without credentials`)
      return ''
    }
    return url.toString()
  } catch {
    errors.push(`${name}: must be an absolute HTTPS URL`)
    return ''
  }
}

function validateDatabaseUrl(env, errors, { required = true } = {}) {
  const raw = String(env.DATABASE_URL || '').trim()
  if (!raw) {
    if (required) errors.push('DATABASE_URL: required; set the Supabase PostgreSQL connection string')
    return ''
  }
  try {
    const url = new URL(raw)
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
      errors.push('DATABASE_URL: must use the postgresql:// or postgres:// protocol')
      return ''
    }
    if (!url.hostname || !url.username || !url.pathname || url.pathname === '/') {
      errors.push('DATABASE_URL: must include a PostgreSQL host, user and database name')
      return ''
    }
    if (isPlaceholder(url.password)) {
      errors.push('DATABASE_URL: replace the placeholder database password')
      return ''
    }
    return raw
  } catch {
    errors.push('DATABASE_URL: must be a valid Supabase PostgreSQL URL')
    return ''
  }
}

export function validateEnvironment(env = process.env) {
  const isProduction = env.NODE_ENV === 'production'
  const developmentFrontend = normalizeOrigin(env.FRONTEND_URL) || 'http://localhost:5173'
  const developmentBackend = normalizeOrigin(env.BACKEND_URL) || `http://localhost:${env.PORT || 3001}`

  if (!isProduction) {
    const errors = []
    const databaseUrl = validateDatabaseUrl(env, errors, { required: true })
    if (errors.length) throw new Error(`Invalid database environment:\n- ${errors.join('\n- ')}`)
    return {
      frontendUrl: developmentFrontend,
      backendUrl: developmentBackend,
      allowedOrigins: getAllowedOrigins(env),
      databaseUrl,
    }
  }

  const errors = []
  validateSecret(env, 'JWT_SECRET', 32, errors)
  validateSecret(env, 'VISITOR_HASH_SALT', 24, errors)
  validateSecret(env, 'LAB_FLAG_SALT', 24, errors)
  validateSecret(env, 'CLIADM_ADMIN_TOKEN', 32, errors)

  const frontendUrl = validateHttpsOrigin(env, 'FRONTEND_URL', errors)
  const backendUrl = validateHttpsOrigin(env, 'BACKEND_URL', errors)
  const allowedOrigins = getAllowedOrigins(env)
  const rawCorsOrigins = String(env.CORS_ORIGINS || env.FRONTEND_URL || '').split(',').map(value => value.trim()).filter(Boolean)
  if (!rawCorsOrigins.length) {
    errors.push('CORS_ORIGINS: set at least the production FRONTEND_URL origin')
  } else {
    rawCorsOrigins.forEach((origin, index) => {
      const normalized = normalizeOrigin(origin)
      let parsed
      try {
        parsed = new URL(origin)
      } catch {
        parsed = null
      }
      if (
        !parsed ||
        !normalized ||
        parsed.protocol !== 'https:' ||
        parsed.username ||
        parsed.password ||
        LOCAL_HOSTS.has(parsed.hostname) ||
        (parsed.pathname && parsed.pathname !== '/') ||
        parsed.search ||
        parsed.hash
      ) {
        errors.push(`CORS_ORIGINS: entry ${index + 1} must be a public HTTPS origin`)
      }
    })
  }
  if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
    errors.push('CORS_ORIGINS: must include the normalized FRONTEND_URL origin')
  }

  const databaseUrl = validateDatabaseUrl(env, errors)
  if (['0', 'false', 'disable', 'off'].includes(String(env.DATABASE_SSL || '').trim().toLowerCase())) {
    errors.push('DATABASE_SSL: cannot be disabled in production')
  }

  if (String(env.COOKIE_SECURE || 'true').toLowerCase() !== 'true') {
    errors.push('COOKIE_SECURE: must be true in production')
  }
  const sameSite = String(env.COOKIE_SAME_SITE || 'lax').toLowerCase()
  if (!['lax', 'strict', 'none'].includes(sameSite)) {
    errors.push('COOKIE_SAME_SITE: must be lax, strict or none')
  }
  const bcryptCost = Number(env.BCRYPT_COST || 12)
  if (!Number.isInteger(bcryptCost) || bcryptCost < 10 || bcryptCost > 15) {
    errors.push('BCRYPT_COST: must be an integer from 10 through 15 in production')
  }

  const hasGoogleClient = Boolean(env.GOOGLE_CLIENT_ID)
  const hasGoogleSecret = Boolean(env.GOOGLE_CLIENT_SECRET)
  if (hasGoogleClient !== hasGoogleSecret) {
    errors.push('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET: configure both values together or leave both unset')
  } else if (hasGoogleClient) {
    if (isPlaceholder(env.GOOGLE_CLIENT_ID)) errors.push('GOOGLE_CLIENT_ID: replace the placeholder with the Google OAuth client ID')
    validateSecret(env, 'GOOGLE_CLIENT_SECRET', 16, errors)
    validateHttpsUrl(env, 'GOOGLE_CALLBACK_URL', errors)
  }

  const razorpayNames = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET']
  const razorpayValues = razorpayNames.map(name => env[name])
  if (razorpayValues.some(Boolean) && !razorpayValues.every(Boolean)) {
    errors.push('RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET: configure all three values together or leave all unset')
  } else if (razorpayValues.every(Boolean)) {
    validateSecret(env, 'RAZORPAY_KEY_ID', 8, errors)
    validateSecret(env, 'RAZORPAY_KEY_SECRET', 16, errors)
    validateSecret(env, 'RAZORPAY_WEBHOOK_SECRET', 24, errors)
  }

  if (errors.length) {
    throw new Error(`Invalid production environment:\n- ${errors.join('\n- ')}`)
  }

  return { frontendUrl, backendUrl, allowedOrigins, databaseUrl }
}
