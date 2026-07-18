import { Router } from 'express'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import {
  disconnectGoogleConnection,
  findUserByGoogleId,
  getGoogleConnectionBySubject,
  getGoogleConnectionByUserId,
  publicUser,
  recordAudit,
  updateUser,
  upsertGoogleConnection,
} from '../db/repositories.js'
import { signOAuthState, verifyOAuthState } from '../lib/jwt.js'
import { clearCookieOptions, oauthStateCookieOptions } from '../lib/cookies.js'
import { requireAuth, requireRole } from '../middleware/access.js'
import {
  buildGoogleAuthUrl,
  createPkceVerifier,
  encryptedTokenPayload,
  exchangeGoogleCode,
  fetchGoogleIdentity,
  GOOGLE_LOGIN_SCOPES,
  GOOGLE_MEET_SCOPE,
  hasGoogleOAuthCredentials,
} from '../services/google.js'

const router = Router()
const meetRoles = ['admin', 'super_admin', 'instructor']
const FRONTEND_URL = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')

function safelyEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''))
  const rightBuffer = Buffer.from(String(right || ''))
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function safeRelativeRedirect(value, fallback = '/instructor/dashboard') {
  if (!value || typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

function publicConnection(connection) {
  if (!connection) return {
    connected: false,
    googleEmail: null,
    meetScopeGranted: false,
    grantedScopes: [],
  }
  return {
    connected: true,
    googleEmail: connection.googleEmail,
    googleName: connection.googleName,
    googleAvatarUrl: connection.googleAvatarUrl,
    meetScopeGranted: connection.grantedScopes.includes(GOOGLE_MEET_SCOPE),
    grantedScopes: connection.grantedScopes,
    updatedAt: connection.updatedAt,
  }
}

router.use(requireAuth)

router.get('/status', async (req, res) => {
  const connection = await getGoogleConnectionByUserId(req.user.id)
  res.json({ google: publicConnection(connection), user: publicUser(req.user) })
})

router.get('/connect', requireRole(...meetRoles), async (req, res) => {
  if (!hasGoogleOAuthCredentials()) return res.status(503).json({ error: 'Google integration is not configured' })
  const redirect = safeRelativeRedirect(req.query.redirect)
  const { verifier, challenge } = createPkceVerifier()
  const state = signOAuthState({
    flow: 'meet_connect',
    userId: req.user.id,
    redirect,
    verifier,
    nonce: randomBytes(24).toString('hex'),
  })
  res.cookie('cli_oauth_state', state, oauthStateCookieOptions())
  return res.redirect(buildGoogleAuthUrl({
    state,
    scopes: [...GOOGLE_LOGIN_SCOPES, GOOGLE_MEET_SCOPE],
    prompt: 'consent',
    codeChallenge: challenge,
  }))
})

router.get('/callback', requireRole(...meetRoles), async (req, res) => {
  try {
    const state = String(req.query.state || '')
    const storedState = String(req.cookies?.cli_oauth_state || '')
    if (!state || !storedState || !safelyEqual(state, storedState)) return res.redirect(`${FRONTEND_URL}/instructor/dashboard?google=state_error`)
    const oauthState = verifyOAuthState(state)
    res.clearCookie('cli_oauth_state', clearCookieOptions(oauthStateCookieOptions()))
    if (oauthState.flow !== 'meet_connect' || oauthState.userId !== req.user.id) {
      return res.redirect(`${FRONTEND_URL}/instructor/dashboard?google=state_error`)
    }
    const code = String(req.query.code || '')
    if (!code) return res.redirect(`${FRONTEND_URL}${safeRelativeRedirect(oauthState.redirect)}?google=cancelled`)
    const tokens = await exchangeGoogleCode(code, oauthState.verifier)
    const profile = await fetchGoogleIdentity(tokens.access_token)
    const linkedUser = await findUserByGoogleId(profile.subject)
    if (linkedUser && linkedUser.id !== req.user.id) {
      return res.redirect(`${FRONTEND_URL}${safeRelativeRedirect(oauthState.redirect)}?google=identity_in_use`)
    }
    const existingSubject = await getGoogleConnectionBySubject(profile.subject)
    if (existingSubject && existingSubject.userId !== req.user.id) {
      return res.redirect(`${FRONTEND_URL}${safeRelativeRedirect(oauthState.redirect)}?google=identity_in_use`)
    }
    const existingConnection = await getGoogleConnectionByUserId(req.user.id)
    const tokenPayload = encryptedTokenPayload(tokens, existingConnection?.encryptedRefreshToken || null)
    await upsertGoogleConnection({
      userId: req.user.id,
      googleSubject: profile.subject,
      googleEmail: profile.email,
      googleName: profile.name,
      googleAvatarUrl: profile.avatarUrl,
      ...tokenPayload,
    }, req.user.id)
    if (!req.user.googleId) await updateUser(req.user.id, { googleId: profile.subject })
    await recordAudit('google.meet_connect', req.user.id, 'user', req.user.id, { scopes: tokenPayload.grantedScopes })
    return res.redirect(`${FRONTEND_URL}${safeRelativeRedirect(oauthState.redirect)}?google=connected`)
  } catch {
    return res.redirect(`${FRONTEND_URL}/instructor/dashboard?google=failed`)
  }
})

router.post('/disconnect', requireRole(...meetRoles), async (req, res) => {
  await disconnectGoogleConnection(req.user.id, req.user.id)
  await recordAudit('google.disconnect_request', req.user.id, 'user', req.user.id, {})
  res.json({ google: publicConnection(null) })
})

export default router
