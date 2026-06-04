import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverRoot = path.resolve(__dirname, '../..')

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

export function transaction(fn) {
  return db.transaction(fn)()
}

export function closeDatabase() {
  db.close()
}

export function databasePath() {
  return dbPath
}
