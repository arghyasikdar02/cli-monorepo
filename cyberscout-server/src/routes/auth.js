import { Router } from 'express'
import bcrypt from 'bcrypt'
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
import { signToken, verifyToken } from '../lib/jwt.js'
import { requireAuth } from '../middleware/access.js'

const router = Router()
const trimTrailingSlash = (value) => value?.replace(/\/+$/, '')
const FRONTEND_URL = trimTrailingSlash(process.env.FRONTEND_URL) || 'http://localhost:5173'
const BACKEND_URL = trimTrailingSlash(process.env.BACKEND_URL) || `http://localhost:${process.env.PORT || 3001}`
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}/api/auth/google/callback`
const isProduction = process.env.NODE_ENV === 'production'

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

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
  res.clearCookie('cli_session', { ...authCookieOptions(), maxAge: undefined })
}

function tokenFromRequest(req) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return req.cookies?.cli_session
}

function isStrongPassword(password) {
  const value = String(password || '')
  return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value)
}

export function setupPassport() {
  if (!hasGoogleOAuthCredentials()) return

  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (_accessToken, _refreshToken, profile, done) => {
      let user = findUserByGoogleId(profile.id)
      if (!user) {
        user = createUser({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value ?? '',
          passwordHash: null,
          role: 'student',
          roles: ['student'],
        })
      }
      done(null, user)
    }
  ))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => done(null, findUserById(id)))
}

// GET /api/auth/config
router.get('/config', (req, res) => {
  res.json({
    googleCallbackUrl: GOOGLE_CALLBACK_URL,
    googleEnabled: hasGoogleOAuthCredentials(),
  })
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ error: 'Enter a valid email address' })
    if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
    if (findUserByEmail(email)) return res.status(409).json({ error: 'Email already registered' })
    if (username && findUserByUsername(username)) return res.status(409).json({ error: 'Username already taken' })
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_COST || 12))
    const user = createUser({ name, email, username, passwordHash, googleId: null, role: 'student', roles: ['student'] })
    recordAudit('auth.register', user.id, 'user', user.id, {})
    const token = signUserToken(user)
    setAuthCookie(res, token)
    res.json({ token, user: publicUser(user), redirectTo: dashboardPathForUser(user) })
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Email or username already registered' })
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const user = findUserByEmail(email)
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    updateUser(user.id, { lastLogin: new Date().toISOString() })
    recordAudit('auth.login', user.id, 'user', user.id, {})
    const freshUser = findUserById(user.id)
    const token = signUserToken(freshUser)
    setAuthCookie(res, token)
    res.json({ token, user: publicUser(freshUser), redirectTo: dashboardPathForUser(freshUser) })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/google
router.get('/google', (req, res, next) => {
  if (!hasGoogleOAuthCredentials()) {
    return res.redirect(`${FRONTEND_URL}/login?error=oauth_unconfigured`)
  }
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

// GET /api/auth/google/callback
router.get('/google/callback',
  (req, res, next) => {
    if (!hasGoogleOAuthCredentials()) {
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_unconfigured`)
    }
    return passport.authenticate('google', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
    })(req, res, next)
  },
  (req, res) => {
    const token = signUserToken(req.user)
    setAuthCookie(res, token)
    res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`)
  }
)

// GET /api/auth/me
router.get('/me', (req, res) => {
  const token = tokenFromRequest(req)
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const payload = verifyToken(token)
    const user = findUserById(payload.sub)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) return res.status(401).json({ error: 'Session expired' })
    res.json({ user: publicUser(user) })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword = '', newPassword = '' } = req.body
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters and include uppercase, lowercase, and a number.' })
    }
    const user = findUserById(req.user.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.passwordHash) {
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
    }
    const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_COST || 12))
    const updatedUser = updateUserPassword(user.id, passwordHash)
    const token = signUserToken(updatedUser)
    setAuthCookie(res, token)
    res.json({ token, user: publicUser(updatedUser), message: user.passwordHash ? 'Password updated' : 'Password set for this account' })
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
