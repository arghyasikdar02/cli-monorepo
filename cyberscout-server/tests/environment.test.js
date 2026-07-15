import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { getAllowedOrigins, validateEnvironment } from '../src/lib/environment.js'

const validProductionEnvironment = {
  NODE_ENV: 'production',
  FRONTEND_URL: 'https://cyberlabin.com/',
  BACKEND_URL: 'https://cyberlabin.onrender.com/',
  CORS_ORIGINS: 'https://cyberlabin.com/, https://www.cyberlabin.com',
  DATABASE_PATH: '/var/data/cyberlab.sqlite',
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
    assert.equal(result.backendUrl, 'https://cyberlabin.onrender.com')
    assert.equal(result.databasePath, '/var/data/cyberlab.sqlite')
    assert.deepEqual(result.allowedOrigins, ['https://cyberlabin.com', 'https://www.cyberlabin.com'])
  })

  it('returns every actionable failure without exposing supplied secret values', () => {
    const invalid = {
      ...validProductionEnvironment,
      BACKEND_URL: 'http://localhost:3001',
      CORS_ORIGINS: 'https://preview.example.com',
      DATABASE_PATH: './data/cyberlab.sqlite',
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
        assert.match(error.message, /DATABASE_PATH:/)
        assert.match(error.message, /COOKIE_SECURE:/)
        assert.match(error.message, /BCRYPT_COST:/)
        assert.doesNotMatch(error.message, /replace-with-a-secret/)
        return true
      },
    )
  })

  it('rejects an unimplemented Postgres URL instead of silently using SQLite', () => {
    assert.throws(
      () => validateEnvironment({ ...validProductionEnvironment, DATABASE_URL: 'postgresql://user:secret@example.com/database' }),
      /DATABASE_URL: PostgreSQL URLs are not supported/,
    )
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

  it('fails before opening SQLite when the production environment is invalid', () => {
    const databasePath = path.join(os.tmpdir(), `cyberlab-invalid-start-${process.pid}.sqlite`)
    fs.rmSync(databasePath, { force: true })
    const result = spawnSync(process.execPath, ['src/start.js'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        ...validProductionEnvironment,
        BACKEND_URL: 'http://localhost:3001',
        DATABASE_PATH: databasePath,
        LAB_FLAG_SALT: 'placeholder',
        GOOGLE_CLIENT_ID: '',
        GOOGLE_CLIENT_SECRET: '',
        GOOGLE_CALLBACK_URL: '',
        RAZORPAY_KEY_ID: '',
        RAZORPAY_KEY_SECRET: '',
        RAZORPAY_WEBHOOK_SECRET: '',
      },
    })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /BACKEND_URL:/)
    assert.match(result.stderr, /LAB_FLAG_SALT:/)
    assert.equal(fs.existsSync(databasePath), false)
  })
})
