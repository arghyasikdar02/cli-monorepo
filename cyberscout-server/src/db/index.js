import pg from 'pg'
import { databaseConfig } from './config.js'

const { Pool } = pg

export const databaseEngine = 'postgresql'
export { databaseConfig }
export const pool = new Pool(databaseConfig)

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
