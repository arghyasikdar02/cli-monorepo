import { Router } from 'express'
import { requireAuth, requireCourseAccess, requireCourseManager, requireRole } from '../middleware/access.js'
import { addQuizQuestion, createQuiz, getQuizById, hasActiveEnrollment, isInstructorAssigned, listQuizzesByCourse, submitQuizAttempt, updateCourseProgress, userHasRole } from '../db/repositories.js'
import { assertDecision, canManageCourse } from '../services/authorization.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const quizReadRoles = ['admin', 'super_admin', 'support']
const quizRoles = [...quizReadRoles, 'instructor']

async function canAccessQuiz(user, quiz) {
  if (!quiz) return false
  return userHasRole(user, quizReadRoles) || await isInstructorAssigned(user.id, quiz.courseId) || await hasActiveEnrollment(user.id, quiz.courseId)
}

async function requireQuizManager(req, res, next) {
  const quiz = await getQuizById(req.params.quizId)
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
  const decision = await canManageCourse(req.user, quiz.courseId)
  if (assertDecision(decision, res)) return
  req.quiz = quiz
  return next()
}

router.use(requireAuth)

router.post('/', requireRole(...quizRoles), requireCourseManager, async (req, res) => {
  const error = requireFields(req.body, ['courseId', 'title'])
  if (error) return res.status(400).json({ error })
  res.status(201).json({ quiz: await createQuiz(req.body, req.user.id) })
})

router.post('/:quizId/questions', requireRole(...quizRoles), requireQuizManager, async (req, res) => {
  const error = requireFields(req.body, ['prompt', 'choices', 'answer'])
  if (error) return res.status(400).json({ error })
  const question = await addQuizQuestion(req.params.quizId, req.body, req.user.id)
  if (!question) return res.status(404).json({ error: 'Quiz not found' })
  res.status(201).json({ question })
})

router.get('/course/:courseId', requireCourseAccess({ allowRoles: quizReadRoles }), async (req, res) => {
  const safeQuizzes = (await listQuizzesByCourse(req.params.courseId)).map(quiz => ({
    ...quiz,
    questions: quiz.questions.map(({ answer, ...safeQuestion }) => safeQuestion),
  }))
  res.json({ quizzes: safeQuizzes })
})

router.get('/:quizId', async (req, res) => {
  const quiz = await getQuizById(req.params.quizId)
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
  if (!await canAccessQuiz(req.user, quiz)) return res.status(403).json({ error: 'Quiz access denied' })
  res.json({ quiz: { ...quiz, questions: quiz.questions.map(({ answer, ...question }) => question) } })
})

router.post('/:quizId/attempts', async (req, res) => {
  const quiz = await getQuizById(req.params.quizId)
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
  if (!await canAccessQuiz(req.user, quiz)) return res.status(403).json({ error: 'Quiz access denied' })
  const attempt = await submitQuizAttempt(quiz.id, req.user.id, req.body.answers || {})
  await updateCourseProgress(req.user.id, quiz.courseId, { quizProgress: attempt.score })
  res.json({ attempt })
})

export default router
