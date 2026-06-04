import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import authRouter, { setupPassport } from './routes/auth.js'
import aiRouter from './routes/ai.js'
import analyticsRouter from './routes/analytics.js'
import assignmentsRouter from './routes/assignments.js'
import auditRouter from './routes/audit.js'
import certificatesRouter from './routes/certificates.js'
import coursesRouter from './routes/courses.js'
import dashboardsRouter from './routes/dashboards.js'
import documentsRouter from './routes/documents.js'
import enrollmentsRouter from './routes/enrollments.js'
import healthRouter from './routes/health.js'
import labsRouter from './routes/labs.js'
import leaderboardsRouter from './routes/leaderboards.js'
import leadsRouter from './routes/leads.js'
import liveClassesRouter from './routes/liveClasses.js'
import paymentsRouter from './routes/payments.js'
import progressRouter from './routes/progress.js'
import quizzesRouter from './routes/quizzes.js'
import usersRouter from './routes/users.js'
import blogsRouter from './routes/blogs.js'
import visitorsRouter from './routes/visitors.js'
import videosRouter from './routes/videos.js'
import webhooksRouter from './routes/webhooks.js'

const PORT = process.env.PORT || 3001
const corsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export function createApp() {
  const app = express()
  app.set('trust proxy', 1)
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || corsOrigins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  }))
  app.use(express.json())
  app.use(cookieParser())
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/courses/public') || req.path.startsWith('/api/blogs')) {
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
      return next()
    }
    if (req.path.startsWith('/api/health')) return next()
    res.set('Cache-Control', 'no-store')
    return next()
  })
  setupPassport()
  app.use(passport.initialize())
  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/courses', coursesRouter)
  app.use('/api/blogs', blogsRouter)
  app.use('/api/visitors', visitorsRouter)
  app.use('/api/enrollments', enrollmentsRouter)
  app.use('/api/live-classes', liveClassesRouter)
  app.use('/api/videos', videosRouter)
  app.use('/api/documents', documentsRouter)
  app.use('/api/labs', labsRouter)
  app.use('/api/quizzes', quizzesRouter)
  app.use('/api/assignments', assignmentsRouter)
  app.use('/api/progress', progressRouter)
  app.use('/api/leaderboards', leaderboardsRouter)
  app.use('/api/certificates', certificatesRouter)
  app.use('/api/ai', aiRouter)
  app.use('/api/leads', leadsRouter)
  app.use('/api/analytics', analyticsRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/webhooks', webhooksRouter)
  app.use('/api/audit', auditRouter)
  app.use('/api/dashboards', dashboardsRouter)
  return app
}

export const app = createApp()

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`cyberscout-server running on :${PORT}`))
}
