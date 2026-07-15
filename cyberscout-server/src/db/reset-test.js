import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeDatabase, pool } from './index.js'

const __filename = fileURLToPath(import.meta.url)

export async function resetTestDatabase() {
  if (process.env.NODE_ENV !== 'test') throw new Error('Test database reset requires NODE_ENV=test')
  const url = new URL(process.env.DATABASE_URL)
  const databaseName = url.pathname.slice(1)
  const localHosts = new Set(['localhost', '127.0.0.1', '::1', 'postgres'])
  const remoteAllowed = process.env.ALLOW_REMOTE_TEST_DATABASE_RESET === 'YES'
  if (!/(^|[-_])test($|[-_])/i.test(databaseName)) {
    throw new Error('Refusing to reset a database whose name is not explicitly marked as a test database')
  }
  if (!localHosts.has(url.hostname) && !remoteAllowed) {
    throw new Error('Refusing to reset a remote test database without ALLOW_REMOTE_TEST_DATABASE_RESET=YES')
  }
  await pool.query('DROP SCHEMA IF EXISTS public CASCADE')
  await pool.query('CREATE SCHEMA public')
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    await resetTestDatabase()
  } finally {
    await closeDatabase()
  }
}
