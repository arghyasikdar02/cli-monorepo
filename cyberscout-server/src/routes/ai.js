import { Router } from 'express'
import { requireAuth, requireCourseAccess } from '../middleware/access.js'
import { addAiMessage, createAiSession, getAiMessages, getAiUsage, listAiSessions, listKnowledgeBaseDocuments, mockAiReply } from '../store/platformStore.js'
import { requireFields } from '../lib/validation.js'

const router = Router()
const AI_USAGE_LIMIT = Number(process.env.AI_DAILY_LIMIT || 20)

router.use(requireAuth)

router.get('/courses/:courseId/knowledge-base', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), (req, res) => {
  res.json({ documents: listKnowledgeBaseDocuments(req.params.courseId) })
})

router.get('/courses/:courseId/sessions', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), (req, res) => {
  res.json({ sessions: listAiSessions(req.user.id, req.params.courseId), usage: getAiUsage(req.user.id, req.params.courseId), limit: AI_USAGE_LIMIT })
})

router.post('/courses/:courseId/sessions', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), (req, res) => {
  res.status(201).json({ session: createAiSession(req.user.id, req.params.courseId, req.body.title || 'New chat') })
})

router.get('/courses/:courseId/sessions/:sessionId/messages', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), (req, res) => {
  res.json({ messages: getAiMessages(req.params.sessionId, req.user.id, req.params.courseId) })
})

router.post('/courses/:courseId/chat', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), (req, res) => {
  const error = requireFields(req.body, ['message'])
  if (error) return res.status(400).json({ error })
  const usage = getAiUsage(req.user.id, req.params.courseId)
  if (usage >= AI_USAGE_LIMIT) return res.status(429).json({ error: 'AI usage limit reached for this course' })
  const sessionId = req.body.sessionId || createAiSession(req.user.id, req.params.courseId, 'Course chat').id
  const userMessage = addAiMessage(sessionId, req.user.id, req.params.courseId, 'user', req.body.message)
  const assistantMessage = addAiMessage(sessionId, req.user.id, req.params.courseId, 'assistant', mockAiReply(req.params.courseId, req.body.message))
  res.json({ sessionId, messages: [userMessage, assistantMessage], usage: usage + 1, limit: AI_USAGE_LIMIT })
})

export default router
