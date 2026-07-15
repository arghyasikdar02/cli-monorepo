import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireCourseManager, requireRole } from '../middleware/access.js'
import { createAssignment, getAssignmentById, getAssignmentSubmission, hasActiveEnrollment, isInstructorAssigned, listAssignmentsByCourse, reviewAssignment, submitAssignment, userHasRole } from '../db/repositories.js'
import { assertDecision, canManageCourse } from '../services/authorization.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const assignmentReadRoles = ['admin', 'super_admin', 'support']
const assignmentRoles = [...assignmentReadRoles, 'instructor']

async function canAccessAssignment(user, assignment) {
  if (!assignment) return false
  return userHasRole(user, assignmentReadRoles) || await isInstructorAssigned(user.id, assignment.courseId) || await hasActiveEnrollment(user.id, assignment.courseId)
}

async function requireSubmissionManager(req, res, next) {
  const submission = await getAssignmentSubmission(req.params.submissionId)
  if (!submission) return res.status(404).json({ error: 'Submission not found' })
  const decision = await canManageCourse(req.user, submission.courseId)
  if (assertDecision(decision, res)) return
  return next()
}

router.use(requireAuth)

router.post('/', requireRole(...assignmentRoles), requireCourseManager, async (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ assignment: await createAssignment(req.body, req.user.id) })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: assignmentReadRoles }), async (req, res) => {
  res.json({ assignments: await listAssignmentsByCourse(req.params.courseId) })
})

router.post('/:assignmentId/submissions', async (req, res) => {
  const error = requireFields(req.body, ['content'])
  if (error) return res.status(400).json({ error })
  const assignment = await getAssignmentById(req.params.assignmentId)
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' })
  if (!await canAccessAssignment(req.user, assignment)) return res.status(403).json({ error: 'Assignment access denied' })
  res.status(201).json({ submission: await submitAssignment(assignment.id, req.user.id, req.body.content) })
})

router.patch('/submissions/:submissionId/review', requireRole(...assignmentRoles), requireSubmissionManager, async (req, res) => {
  const submission = await reviewAssignment(req.params.submissionId, req.user.id, req.body)
  if (!submission) return res.status(404).json({ error: 'Submission not found' })
  res.json({ submission })
})

export default router
