import jwt from 'jsonwebtoken'

const EXPIRY = process.env.JWT_EXPIRES_IN || '7d'
const ISSUER = 'cyberlabin-api'
const SESSION_AUDIENCE = 'cyberlabin-web'
const OAUTH_STATE_AUDIENCE = 'cyberlabin-oauth-state'

function secret() {
  const value = process.env.JWT_SECRET
  if (!value || String(value).length < 32) throw new Error('JWT_SECRET must be at least 32 characters')
  return value
}

export const signToken = (payload) => jwt.sign(payload, secret(), {
  algorithm: 'HS256',
  audience: SESSION_AUDIENCE,
  issuer: ISSUER,
  expiresIn: EXPIRY,
})

export const verifyToken = (token) => jwt.verify(token, secret(), {
  algorithms: ['HS256'],
  audience: SESSION_AUDIENCE,
  issuer: ISSUER,
})

export const signOAuthState = (payload) => jwt.sign(payload, secret(), {
  algorithm: 'HS256',
  audience: OAUTH_STATE_AUDIENCE,
  issuer: ISSUER,
  expiresIn: '10m',
})

export const verifyOAuthState = (token) => jwt.verify(token, secret(), {
  algorithms: ['HS256'],
  audience: OAUTH_STATE_AUDIENCE,
  issuer: ISSUER,
})
