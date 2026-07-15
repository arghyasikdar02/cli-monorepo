import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireCourseManager, requireRole } from '../middleware/access.js'
import { createAssignment, getAssignmentById, getAssignmentSubmission, hasActiveEnrollment, isInstructorAssigned, listAssignmentsByCourse, reviewAssignment, submitAssignment, userHasRole } from '../db/repositories.js'
import { assertDecision, canManageCourse } from '../services/authorization.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const assignmentReadRoles = ['admin', 'super_admin', 'support']
const assignmentRoles = [...assignmentReadRoles, 'instructor']

function canAccessAssignment(user, assignment) {
  if (!assignment) return false
  return userHasRole(user, assignmentReadRoles) || isInstructorAssigned(user.id, assignment.courseId) || hasActiveEnrollment(user.id, assignment.courseId)
}

function requireSubmissionManager(req, res, next) {
  const submission = getAssignmentSubmission(req.params.submissionId)
  if (!submission) return res.status(404).json({ error: 'Submission not found' })
  const decision = canManageCourse(req.user, submission.courseId)
  if (assertDecision(decision, res)) return
  return next()
}

router.use(requireAuth)

router.post('/', requireRole(...assignmentRoles), requireCourseManager, (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ assignment: createAssignment(req.body, req.user.id) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: assignmentReadRoles }), (req, res) => {
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

router.patch('/submissions/:submissionId/review', requireRole(...assignmentRoles), requireSubmissionManager, (req, res) => {
  const submission = reviewAssignment(req.params.submissionId, req.user.id, req.body)
  if (!submission) return res.status(404).json({ error: 'Submission not found' })
  res.json({ submission })
})

export default router
