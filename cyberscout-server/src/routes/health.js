import { Router } from 'express'
import { checkDatabaseConnection } from '../db/index.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    await checkDatabaseConnection()
    res.json({ ok: true, status: 'ok', service: 'cyberlabin-api', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ ok: false, status: 'unavailable', service: 'cyberlabin-api', timestamp: new Date().toISOString() })
  }
})

export default router
