import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireCourseManager, requireRole } from '../middleware/access.js'
import { issueCertificate, listCertificates, verifyCertificate } from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'

const router = Router()

router.get('/verify/:code', async (req, res) => {
  const certificate = await verifyCertificate(req.params.code)
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' })
  res.json({ certificate })
})

router.use(requireAuth)

router.post('/', requireRole('admin', 'super_admin', 'instructor'), requireCourseManager, async (req, res) => {
  const error = requireFields(req.body, ['userId', 'courseId'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ certificate: await issueCertificate(req.body, req.user.id) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'support'] }), async (req, res) => {
  const userId = req.query.userId || req.user.id
  res.json({ certificates: await listCertificates({ userId, courseId: req.params.courseId }) })
})

router.get('/me', async (req, res) => {
  res.json({ certificates: await listCertificates({ userId: req.user.id }) })
})

export default router
