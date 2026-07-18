import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { encryptToken, decryptToken } from '../src/lib/tokenCrypto.js'
import { buildGoogleAuthUrl, GOOGLE_MEET_SCOPE } from '../src/services/google.js'

describe('Google OAuth and Meet support', () => {
  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = '854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com'
    process.env.GOOGLE_CLIENT_SECRET = 'test_google_client_secret_123456'
    process.env.GOOGLE_REDIRECT_URI = 'https://cli-hq1i.onrender.com/api/auth/google/callback'
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = 'test_google_token_key_at_least_32_chars_1234567890'
  })

  it('encrypts Google tokens without storing plaintext', () => {
    const encrypted = encryptToken('ya29.test-token')
    assert.notEqual(encrypted, 'ya29.test-token')
    assert.match(encrypted, /^v1:/)
    assert.equal(decryptToken(encrypted), 'ya29.test-token')
  })

  it('builds login OAuth URLs with identity scopes only', () => {
    const url = new URL(buildGoogleAuthUrl({ state: 'signed-state', codeChallenge: 'challenge' }))
    assert.equal(url.searchParams.get('client_id'), process.env.GOOGLE_CLIENT_ID)
    assert.equal(url.searchParams.get('redirect_uri'), process.env.GOOGLE_REDIRECT_URI)
    assert.equal(url.searchParams.get('state'), 'signed-state')
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256')
    assert.equal(url.searchParams.get('scope'), 'openid email profile')
    assert.equal(url.searchParams.has('access_type'), false)
  })

  it('requests offline access only for Google Meet authorization', () => {
    const url = new URL(buildGoogleAuthUrl({
      state: 'signed-state',
      scopes: ['openid', 'email', 'profile', GOOGLE_MEET_SCOPE],
      prompt: 'consent',
      codeChallenge: 'challenge',
    }))
    assert.equal(url.searchParams.get('access_type'), 'offline')
    assert.equal(url.searchParams.get('prompt'), 'consent')
    assert.ok(url.searchParams.get('scope').includes(GOOGLE_MEET_SCOPE))
  })
})
