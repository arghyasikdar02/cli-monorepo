import { Router } from 'express'
import bcrypt from 'bcrypt'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  findUserByUsername,
  publicUser,
  recordAudit,
  updateUser,
  updateUserPassword,
} from '../db/repositories.js'
import { signOAuthState, signToken, verifyOAuthState } from '../lib/jwt.js'
import { requireAuth } from '../middleware/access.js'
import { authCookieOptions, clearCookieOptions, csrfCookieOptions, oauthStateCookieOptions } from '../lib/cookies.js'
import { validatePassword } from '../lib/validation.js'
import { loginLimiter, registrationLimiter } from '../middleware/security.js'

const router = Router()
const trimTrailingSlash = (value) => value?.replace(/\/+$/, '')
const FRONTEND_URL = trimTrailingSlash(process.env.FRONTEND_URL) || 'http://localhost:5173'
const BACKEND_URL = trimTrailingSlash(process.env.BACKEND_URL) || `http://localhost:${process.env.PORT || 3001}`
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}/api/auth/google/callback`
function hasGoogleOAuthCredentials() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env
  const clientId = GOOGLE_CLIENT_ID?.trim()
  const clientSecret = GOOGLE_CLIENT_SECRET?.trim()
  return Boolean(
    clientId &&
    clientSecret &&
    clientId !== 'dummy' &&
    clientSecret !== 'dummy' &&
    !clientId.startsWith('your_') &&
    !clientSecret.startsWith('your_')
  )
}

function dashboardPathForUser(user) {
  const roles = user.roles || [user.role]
  if (roles.includes('super_admin') || roles.includes('admin')) return '/admin/dashboard'
  if (roles.includes('instructor')) return '/instructor/dashboard'
  if (roles.includes('marketing') || roles.includes('sales')) return '/marketing/dashboard'
  if (roles.includes('ops') || roles.includes('lab_creator') || roles.includes('support') || roles.includes('finance')) return '/ops/dashboard'
  return '/dashboard'
}

function safeRelativeRedirect(value) {
  if (!value || typeof value !== 'string') return ''
  if (!value.startsWith('/') || value.startsWith('//')) return ''
  return value
}

function signUserToken(user) {
  return signToken({
    sub: user.id,
    email: user.email,
    role: user.role || 'student',
    roles: user.roles || [user.role || 'student'],
    tokenVersion: user.tokenVersion || 0,
  })
}

function setAuthCookie(res, token) {
  res.cookie('cli_session', token, authCookieOptions())
}

function clearAuthCookie(res) {
  res.clearCookie('cli_session', clearCookieOptions(authCookieOptions()))
}

function safelyEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''))
  const rightBuffer = Buffer.from(String(right || ''))
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function setupPassport() {
  if (!hasGoogleOAuthCredentials()) return

  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await findUserByGoogleId(profile.id)
        if (!user) {
          const email = String(profile.emails?.[0]?.value || '').trim().toLowerCase()
          if (!email) return done(new Error('Google account did not provide an email address'))
          const existingUser = await findUserByEmail(email)
          user = existingUser
            ? await updateUser(existingUser.id, { googleId: profile.id })
            : await createUser({
                googleId: profile.id,
                name: profile.displayName,
                email,
                passwordHash: null,
                role: 'student',
                roles: ['student'],
              })
        }
        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }
  ))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, await findUserById(id))
    } catch (error) {
      done(error)
    }
  })
}

// GET /api/auth/config
router.get('/config', (req, res) => {
  res.json({
    googleCallbackUrl: GOOGLE_CALLBACK_URL,
    googleEnabled: hasGoogleOAuthCredentials(),
  })
})

// GET /api/auth/csrf
router.get('/csrf', (_req, res) => {
  const csrfToken = randomBytes(32).toString('hex')
  res.cookie('cli_csrf', csrfToken, csrfCookieOptions())
  res.json({ csrfToken })
})

// POST /api/auth/register
router.post('/register', registrationLimiter, async (req, res) => {
  try {
    const { name, email, username, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ error: 'Enter a valid email address' })
    const passwordError = validatePassword(password)
    if (passwordError) return res.status(400).json({ error: passwordError })
    if (await findUserByEmail(email)) return res.status(409).json({ error: 'Email already registered' })
    if (username && await findUserByUsername(username)) return res.status(409).json({ error: 'Username already taken' })
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_COST || 12))
    const user = await createUser({ name, email, username, passwordHash, googleId: null, role: 'student', roles: ['student'] })
    await recordAudit('auth.register', user.id, 'user', user.id, {})
    const token = signUserToken(user)
    setAuthCookie(res, token)
    res.json({ user: publicUser(user), redirectTo: dashboardPathForUser(user) })
  } catch (error) {
    if (error?.code === '23505') return res.status(409).json({ error: 'Email or username already registered' })
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const user = await findUserByEmail(email)
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    await updateUser(user.id, { lastLogin: new Date().toISOString() })
    await recordAudit('auth.login', user.id, 'user', user.id, {})
    const freshUser = await findUserById(user.id)
    const token = signUserToken(freshUser)
    setAuthCookie(res, token)
    res.json({ user: publicUser(freshUser), redirectTo: dashboardPathForUser(freshUser) })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/google
router.get('/google', (req, res, next) => {
  if (!hasGoogleOAuthCredentials()) {
    return res.redirect(`${FRONTEND_URL}/login?error=oauth_unconfigured`)
  }
  const redirect = safeRelativeRedirect(req.query.redirect)
  const state = signOAuthState({
    nonce: randomBytes(24).toString('hex'),
    redirect,
  })
  res.cookie('cli_oauth_state', state, oauthStateCookieOptions())
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state,
  })(req, res, next)
})

// GET /api/auth/google/callback
router.get('/google/callback',
  (req, res, next) => {
    if (!hasGoogleOAuthCredentials()) {
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_unconfigured`)
    }
    const state = String(req.query.state || '')
    const storedState = String(req.cookies?.cli_oauth_state || '')
    if (!state || !storedState || !safelyEqual(state, storedState)) {
      clearAuthCookie(res)
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_state`)
    }
    try {
      req.oauthState = verifyOAuthState(state)
    } catch {
      clearAuthCookie(res)
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_state`)
    }
    res.clearCookie('cli_oauth_state', clearCookieOptions(oauthStateCookieOptions()))
    return passport.authenticate('google', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
    })(req, res, next)
  },
  async (req, res) => {
    const token = signUserToken(req.user)
    setAuthCookie(res, token)
    await updateUser(req.user.id, { lastLogin: new Date().toISOString() })
    await recordAudit('auth.oauth_login', req.user.id, 'user', req.user.id, { provider: 'google' })
    const redirect = safeRelativeRedirect(req.oauthState?.redirect)
    const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
    res.redirect(`${FRONTEND_URL}/oauth/callback${redirectQuery}`)
  }
)

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

// POST /api/auth/change-password
router.post('/change-password', loginLimiter, requireAuth, async (req, res) => {
  try {
    const { currentPassword = '', newPassword = '' } = req.body
    const passwordError = validatePassword(newPassword)
    if (passwordError) return res.status(400).json({ error: passwordError })
    const user = await findUserById(req.user.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.passwordHash) {
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
    }
    const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_COST || 12))
    const updatedUser = await updateUserPassword(user.id, passwordHash)
    const token = signUserToken(updatedUser)
    setAuthCookie(res, token)
    res.json({ user: publicUser(updatedUser), message: user.passwordHash ? 'Password updated' : 'Password set for this account' })
  } catch {
    res.status(500).json({ error: 'Password update failed' })
  }
})

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

export default router
