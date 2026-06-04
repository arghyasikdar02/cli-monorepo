import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverRoot = path.resolve(__dirname, '../..')
const migrationsDir = path.resolve(serverRoot, 'db/migrations')

function databaseFileFromUrl(value = process.env.DATABASE_URL) {
  const fallback = path.join(serverRoot, 'data/cyberlab.sqlite')
  if (!value) return fallback
  if (value.startsWith('file:')) {
    const rawPath = value.slice('file:'.length)
    return path.isAbsolute(rawPath) ? rawPath : path.resolve(serverRoot, rawPath)
  }
  if (value.startsWith('sqlite:')) {
    const rawPath = value.slice('sqlite:'.length)
    return path.isAbsolute(rawPath) ? rawPath : path.resolve(serverRoot, rawPath)
  }
  return fallback
}

const dbPath = databaseFileFromUrl()
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

export function runPendingMigrations({ log = false } = {}) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  if (!fs.existsSync(migrationsDir)) {
    if (log) console.warn(`Migrations directory not found: ${migrationsDir}`)
    return []
  }

  const applied = new Set(db.prepare('SELECT name FROM schema_migrations').all().map(row => row.name))
  const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort()
  const appliedNow = []

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    const run = db.transaction(() => {
      db.exec(sql)
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file)
    })
    run()
    appliedNow.push(file)
    if (log) console.log(`Applied migration: ${file}`)
  }

  return appliedNow
}

if (process.env.DB_SKIP_AUTO_MIGRATE !== '1') {
  runPendingMigrations({ log: process.env.DB_MIGRATION_LOG === '1' || process.env.NODE_ENV === 'production' })
}

export function transaction(fn) {
  return db.transaction(fn)()
}

export function closeDatabase() {
  db.close()
}

export function databasePath() {
  return dbPath
}
