import { Router } from 'express'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { findByEmail, findByGoogleId, findById, createUser, publicUser, updateUser } from '../store/users.js'
import { signToken, verifyToken } from '../lib/jwt.js'

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

function signUserToken(user) {
  return signToken({
    sub: user.id,
    email: user.email,
    role: user.role || 'student',
    roles: user.roles || [user.role || 'student'],
  })
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
      let user = findByGoogleId(profile.id)
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
  passport.deserializeUser((id, done) => done(null, findById(id)))
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
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })
    if (findByEmail(email)) return res.status(409).json({ error: 'Email already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = createUser({ name, email, passwordHash, googleId: null, role: 'student', roles: ['student'] })
    const token = signUserToken(user)
    res.json({ token, user: publicUser(user), redirectTo: dashboardPathForUser(user) })
  } catch {
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const user = findByEmail(email)
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    updateUser(user.id, { lastLogin: new Date().toISOString() })
    const freshUser = findById(user.id)
    const token = signUserToken(freshUser)
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
    res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`)
  }
)

// GET /api/auth/me
router.get('/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  try {
    const payload = verifyToken(auth.slice(7))
    const user = findById(payload.sub)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    res.json({ user: publicUser(user) })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.json({ ok: true })
})

export default router
