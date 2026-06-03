import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireRole } from '../middleware/access.js'
import { userHasRole } from '../store/users.js'
import { addQuizQuestion, createQuiz, getQuizById, hasActiveEnrollment, listQuizzesByCourse, submitQuizAttempt, updateCourseProgress } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const quizRoles = ['admin', 'super_admin', 'instructor', 'support']

function canAccessQuiz(user, quiz) {
  if (!quiz) return false
  return userHasRole(user, quizRoles) || hasActiveEnrollment(user.id, quiz.courseId)
}

router.use(requireAuth)

router.post('/', requireRole(...quizRoles), (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ quiz: createQuiz(req.body, req.user.id) })
})

router.post('/:quizId/questions', requireRole(...quizRoles), (req, res) => {
  const error = requireFields(req.body, ['prompt', 'choices', 'answer'])
  if (error) return res.status(400).json({ error })
  const question = addQuizQuestion(req.params.quizId, req.body, req.user.id)
  if (!question) return res.status(404).json({ error: 'Quiz not found' })
  res.status(201).json({ question })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: quizRoles }), (req, res) => {
  const safeQuizzes = listQuizzesByCourse(req.params.courseId).map(quiz => ({
    ...quiz,
    questions: quiz.questions.map(({ answer, ...safeQuestion }) => safeQuestion),
  }))
  res.json({ quizzes: safeQuizzes })
})

router.post('/:quizId/attempts', (req, res) => {
  const quiz = getQuizById(req.params.quizId)
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
  if (!canAccessQuiz(req.user, quiz)) return res.status(403).json({ error: 'Quiz access denied' })
  const attempt = submitQuizAttempt(quiz.id, req.user.id, req.body.answers || {})
  updateCourseProgress(req.user.id, quiz.courseId, { quizProgress: attempt.score })
  res.json({ attempt })
})

export default router
