import { Router } from 'express'
import bcrypt from 'bcrypt'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  findUserByUsername,
  getGoogleConnectionBySubject,
  getGoogleConnectionByUserId,
  publicUser,
  recordAudit,
  updateUser,
  updateUserPassword,
  upsertGoogleConnection,
  userHasRole,
} from '../db/repositories.js'
import { signOAuthState, signToken, verifyOAuthState } from '../lib/jwt.js'
import { requireAuth } from '../middleware/access.js'
import { authCookieOptions, clearCookieOptions, csrfCookieOptions, oauthPkceCookieOptions, oauthStateCookieOptions } from '../lib/cookies.js'
import { validatePassword } from '../lib/validation.js'
import { dashboardPathForUser, rolesForUser } from '../lib/roles.js'
import { validateTemporaryPassword } from '../services/instructorAccounts.js'
import { authSecurityDiagnostics, loginLimiter, registrationLimiter } from '../middleware/security.js'
import {
  buildGoogleAuthUrl,
  createPkceVerifier,
  encryptedTokenPayload,
  exchangeGoogleCode,
  fetchGoogleIdentity,
  googleOAuthConfigurationStatus,
  googleOAuthFailureReason,
  googleRedirectUri,
  hasGoogleOAuthCredentials,
} from '../services/google.js'

const router = Router()
const trimTrailingSlash = (value) => value?.replace(/\/+$/, '')
const FRONTEND_URL = trimTrailingSlash(process.env.FRONTEND_URL) || 'http://localhost:5173'

function safeRelativeRedirect(value, fallback = '') {
  if (!value || typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

function signUserToken(user) {
  const roles = rolesForUser(user)
  if (!roles.length) throw new Error('Unsupported account role')
  const role = roles.includes(user.role) ? user.role : roles[0]
  return signToken({
    sub: user.id,
    email: user.email,
    role,
    roles,
    tokenVersion: user.tokenVersion || 0,
  })
}

function setAuthCookie(res, token) {
  res.cookie('cli_session', token, authCookieOptions())
}

function clearAuthCookie(res) {
  res.clearCookie('cli_session', clearCookieOptions(authCookieOptions()))
}

function clearOAuthCookies(res) {
  res.clearCookie('cli_oauth_state', clearCookieOptions(oauthStateCookieOptions()))
  res.clearCookie('cli_oauth_pkce', clearCookieOptions(oauthPkceCookieOptions()))
}

function logGoogleUnavailable(req, flow) {
  const status = googleOAuthConfigurationStatus()
  console.warn('google-oauth-unavailable', {
    requestId: req.requestId,
    flow,
    reason: status.reason,
    status: 503,
  })
}

function safelyEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''))
  const rightBuffer = Buffer.from(String(right || ''))
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function setupPassport() {
  return null
}

// GET /api/auth/config
router.get('/config', (req, res) => {
  const google = googleOAuthConfigurationStatus()
  if (!google.enabled && process.env.NODE_ENV !== 'test') logGoogleUnavailable(req, 'config')
  res.json({
    googleCallbackUrl: google.enabled ? googleRedirectUri() : null,
    googleEnabled: google.enabled,
  })
})

