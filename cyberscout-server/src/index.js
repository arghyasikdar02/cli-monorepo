import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
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
import { seedBaselineData } from './db/seed.js'
import { validateEnvironment } from './lib/environment.js'
import { apiLimiter, csrfProtection, requestContext } from './middleware/security.js'

const PORT = process.env.PORT || 3001
const configuredCorsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const localPreviewOrigins = process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:4173', 'http://127.0.0.1:4173']
const corsOrigins = [...new Set([...configuredCorsOrigins, ...localPreviewOrigins])]

export function createApp() {
  validateEnvironment()
  const app = express()
  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.use(requestContext)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' },
    strictTransportSecurity: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  }))
  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
    next()
  })
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || corsOrigins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  }))
  app.use(express.json({
    limit: process.env.JSON_BODY_LIMIT || '256kb',
    strict: true,
    verify: (req, _res, buffer) => {
      if (req.path.includes('/webhooks/razorpay')) req.rawBody = Buffer.from(buffer)
    },
  }))
  app.use(cookieParser())
  app.use(csrfProtection)
  app.use('/api', apiLimiter)
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
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }))
  app.use((err, req, res, _next) => {
    const summary = { requestId: req.requestId, method: req.method, path: req.path, message: err.message }
    if (process.env.NODE_ENV === 'production') console.error(summary)
    else console.error(err)
    res.status(err.status || 500).json({ error: 'Internal server error', requestId: req.requestId })
  })
  return app
}

export const app = createApp()

if (process.env.NODE_ENV !== 'test') {
  seedBaselineData({ force: process.env.SEED_BASELINE_FORCE === '1' })
    .then(() => {
      app.listen(PORT, () => console.log(`cyberscout-server running on :${PORT}`))
    })
    .catch(error => {
      console.error('Failed to prepare database before server start:', error)
      process.exit(1)
    })
}
