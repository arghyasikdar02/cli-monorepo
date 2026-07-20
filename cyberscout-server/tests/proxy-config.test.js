import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(testDir, '../..')

describe('first-party Vercel API proxy', () => {
  it('forwards /api to the existing Render service before the SPA fallback', () => {
    const config = JSON.parse(fs.readFileSync(path.join(repoRoot, 'cyberscout/vercel.json'), 'utf8'))
    assert.equal(config.rewrites[0].source, '/api')
    assert.equal(config.rewrites[0].destination, 'https://cyberlabin.onrender.com/api')
    assert.equal(config.rewrites[1].source, '/api/:path*')
    assert.equal(config.rewrites[1].destination, 'https://cyberlabin.onrender.com/api/:path*')
    assert.equal(config.rewrites.at(-1).destination, '/index.html')
    assert.doesNotMatch(JSON.stringify(config), /cli-hq1i\.onrender\.com|api\.cyberlabin\.com/)
  })

  it('uses Vercel path patterns for private-page noindex headers', () => {
    const config = JSON.parse(fs.readFileSync(path.join(repoRoot, 'cyberscout/vercel.json'), 'utf8'))
    const privateSources = config.headers.slice(1).map(rule => rule.source)

    assert.ok(privateSources.includes('/login'))
    assert.ok(privateSources.includes('/signup'))
    assert.ok(privateSources.includes('/auth'))
    assert.ok(privateSources.includes('/dashboard/:path*'))
    assert.ok(privateSources.includes('/admin/:path*'))
    assert.ok(privateSources.includes('/instructor/:path*'))
    assert.ok(privateSources.includes('/marketing/:path*'))
    assert.ok(privateSources.includes('/ops/:path*'))
    assert.ok(privateSources.includes('/learn/:path*'))
    assert.ok(privateSources.includes('/live-classes/:path*'))
    assert.ok(privateSources.includes('/billing/:path*'))
    assert.ok(privateSources.includes('/help/:path*'))
  })

  it('does not allow production frontend requests to select the Render origin directly', () => {
    const apiSource = fs.readFileSync(path.join(repoRoot, 'cyberscout/src/lib/api.js'), 'utf8')
    const loginSource = fs.readFileSync(path.join(repoRoot, 'cyberscout/src/pages/auth/LoginPage.jsx'), 'utf8')
    assert.match(apiSource, /if \(import\.meta\.env\.PROD\) return ''/)
    assert.doesNotMatch(apiSource, /onrender\.com|api\.cyberlabin\.com/)
    assert.match(apiSource, /credentials: 'include'/)
    assert.match(apiSource, /authConfig: \(\) => request\('\/api\/auth\/config'\)/)
    assert.match(loginSource, /api\.authConfig\(\)/)
    assert.match(loginSource, /setGoogleEnabled\(Boolean\(googleEnabled\)\)/)
  })

  it('keeps the Render blueprint aligned with the active backend origin', () => {
    const blueprint = fs.readFileSync(path.join(repoRoot, 'render.yaml'), 'utf8')
    assert.match(blueprint, /BACKEND_URL\n\s+value: https:\/\/cyberlabin\.onrender\.com/)
    assert.doesNotMatch(blueprint, /cli-hq1i\.onrender\.com|api\.cyberlabin\.com/)
  })
})