// GET /api/auth/csrf
router.get('/csrf', authSecurityDiagnostics('csrf.bootstrap'), (_req, res) => {
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
router.post('/login', authSecurityDiagnostics('auth.login'), loginLimiter, async (req, res) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || '').trim().toLowerCase()
    const { password } = req.body
    if (!identifier || !password) return res.status(400).json({ error: 'Email or username and password required' })
    const user = identifier.includes('@') ? await findUserByEmail(identifier) : await findUserByUsername(identifier)
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    if (user.status !== 'active') return res.status(403).json({ error: 'Account unavailable' })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    await updateUser(user.id, { lastLogin: new Date().toISOString() })
    await recordAudit('auth.login', user.id, 'user', user.id, {})
    const freshUser = await findUserById(user.id)
    const redirectTo = freshUser.mustChangePassword ? '/change-password' : dashboardPathForUser(freshUser)
    if (!redirectTo) return res.status(403).json({ error: 'Unsupported account role' })
    const token = signUserToken(freshUser)
    setAuthCookie(res, token)
    res.json({ user: publicUser(freshUser), redirectTo })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/google
router.get('/google', (req, res) => {
  if (!hasGoogleOAuthCredentials()) {
    logGoogleUnavailable(req, 'login_start')
    return res.redirect(`${FRONTEND_URL}/login?error=oauth_unconfigured`)
  }
  const redirect = safeRelativeRedirect(req.query.redirect)
  const { verifier, challenge } = createPkceVerifier()
  const state = signOAuthState({
    flow: 'login',
    nonce: randomBytes(24).toString('hex'),
    redirect,
  })
  res.cookie('cli_oauth_state', state, oauthStateCookieOptions())
  res.cookie('cli_oauth_pkce', verifier, oauthPkceCookieOptions())
  return res.redirect(buildGoogleAuthUrl({ state, codeChallenge: challenge }))
})

// GET /api/auth/google/callback
router.get('/google/callback', async (req, res) => {
  try {
    if (!hasGoogleOAuthCredentials()) {
      logGoogleUnavailable(req, 'callback')
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_unconfigured`)
    }
    const state = String(req.query.state || '')
    const storedState = String(req.cookies?.cli_oauth_state || '')
    const codeVerifier = String(req.cookies?.cli_oauth_pkce || '')
    if (!state || !storedState || !safelyEqual(state, storedState)) {
      clearOAuthCookies(res)
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_state`)
    }
    try {
      req.oauthState = verifyOAuthState(state)
    } catch {
      clearOAuthCookies(res)
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_state`)
    }
    clearOAuthCookies(res)
    if (!codeVerifier) return res.redirect(`${FRONTEND_URL}/login?error=oauth_state`)
    if (!['login', 'meet_connect'].includes(req.oauthState?.flow)) return res.redirect(`${FRONTEND_URL}/login?error=oauth_state`)
    const code = String(req.query.code || '')
    if (!code) return res.redirect(`${FRONTEND_URL}/login?error=oauth_cancelled`)
    const tokens = await exchangeGoogleCode(code, codeVerifier)
    const profile = await fetchGoogleIdentity(tokens.access_token)
    if (req.oauthState.flow === 'meet_connect') {
      const user = await findUserById(req.oauthState.userId)
      if (!user || !userHasRole(user, ['admin', 'super_admin', 'instructor'])) {
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_forbidden`)
      }
      const linkedUser = await findUserByGoogleId(profile.subject)
      const linkedConnection = await getGoogleConnectionBySubject(profile.subject)
      if ((linkedUser && linkedUser.id !== user.id) || (linkedConnection && linkedConnection.userId !== user.id)) {
        return res.redirect(`${FRONTEND_URL}${safeRelativeRedirect(req.oauthState.redirect, '/instructor/dashboard')}?google=identity_in_use`)
      }
      const existingConnection = await getGoogleConnectionByUserId(user.id)
      const tokenPayload = encryptedTokenPayload(tokens, existingConnection?.encryptedRefreshToken || null)
      await upsertGoogleConnection({
        userId: user.id,
        googleSubject: profile.subject,
        googleEmail: profile.email,
        googleName: profile.name,
        googleAvatarUrl: profile.avatarUrl,
        ...tokenPayload,
      }, user.id)
      if (!user.googleId) await updateUser(user.id, { googleId: profile.subject })
      await recordAudit('google.meet_connect', user.id, 'user', user.id, { scopes: tokenPayload.grantedScopes })
      return res.redirect(`${FRONTEND_URL}${safeRelativeRedirect(req.oauthState.redirect, '/instructor/dashboard')}?google=connected`)
    }
    let user = await findUserByGoogleId(profile.subject)
    if (!user) {
      const existingUser = await findUserByEmail(profile.email)
      if (existingUser) return res.redirect(`${FRONTEND_URL}/login?error=oauth_link_required`)
      user = await createUser({
        googleId: profile.subject,
        name: profile.name,
        email: profile.email,
        passwordHash: null,
        role: 'student',
        roles: ['student'],
      })
    }
    if (user.status === 'suspended') return res.redirect(`${FRONTEND_URL}/login?error=account_suspended`)
    const token = signUserToken(user)
    setAuthCookie(res, token)
    await updateUser(user.id, { lastLogin: new Date().toISOString() })
    await recordAudit('auth.oauth_login', user.id, 'user', user.id, { provider: 'google' })
    const redirect = safeRelativeRedirect(req.oauthState?.redirect)
    const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
    res.redirect(`${FRONTEND_URL}/oauth/callback${redirectQuery}`)
  } catch (error) {
    console.warn('google-oauth-callback-failed', {
      requestId: req.requestId,
      flow: req.oauthState?.flow || 'unknown',
      reason: googleOAuthFailureReason(error),
      status: 502,
    })
    clearOAuthCookies(res)
    if (req.oauthState?.flow !== 'meet_connect') clearAuthCookie(res)
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`)
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

// POST /api/auth/change-password
router.post('/change-password', loginLimiter, requireAuth, async (req, res) => {
  try {
    const { currentPassword = '', newPassword = '' } = req.body
    const passwordError = req.user.mustChangePassword ? validateTemporaryPassword(newPassword) : validatePassword(newPassword)
    if (passwordError) return res.status(400).json({ error: passwordError })
    const user = await findUserById(req.user.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.passwordHash) {
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
      if (await bcrypt.compare(newPassword, user.passwordHash)) return res.status(400).json({ error: 'New password must be different from the current password.' })
    }
    const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_COST || 12))
    const updatedUser = await updateUserPassword(user.id, passwordHash)
    const token = signUserToken(updatedUser)
    setAuthCookie(res, token)
    res.json({
      user: publicUser(updatedUser),
      redirectTo: dashboardPathForUser(updatedUser),
      message: user.passwordHash ? 'Password updated' : 'Password set for this account',
    })
  } catch {
    res.status(500).json({ error: 'Password update failed' })
  }
})

// POST /api/auth/logout
router.post('/logout', authSecurityDiagnostics('auth.logout'), (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

export default router
