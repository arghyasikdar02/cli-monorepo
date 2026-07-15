import { Router } from 'express'
import { db } from '../db/index.js'

const router = Router()

router.get('/', (_req, res) => {
  try {
    db.prepare('SELECT 1 AS ready').get()
    res.json({ ok: true, status: 'ok', service: 'cyberlabin-api', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ ok: false, status: 'unavailable', service: 'cyberlabin-api', timestamp: new Date().toISOString() })
  }
})

export default router
