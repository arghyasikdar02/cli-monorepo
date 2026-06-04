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

router.get('/student', (req, res) => {
  res.json({ dashboard: getStudentDashboard(req.user.id) })
})

router.get('/admin', requireDashboardRole('admin'), (_req, res) => {
  const analytics = getAdminAnalytics()
  res.json({
    dashboard: {
      analytics,
      users: listUsers(),
      courses: listCourses(),
      enrollments: listAllEnrollments(),
      payments: [],
      liveClasses: [],
      auditLogs: getAuditLogs().slice(0, 30),
    },
  })
})

router.get('/instructor', requireDashboardRole('instructor'), (req, res) => {
  res.json({ dashboard: getInstructorDashboard(req.user.id) })
})

router.get('/marketing', requireDashboardRole('marketing'), (_req, res) => {
  res.json({ dashboard: getSalesDashboard() })
})

router.get('/sales', requireDashboardRole('marketing'), (_req, res) => {
  res.json({ dashboard: getSalesDashboard() })
})

router.get('/ops', requireDashboardRole('ops'), (_req, res) => {
  res.json({ dashboard: getOpsDashboard() })
})

export default router
