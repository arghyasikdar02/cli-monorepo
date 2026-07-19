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
    assert.equal(config.rewrites[0].source, '/api/:path*')
    assert.equal(config.rewrites[0].destination, 'https://cli-hq1i.onrender.com/api/:path*')
    assert.equal(config.rewrites.at(-1).destination, '/index.html')
  })

  it('does not allow production frontend requests to select the Render origin directly', () => {
    const apiSource = fs.readFileSync(path.join(repoRoot, 'cyberscout/src/lib/api.js'), 'utf8')
    assert.match(apiSource, /if \(import\.meta\.env\.PROD\) return ''/)
    assert.doesNotMatch(apiSource, /cli-hq1i\.onrender\.com/)
    assert.match(apiSource, /credentials: 'include'/)
  })
})
