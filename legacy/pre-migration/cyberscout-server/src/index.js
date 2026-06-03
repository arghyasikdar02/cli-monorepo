import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import passport from 'passport'
import authRouter, { setupPassport } from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3001
const corsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.set('trust proxy', 1)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || corsOrigins.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())
setupPassport()
app.use(passport.initialize())
app.use('/api/auth', authRouter)

app.listen(PORT, () => console.log(`cyberscout-server running on :${PORT}`))
