import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireRole } from '../middleware/access.js'
import { userHasRole } from '../store/users.js'
import { getDocumentById, hasActiveEnrollment, listDocumentsByCourse, logDocumentAccess, registerDocument } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const documentRoles = ['admin', 'super_admin', 'instructor', 'ops', 'lab_creator', 'support']

function canAccessDocument(user, document) {
  if (!document) return false
  return userHasRole(user, documentRoles) || hasActiveEnrollment(user.id, document.courseId)
}

router.use(requireAuth)

router.post('/', requireRole(...documentRoles), (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title', 'storageKey'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ document: registerDocument(req.body, req.user.id) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: documentRoles }), (req, res) => {
  res.json({ documents: listDocumentsByCourse(req.params.courseId).map(({ storageKey, ...safe }) => safe) })
})

router.get('/:documentId/view', (req, res) => {
  const document = getDocumentById(req.params.documentId)
  if (!document) return res.status(404).json({ error: 'Document not found' })
  if (!canAccessDocument(req.user, document)) return res.status(403).json({ error: 'Document access denied' })
  const page = Number(req.query.page || 1)
  logDocumentAccess(document.id, req.user.id, { page, ip: req.ip })
  res.json({
    document: {
      id: document.id,
      courseId: document.courseId,
      title: document.title,
      pageCount: document.pageCount,
    },
    page,
    renderedPage: {
      type: 'protected-page-starter',
      message: 'Production should render this PDF page server-side as an image or canvas-safe page. Raw PDF URLs are intentionally not returned.',
      watermark: `${req.user.email} | ${new Date().toISOString()}`,
    },
  })
})

export default router
