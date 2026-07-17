import { randomUUID, timingSafeEqual } from 'node:crypto'
import { rateLimit } from 'express-rate-limit'
import { getAllowedOrigins, normalizeOrigin } from '../lib/environment.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function safelyEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''))
  const rightBuffer = Buffer.from(String(right || ''))
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function limiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    handler: (_req, res) => res.status(429).json({ error: message }),
  })
}

export const apiLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT || 600),
  message: 'Too many requests. Please wait and try again.',
})

export const loginLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT || 10),
  message: 'Too many login attempts. Please wait before trying again.',
})

export const registrationLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.REGISTRATION_RATE_LIMIT || 5),
  message: 'Too many registration attempts. Please try again later.',
})

export const leadLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.LEAD_RATE_LIMIT || 8),
  message: 'Too many requests for course guidance. Please try again later.',
})

export const aiLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AI_RATE_LIMIT || 40),
  message: 'Too many AI tutor requests. Please wait before continuing.',
})

export function requestContext(req, res, next) {
  const provided = String(req.headers['x-request-id'] || '')
  req.requestId = /^[a-zA-Z0-9_-]{8,80}$/.test(provided) ? provided : randomUUID()
  res.setHeader('X-Request-Id', req.requestId)
  next()
}

function requestSecurityContext(req) {
  return {
    requestId: req.requestId,
    origin: normalizeOrigin(req.headers.origin) || 'none',
    protocol: req.protocol,
    forwardedProtocol: forwardedProtocol(req),
    secure: req.secure,
    sessionCookiePresent: Boolean(req.cookies?.cli_session),
    csrfCookiePresent: Boolean(req.cookies?.cli_csrf),
    csrfHeaderPresent: Boolean(req.headers['x-csrf-token']),
  }
}

function logCsrfRejection(req, reason) {
  if (process.env.NODE_ENV === 'test') return
  console.warn('csrf-rejected', { reason, ...requestSecurityContext(req), status: 403 })
}

export function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next()
  if (req.path.startsWith('/api/webhooks') || req.path.startsWith('/api/payments/webhooks')) return next()
  if (req.headers.authorization?.startsWith('Bearer ')) return next()

  const origin = req.headers.origin
  if (origin && !getAllowedOrigins().includes(normalizeOrigin(origin))) {
    logCsrfRejection(req, 'origin_not_allowed')
    return res.status(403).json({ error: 'Request origin is not allowed' })
  }

  const cookieToken = req.cookies?.cli_csrf
  const headerToken = req.headers['x-csrf-token']
  if (!cookieToken || !headerToken || !safelyEqual(cookieToken, headerToken)) {
    logCsrfRejection(req, !cookieToken ? 'cookie_missing' : !headerToken ? 'header_missing' : 'token_mismatch')
    return res.status(403).json({ error: 'CSRF validation failed' })
  }
  return next()
}

function forwardedProtocol(req) {
  const value = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase()
  return ['http', 'https'].includes(value) ? value : 'unset'
}

export function authSecurityDiagnostics(event) {
  return (req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
      res.once('finish', () => {
        console.info('auth-security', {
          event,
          ...requestSecurityContext(req),
          status: res.statusCode,
        })
      })
    }
    next()
  }
}
