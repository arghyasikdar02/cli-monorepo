import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireRole } from '../middleware/access.js'
import { issueCertificate, listCertificates, verifyCertificate } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()

router.get('/verify/:code', (req, res) => {
  const certificate = verifyCertificate(req.params.code)
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' })
  res.json({ certificate })
})

router.use(requireAuth)

router.post('/', requireRole('admin', 'super_admin', 'instructor'), (req, res) => {
  const error = requireFields(req.body, ['userId', 'courseId'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ certificate: issueCertificate(req.body, req.user.id) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), (req, res) => {
  const userId = req.query.userId || req.user.id
  res.json({ certificates: listCertificates({ userId, courseId: req.params.courseId }) })
})

router.get('/me', (req, res) => {
  res.json({ certificates: listCertificates({ userId: req.user.id }) })
})

export default router
