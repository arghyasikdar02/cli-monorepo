import { Router } from 'express'
import { requireAuth, requireDashboardRole } from '../middleware/access.js'
import {
  getAdminAnalytics,
  getAuditLogs,
  getInstructorDashboard,
  getOpsDashboard,
  getSalesDashboard,
  getStudentDashboard,
  listAllEnrollments,
  listCourses,
  listUsers,
} from '../db/repositories.js'

const router = Router()

router.use(requireAuth)

router.get('/student', requireDashboardRole('student'), async (req, res) => {
  res.json({ dashboard: await getStudentDashboard(req.user.id) })
})

router.get('/admin', requireDashboardRole('admin'), async (_req, res) => {
  const [analytics, users, courses, enrollments, auditLogs] = await Promise.all([
    getAdminAnalytics(), listUsers(), listCourses(), listAllEnrollments(), getAuditLogs(),
  ])
  res.json({
    dashboard: {
      analytics,
      users,
      courses,
      enrollments,
      payments: [],
      liveClasses: [],
      auditLogs: auditLogs.slice(0, 30),
    },
  })
})

router.get('/instructor', requireDashboardRole('instructor'), async (req, res) => {
  res.json({ dashboard: await getInstructorDashboard(req.user.id) })
})

router.get('/marketing', requireDashboardRole('marketing'), async (_req, res) => {
  res.json({ dashboard: await getSalesDashboard() })
})

router.get('/sales', requireDashboardRole('marketing'), async (_req, res) => {
  res.json({ dashboard: await getSalesDashboard() })
})

router.get('/ops', requireDashboardRole('ops'), async (_req, res) => {
  res.json({ dashboard: await getOpsDashboard() })
})

export default router
