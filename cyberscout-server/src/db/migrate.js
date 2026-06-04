import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db, databasePath } from './index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const migrationsDir = path.resolve(__dirname, '../../db/migrations')

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

const applied = new Set(db.prepare('SELECT name FROM schema_migrations').all().map(row => row.name))
const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort()

for (const file of files) {
  if (applied.has(file)) continue
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
  const run = db.transaction(() => {
    db.exec(sql)
    db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file)
  })
  run()
  console.log(`Applied migration: ${file}`)
}

console.log(`Database ready: ${databasePath()}`)
