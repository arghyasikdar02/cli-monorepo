import { randomBytes, createHash } from 'node:crypto'
import { decryptToken, encryptToken } from '../lib/tokenCrypto.js'

export const GOOGLE_LOGIN_SCOPES = ['openid', 'email', 'profile']
export const GOOGLE_MEET_SCOPE = 'https://www.googleapis.com/auth/meetings.space.created'
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'
const GOOGLE_MEET_SPACES_URL = 'https://meet.googleapis.com/v2/spaces'

function callbackUrl() {
  return process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_CALLBACK_URL || `${String(process.env.BACKEND_URL || 'http://localhost:3001').replace(/\/+$/, '')}/api/auth/google/callback`
}

function clientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Google OAuth is not configured')
  return { clientId, clientSecret, redirectUri: callbackUrl() }
}

export function hasGoogleOAuthCredentials() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export function createPkceVerifier() {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function buildGoogleAuthUrl({ state, scopes = GOOGLE_LOGIN_SCOPES, prompt, codeChallenge }) {
  const { clientId, redirectUri } = clientConfig()
  const url = new URL(GOOGLE_AUTH_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes.join(' '))
  url.searchParams.set('state', state)
  url.searchParams.set('include_granted_scopes', 'true')
  if (prompt) url.searchParams.set('prompt', prompt)
  if (scopes.includes(GOOGLE_MEET_SCOPE)) url.searchParams.set('access_type', 'offline')
  if (codeChallenge) {
    url.searchParams.set('code_challenge', codeChallenge)
    url.searchParams.set('code_challenge_method', 'S256')
  }
  return url.toString()
}

export async function exchangeGoogleCode(code, codeVerifier) {
  const { clientId, clientSecret, redirectUri } = clientConfig()
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  if (codeVerifier) body.set('code_verifier', codeVerifier)
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Google token exchange failed')
  return payload
}

export async function fetchGoogleIdentity(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })
  const profile = await response.json().catch(() => ({}))
  if (!response.ok || !profile.sub || !profile.email_verified) throw new Error('Google identity could not be verified')
  return {
    subject: profile.sub,
    email: String(profile.email || '').toLowerCase(),
    emailVerified: Boolean(profile.email_verified),
    name: profile.name || profile.email,
    avatarUrl: profile.picture || null,
  }
}

export function normalizeScopes(scopeText = '') {
  return Array.from(new Set(String(scopeText).split(/\s+/).map(scope => scope.trim()).filter(Boolean)))
}

export function encryptedTokenPayload(tokens, existingRefreshToken = null) {
  const scopes = normalizeScopes(tokens.scope)
  return {
    encryptedAccessToken: encryptToken(tokens.access_token),
    encryptedRefreshToken: tokens.refresh_token ? encryptToken(tokens.refresh_token) : existingRefreshToken,
    tokenExpiry: tokens.expires_in ? new Date(Date.now() + Number(tokens.expires_in) * 1000).toISOString() : null,
    grantedScopes: scopes,
  }
}

export async function refreshGoogleAccessToken(connection) {
  const refreshToken = decryptToken(connection.encryptedRefreshToken)
  if (!refreshToken) throw new Error('Google connection needs reauthorization')
  const { clientId, clientSecret } = clientConfig()
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const tokens = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(tokens.error || 'Google token refresh failed')
  const payload = encryptedTokenPayload(tokens, connection.encryptedRefreshToken)
  if (!payload.grantedScopes.length) payload.grantedScopes = connection.grantedScopes || []
  return payload
}

export async function createGoogleMeetSpace(accessToken) {
  const response = await fetch(GOOGLE_MEET_SPACES_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({}),
  })
  const space = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(space.error?.message || 'Google Meet space creation failed')
  return {
    spaceName: space.name || null,
    meetingCode: space.meetingCode || null,
    meetingUri: space.meetingUri || space.meeting_url || null,
  }
}

export function decryptAccessToken(connection) {
  return decryptToken(connection.encryptedAccessToken)
}
