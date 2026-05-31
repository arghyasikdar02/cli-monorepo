import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import passport from 'passport'
import authRouter, { setupPassport } from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
setupPassport()
app.use(passport.initialize())
app.use('/api/auth', authRouter)

app.listen(PORT, () => console.log(`cyberscout-server running on :${PORT}`))
