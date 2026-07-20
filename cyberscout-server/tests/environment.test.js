import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { getAllowedOrigins, validateEnvironment } from '../src/lib/environment.js'

const validProductionEnvironment = {
  NODE_ENV: 'production',
  FRONTEND_URL: 'https://cyberlabin.com/',
  BACKEND_URL: 'https://cli-hq1i.onrender.com/',
  CORS_ORIGINS: 'https://cyberlabin.com/, https://www.cyberlabin.com',
  DATABASE_URL: 'postgresql://postgres:production-db-secret@db.project.supabase.co:5432/postgres?sslmode=require',
  JWT_SECRET: 'j'.repeat(64),
  VISITOR_HASH_SALT: 'v'.repeat(64),
  LAB_FLAG_SALT: 'l'.repeat(64),
  CLIADM_ADMIN_TOKEN: 'a'.repeat(64),
  COOKIE_SECURE: 'true',
  COOKIE_SAME_SITE: 'lax',
  BCRYPT_COST: '12',
}

describe('production environment validation', () => {
  it('accepts and normalizes a valid Render configuration', () => {
    const result = validateEnvironment({ ...validProductionEnvironment })
    assert.equal(result.frontendUrl, 'https://cyberlabin.com')
    assert.equal(result.backendUrl, 'https://cli-hq1i.onrender.com')
    assert.equal(result.databaseUrl, validProductionEnvironment.DATABASE_URL)
    assert.deepEqual(result.allowedOrigins, ['https://cyberlabin.com', 'https://www.cyberlabin.com'])
  })

  it('accepts the configured public HTTPS backend origin without coupling it to the OAuth callback host', () => {
    const result = validateEnvironment({
      ...validProductionEnvironment,
      BACKEND_URL: 'https://cyberlabin.onrender.com',
    })
    assert.equal(result.backendUrl, 'https://cyberlabin.onrender.com')
  })

  it('requires the first-party proxy cookie and Google callback configuration', () => {
    const googleEnvironment = {
      ...validProductionEnvironment,
      GOOGLE_CLIENT_ID: '854487433792-1ntj74qq2qta3fei0a7qhhj650n2p5cv.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'g'.repeat(32),
      GOOGLE_TOKEN_ENCRYPTION_KEY: 'e'.repeat(64),
      GOOGLE_REDIRECT_URI: 'https://cyberlabin.com/api/auth/google/callback',
    }
    assert.doesNotThrow(() => validateEnvironment(googleEnvironment))
    assert.throws(
      () => validateEnvironment({ ...googleEnvironment, GOOGLE_REDIRECT_URI: 'https://cli-hq1i.onrender.com/api/auth/google/callback' }),
      /GOOGLE_REDIRECT_URI: must be https:\/\/cyberlabin\.com\/api\/auth\/google\/callback/,
    )
    assert.throws(
      () => validateEnvironment({ ...googleEnvironment, COOKIE_SAME_SITE: 'none' }),
      /COOKIE_SAME_SITE: must be lax/,
    )
  })

  it('rejects partial and legacy Google OAuth environment variables', () => {
    assert.throws(
      () => validateEnvironment({
        ...validProductionEnvironment,
        GOOGLE_CLIENT_ID: '854487433792-example.apps.googleusercontent.com',
      }),
      /configure all three values together/,
    )
    assert.throws(
      () => validateEnvironment({
        ...validProductionEnvironment,
        GOOGLE_OAUTH_CLIENT_ID: 'legacy-client-id',
        GOOGLE_OAUTH_CLIENT_SECRET: 'legacy-secret',
        GOOGLE_OAUTH_REDIRECT_URI: 'https://cyberlabin.com/api/auth/google/callback',
      }),
      /legacy Google OAuth variables are not supported/,
    )
    assert.throws(
      () => validateEnvironment({
        ...validProductionEnvironment,
        GOOGLE_CALLBACK_URL: 'https://cyberlabin.com/api/auth/google/callback',
      }),
      /GOOGLE_CALLBACK_URL: legacy Google OAuth variables are not supported/,
    )
  })

  it('returns every actionable failure without exposing supplied secret values', () => {
    const invalid = {
      ...validProductionEnvironment,
      BACKEND_URL: 'http://localhost:3001',
      CORS_ORIGINS: 'https://preview.example.com',
      DATABASE_URL: 'file:./data/local.db',
      LAB_FLAG_SALT: 'replace-with-a-secret',
      CLIADM_ADMIN_TOKEN: 'short',
      COOKIE_SECURE: 'false',
      BCRYPT_COST: '4',
    }
    assert.throws(
      () => validateEnvironment(invalid),
      error => {
        assert.match(error.message, /BACKEND_URL:/)
        assert.match(error.message, /LAB_FLAG_SALT:/)
        assert.match(error.message, /CLIADM_ADMIN_TOKEN:/)
        assert.match(error.message, /CORS_ORIGINS:/)
        assert.match(error.message, /DATABASE_URL:/)
        assert.match(error.message, /COOKIE_SECURE:/)
        assert.match(error.message, /BCRYPT_COST:/)
        assert.doesNotMatch(error.message, /replace-with-a-secret/)
        return true
      },
    )
  })

  it('accepts a standard PostgreSQL URL and rejects file database URLs', () => {
    assert.doesNotThrow(() => validateEnvironment({ ...validProductionEnvironment, DATABASE_URL: 'postgresql://user:strong-db-secret@example.com/database' }))
    assert.throws(() => validateEnvironment({ ...validProductionEnvironment, DATABASE_URL: 'file:./data/local.db' }), /DATABASE_URL: must use the postgresql:\/\//)
  })

  it('keeps local preview origins outside production only', () => {
    assert.ok(getAllowedOrigins({ NODE_ENV: 'development', FRONTEND_URL: 'http://localhost:5173' }).includes('http://localhost:4173'))
    assert.ok(!getAllowedOrigins(validProductionEnvironment).includes('http://localhost:4173'))
  })

  it('normalizes a trailing slash but rejects paths in CORS origins', () => {
    assert.doesNotThrow(() => validateEnvironment({ ...validProductionEnvironment, CORS_ORIGINS: 'https://cyberlabin.com/' }))
    assert.throws(
      () => validateEnvironment({ ...validProductionEnvironment, CORS_ORIGINS: 'https://cyberlabin.com/app' }),
      /CORS_ORIGINS: entry 1 must be a public HTTPS origin/,
    )
  })

  it('fails before opening the database pool when the production environment is invalid', () => {
    const result = spawnSync(process.execPath, ['src/start.js'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        ...validProductionEnvironment,
        BACKEND_URL: 'http://localhost:3001',
        LAB_FLAG_SALT: 'placeholder',
        GOOGLE_CLIENT_ID: '',
        GOOGLE_CLIENT_SECRET: '',
        GOOGLE_REDIRECT_URI: '',
        RAZORPAY_KEY_ID: '',
        RAZORPAY_KEY_SECRET: '',
        RAZORPAY_WEBHOOK_SECRET: '',
      },
    })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /BACKEND_URL:/)
    assert.match(result.stderr, /LAB_FLAG_SALT:/)
  })
})
