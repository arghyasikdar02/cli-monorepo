import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const migrationsDir = path.resolve(__dirname, '../../db/migrations')

if (!fs.existsSync(migrationsDir)) {
  throw new Error(`Migrations directory not found: ${migrationsDir}`)
}

process.env.DB_SKIP_AUTO_MIGRATE = '1'
const { databasePath, runPendingMigrations } = await import('./index.js')
const applied = runPendingMigrations({ log: true })
if (!applied.length) console.log('No pending migrations.')
console.log(`Database ready: ${databasePath()}`)
