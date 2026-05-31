import { Router } from 'express'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { findByEmail, findByGoogleId, findById, createUser, publicUser } from '../store/users.js'
import { signToken, verifyToken } from '../lib/jwt.js'

const router = Router()

export function setupPassport() {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT || 3001}/api/auth/google/callback`,
    },
    (_accessToken, _refreshToken, profile, done) => {
      let user = findByGoogleId(profile.id)
      if (!user) {
        user = createUser({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value ?? '',
          passwordHash: null,
        })
      }
      done(null, user)
    }
  ))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => done(null, findById(id)))
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })
    if (findByEmail(email)) return res.status(409).json({ error: 'Email already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = createUser({ name, email, passwordHash, googleId: null })
    const token = signToken({ sub: user.id, email: user.email })
    res.json({ token, user: publicUser(user) })
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
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken({ sub: user.id, email: user.email })
    res.json({ token, user: publicUser(user) })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

// GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  (req, res) => {
    const token = signToken({ sub: req.user.id, email: req.user.email })
    res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}`)
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
    res.json({ user: publicUser(user) })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
