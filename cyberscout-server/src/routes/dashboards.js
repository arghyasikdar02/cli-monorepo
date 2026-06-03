import { Router } from 'express'
import { requireAuth, requireDashboardRole } from '../middleware/access.js'
import { listUsers } from '../store/users.js'
import { courses, documentAccessLogs, enrollments, getAdminAnalytics, getInstructorDashboard, getOpsDashboard, getSalesAnalytics, getStudentDashboard, leads, liveClasses, payments, getAuditLogs } from '../store/platformStore.js'

const router = Router()

router.use(requireAuth)

router.get('/student', (req, res) => {
  res.json({ dashboard: getStudentDashboard(req.user.id) })
})

router.get('/admin', requireDashboardRole('admin'), (_req, res) => {
  const analytics = getAdminAnalytics()
  res.json({
    dashboard: {
      analytics: { ...analytics, users: listUsers().length },
      users: listUsers(),
      courses,
      enrollments,
      payments,
      liveClasses,
      auditLogs: getAuditLogs().slice(0, 30),
    },
  })
})

router.get('/instructor', requireDashboardRole('instructor'), (req, res) => {
  res.json({ dashboard: getInstructorDashboard(req.user.id) })
})

router.get('/marketing', requireDashboardRole('marketing'), (_req, res) => {
  res.json({ dashboard: { leads, analytics: getSalesAnalytics() } })
})

router.get('/ops', requireDashboardRole('ops'), (_req, res) => {
  const dashboard = getOpsDashboard()
  res.json({ dashboard: { ...dashboard, documentAccessLogs } })
})

export default router
