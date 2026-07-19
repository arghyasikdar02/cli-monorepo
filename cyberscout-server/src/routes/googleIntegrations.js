import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import {
  disconnectGoogleConnection,
  getGoogleConnectionByUserId,
  publicUser,
  recordAudit,
} from '../db/repositories.js'
import { signOAuthState } from '../lib/jwt.js'
import { oauthPkceCookieOptions, oauthStateCookieOptions } from '../lib/cookies.js'
import { requireAuth, requireRole } from '../middleware/access.js'
import {
  buildGoogleAuthUrl,
  createPkceVerifier,
  GOOGLE_LOGIN_SCOPES,
  GOOGLE_MEET_SCOPE,
  googleOAuthConfigurationStatus,
  hasGoogleOAuthCredentials,
} from '../services/google.js'

const router = Router()
const meetRoles = ['admin', 'super_admin', 'instructor']
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
  if (!hasGoogleOAuthCredentials()) {
    const google = googleOAuthConfigurationStatus()
    console.warn('google-oauth-unavailable', {
      requestId: req.requestId,
      flow: 'meet_connect',
      reason: google.reason,
      status: 503,
    })
    return res.status(503).json({ error: 'Google integration is not configured' })
  }
  const redirect = safeRelativeRedirect(req.query.redirect)
  const { verifier, challenge } = createPkceVerifier()
  const state = signOAuthState({
    flow: 'meet_connect',
    userId: req.user.id,
    redirect,
    nonce: randomBytes(24).toString('hex'),
  })
  res.cookie('cli_oauth_state', state, oauthStateCookieOptions())
  res.cookie('cli_oauth_pkce', verifier, oauthPkceCookieOptions())
  return res.redirect(buildGoogleAuthUrl({
    state,
    scopes: [...GOOGLE_LOGIN_SCOPES, GOOGLE_MEET_SCOPE],
    prompt: 'consent',
    codeChallenge: challenge,
  }))
})

router.post('/disconnect', requireRole(...meetRoles), async (req, res) => {
  await disconnectGoogleConnection(req.user.id, req.user.id)
  await recordAudit('google.disconnect_request', req.user.id, 'user', req.user.id, {})
  res.json({ google: publicConnection(null) })
})

export default router
