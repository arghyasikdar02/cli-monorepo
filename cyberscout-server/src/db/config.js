import 'dotenv/config'

const POSTGRES_PROTOCOLS = new Set(['postgres:', 'postgresql:'])
const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
const DISABLED_SSL_VALUES = new Set(['0', 'false', 'disable', 'off'])
const ENABLED_SSL_VALUES = new Set(['1', 'true', 'require', 'on', 'prefer'])
const VERIFIED_SSL_VALUES = new Set(['verify-ca', 'verify-full', 'strict'])
const CONNECTION_STRING_SSL_OPTIONS = new Set([
  'sslmode',
  'sslcert',
  'sslkey',
  'sslrootcert',
])

function positiveInteger(value, fallback, name) {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`)
  }
  return parsed
}

export function parseDatabaseUrl(value) {
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

  if (!POSTGRES_PROTOCOLS.has(url.protocol)) {
    throw new Error('DATABASE_URL must use the postgresql:// or postgres:// protocol.')
  }
  if (!url.hostname || !url.username || !url.pathname || url.pathname === '/') {
    throw new Error('DATABASE_URL must include a PostgreSQL host, user, and database name.')
  }

  // node-postgres lets URL SSL parameters replace an explicit ssl object. Remove
  // them so every process uses the policy defined below.
  for (const key of [...url.searchParams.keys()]) {
    if (CONNECTION_STRING_SSL_OPTIONS.has(key.toLowerCase())) url.searchParams.delete(key)
  }

  return url
}

export function createDatabaseConfig(env = process.env) {
  const url = parseDatabaseUrl(env.DATABASE_URL)
  const isProduction = env.NODE_ENV === 'production' || String(env.RENDER || '').toLowerCase() === 'true'
  const sslSetting = String(env.DATABASE_SSL || '').trim().toLowerCase()
  const certificate = String(env.DATABASE_SSL_CA || '').replace(/\\n/g, '\n').trim()

  if (DISABLED_SSL_VALUES.has(sslSetting) && isProduction) {
    throw new Error('DATABASE_SSL cannot be disabled in production.')
  }

  const knownSslSetting = !sslSetting
    || DISABLED_SSL_VALUES.has(sslSetting)
    || ENABLED_SSL_VALUES.has(sslSetting)
    || VERIFIED_SSL_VALUES.has(sslSetting)
  if (!knownSslSetting) {
    throw new Error('DATABASE_SSL must be require, verify-full, or disable (development only).')
  }

  let ssl = false
  if (certificate) {
    ssl = { ca: certificate, rejectUnauthorized: true }
  } else if (VERIFIED_SSL_VALUES.has(sslSetting)) {
    ssl = { rejectUnauthorized: true }
  } else if (isProduction || ENABLED_SSL_VALUES.has(sslSetting)) {
    // Supabase/Render may present a provider-managed chain that Node cannot
    // validate from its bundled roots. Limit this compatibility setting to pg.
    ssl = { rejectUnauthorized: false }
  } else if (!DISABLED_SSL_VALUES.has(sslSetting) && !LOCAL_DATABASE_HOSTS.has(url.hostname)) {
    ssl = false
  }

  return {
    connectionString: url.toString(),
    ssl,
    max: positiveInteger(env.DATABASE_POOL_MAX, 10, 'DATABASE_POOL_MAX'),
    idleTimeoutMillis: positiveInteger(env.DATABASE_IDLE_TIMEOUT_MS, 30_000, 'DATABASE_IDLE_TIMEOUT_MS'),
    connectionTimeoutMillis: positiveInteger(env.DATABASE_CONNECT_TIMEOUT_MS, 10_000, 'DATABASE_CONNECT_TIMEOUT_MS'),
    application_name: env.DATABASE_APPLICATION_NAME || 'cyberlabin-api',
  }
}

export const databaseConfig = createDatabaseConfig()

export function databaseConfigurationStatus(config = databaseConfig) {
  return {
    configured: Boolean(config.connectionString),
    sslEnabled: Boolean(config.ssl),
    certificateVerification: Boolean(config.ssl && config.ssl.rejectUnauthorized),
  }
}
