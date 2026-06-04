import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireRole } from '../middleware/access.js'
import { userHasRole } from '../db/repositories.js'
import { createAssignment, getAssignmentById, hasActiveEnrollment, listAssignmentsByCourse, reviewAssignment, submitAssignment } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const assignmentRoles = ['admin', 'super_admin', 'instructor', 'support']

function canAccessAssignment(user, assignment) {
  if (!assignment) return false
  return userHasRole(user, assignmentRoles) || hasActiveEnrollment(user.id, assignment.courseId)
}

router.use(requireAuth)

router.post('/', requireRole(...assignmentRoles), (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ assignment: createAssignment(req.body, req.user.id) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: assignmentRoles }), (req, res) => {
  res.json({ assignments: listAssignmentsByCourse(req.params.courseId) })
})

router.post('/:assignmentId/submissions', (req, res) => {
  const error = requireFields(req.body, ['content'])
  if (error) return res.status(400).json({ error })
  const assignment = getAssignmentById(req.params.assignmentId)
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' })
  if (!canAccessAssignment(req.user, assignment)) return res.status(403).json({ error: 'Assignment access denied' })
  res.status(201).json({ submission: submitAssignment(assignment.id, req.user.id, req.body.content) })
})

router.patch('/submissions/:submissionId/review', requireRole(...assignmentRoles), (req, res) => {
  const submission = reviewAssignment(req.params.submissionId, req.user.id, req.body)
  if (!submission) return res.status(404).json({ error: 'Submission not found' })
  res.json({ submission })
})

export default router
