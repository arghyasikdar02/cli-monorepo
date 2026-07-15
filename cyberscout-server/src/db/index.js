import pg from 'pg'

const { Pool } = pg

function parseDatabaseUrl(value = process.env.DATABASE_URL) {
  const raw = String(value || '').trim()
  if (!raw) {
    throw new Error('DATABASE_URL is required. Configure the Supabase PostgreSQL connection string.')
  }

  let url
  try {
    url = new URL(raw)
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL.')
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must use the postgresql:// or postgres:// protocol.')
  }
  if (!url.hostname || !url.username || !url.pathname || url.pathname === '/') {
    throw new Error('DATABASE_URL must include a PostgreSQL host, user, and database name.')
  }
  return { raw, url }
}

function sslConfiguration(url) {
  const setting = String(process.env.DATABASE_SSL || '').trim().toLowerCase()
  if (['0', 'false', 'disable', 'off'].includes(setting)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_SSL cannot be disabled in production.')
    }
    return false
  }

  const localHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  if (!setting && localHost && process.env.NODE_ENV !== 'production') return false

  const certificate = String(process.env.DATABASE_SSL_CA || '').replace(/\\n/g, '\n').trim()
  return certificate
    ? { ca: certificate, rejectUnauthorized: true }
    : { rejectUnauthorized: true }
}

const { raw: connectionString, url: databaseUrl } = parseDatabaseUrl()

export const databaseEngine = 'postgresql'
export const pool = new Pool({
  connectionString,
  ssl: sslConfiguration(databaseUrl),
  max: Number(process.env.DATABASE_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30_000),
  connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS || 10_000),
  application_name: process.env.DATABASE_APPLICATION_NAME || 'cyberlabin-api',
})

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message)
})

export async function query(text, values = [], client = pool) {
  return client.query(text, values)
}

export async function queryOne(text, values = [], client = pool) {
  const result = await query(text, values, client)
  return result.rows[0] || null
}

export async function queryMany(text, values = [], client = pool) {
  const result = await query(text, values, client)
  return result.rows
}

export async function execute(text, values = [], client = pool) {
  const result = await query(text, values, client)
  return { rowCount: result.rowCount, rows: result.rows }
}

export async function transaction(work) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function checkDatabaseConnection() {
  const row = await queryOne('SELECT current_database() AS database, CURRENT_TIMESTAMP AS checked_at')
  return { engine: databaseEngine, database: row.database, checkedAt: row.checked_at }
}

export async function closeDatabase() {
  await pool.end()
}
