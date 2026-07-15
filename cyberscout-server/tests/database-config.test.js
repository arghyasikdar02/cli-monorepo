import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createDatabaseConfig } from '../src/db/config.js'

const databaseUrl = 'postgresql://user:strong-database-password@db.project.supabase.co:5432/postgres'

describe('PostgreSQL connection configuration', () => {
  it('uses connection-scoped TLS compatibility in production', () => {
    const config = createDatabaseConfig({
      NODE_ENV: 'production',
      DATABASE_URL: `${databaseUrl}?sslmode=require`,
      DATABASE_SSL: 'require',
    })

    assert.deepEqual(config.ssl, { rejectUnauthorized: false })
    assert.doesNotMatch(config.connectionString, /sslmode=/)
  })

  it('removes URL SSL options before node-postgres builds the connection', () => {
    const config = createDatabaseConfig({
      NODE_ENV: 'production',
      DATABASE_URL: `${databaseUrl}?application_name=url-test&sslmode=verify-full&sslcert=client.pem&sslkey=client.key&sslrootcert=root.pem`,
    })

    assert.match(config.connectionString, /application_name=url-test/)
    assert.doesNotMatch(config.connectionString, /ssl(?:mode|cert|key|rootcert)=/)
  })

  it('keeps ordinary local PostgreSQL connections unencrypted by default', () => {
    const config = createDatabaseConfig({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/cyberlabin',
    })

    assert.equal(config.ssl, false)
  })

  it('supports explicit TLS for non-production database testing', () => {
    const config = createDatabaseConfig({
      NODE_ENV: 'development',
      DATABASE_URL: databaseUrl,
      DATABASE_SSL: 'require',
    })

    assert.deepEqual(config.ssl, { rejectUnauthorized: false })
  })

  it('uses strict certificate verification when a CA is supplied', () => {
    const config = createDatabaseConfig({
      NODE_ENV: 'production',
      DATABASE_URL: databaseUrl,
      DATABASE_SSL: 'require',
      DATABASE_SSL_CA: '-----BEGIN CERTIFICATE-----\\ncertificate-data\\n-----END CERTIFICATE-----',
    })

    assert.equal(config.ssl.rejectUnauthorized, true)
    assert.match(config.ssl.ca, /\ncertificate-data\n/)
  })

  it('rejects disabled TLS in production', () => {
    assert.throws(
      () => createDatabaseConfig({ NODE_ENV: 'production', DATABASE_URL: databaseUrl, DATABASE_SSL: 'disable' }),
      /DATABASE_SSL cannot be disabled in production/,
    )
  })
})
