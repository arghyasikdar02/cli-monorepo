import { Router } from 'express'
import { requireAuth, requireCourseAccess } from '../middleware/access.js'
import {
  addAiMessage,
  countAuditActionsSince,
  createAiSession,
  getAiSession,
  listAiMessages,
  listAiSessions,
  listCourseMaterialsForUser,
  recordAudit,
} from '../db/repositories.js'
import { requireFields } from '../lib/validation.js'
import { aiLimiter } from '../middleware/security.js'

const router = Router()
const AI_USAGE_LIMIT = Number(process.env.AI_DAILY_LIMIT || 20)

function startOfTodayIso() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

function buildCourseAnswer(materials, message) {
  const terms = String(message || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(term => term.length > 3)

  const scored = materials
    .map(material => {
      const haystack = `${material.title} ${material.description} ${material.content}`.toLowerCase()
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0)
      return { material, score }
    })
    .sort((a, b) => b.score - a.score)

  const selected = scored.filter(item => item.score > 0).slice(0, 3)
  const grounded = selected.length ? selected : scored.slice(0, 2)

  if (!grounded.length) {
    return {
      refused: true,
      answer: 'I can only answer from enrolled course materials. This course does not have knowledge-base material available yet.',
      citations: [],
    }
  }

  const answer = grounded
    .map(({ material }) => `${material.title}: ${material.content || material.description}`)
    .join('\n\n')

  return {
    refused: selected.length === 0,
    answer: selected.length
      ? answer
      : `I could not find a direct match in this course. The closest course materials are:\n\n${answer}`,
    citations: grounded.map(({ material }) => ({
      id: material.id,
      title: material.title,
      type: material.type,
      courseId: material.courseId,
    })),
  }
}

router.use(requireAuth)

router.get('/courses/:courseId/knowledge-base', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), async (req, res) => {
  const { materials } = await listCourseMaterialsForUser(req.user, req.params.courseId)
  res.json({
    documents: materials.map(material => ({
      id: material.id,
      title: material.title,
      type: material.type,
      isPublic: material.isPublic,
    })),
  })
})

router.get('/courses/:courseId/sessions', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), async (req, res) => {
  const [usage, sessions] = await Promise.all([
    countAuditActionsSince(req.user.id, 'ai.chat', req.params.courseId, startOfTodayIso()),
    listAiSessions(req.user.id, req.params.courseId),
  ])
  res.json({ sessions, usage, limit: AI_USAGE_LIMIT })
})

router.post('/courses/:courseId/sessions', aiLimiter, requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), async (req, res) => {
  res.status(201).json({ session: await createAiSession(req.user.id, req.params.courseId, req.body.title || 'Course chat') })
})

router.get('/courses/:courseId/sessions/:sessionId/messages', requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), async (req, res) => {
  res.json({ messages: await listAiMessages(req.params.sessionId, req.user.id, req.params.courseId) })
})

router.post('/courses/:courseId/chat', aiLimiter, requireCourseAccess({ allowRoles: ['admin', 'super_admin', 'instructor', 'support'] }), async (req, res) => {
  const error = requireFields(req.body, ['message'])
  if (error) return res.status(400).json({ error })
  const usage = await countAuditActionsSince(req.user.id, 'ai.chat', req.params.courseId, startOfTodayIso())
  if (usage >= AI_USAGE_LIMIT) return res.status(429).json({ error: 'AI usage limit reached for this course' })
  const { allowed, materials } = await listCourseMaterialsForUser(req.user, req.params.courseId)
  if (!allowed) return res.status(403).json({ error: 'Active enrollment required for course AI' })
  const result = buildCourseAnswer(materials, req.body.message)
  const session = req.body.sessionId
    ? await getAiSession(req.body.sessionId, req.user.id, req.params.courseId)
    : await createAiSession(req.user.id, req.params.courseId, 'Course chat')
  if (!session) return res.status(404).json({ error: 'AI chat session not found' })
  const userMessage = await addAiMessage(session.id, req.user.id, req.params.courseId, 'user', req.body.message)
  const assistantMessage = await addAiMessage(session.id, req.user.id, req.params.courseId, 'assistant', result.answer, result.citations)
  await recordAudit('ai.chat', req.user.id, 'course', req.params.courseId, {
    refused: result.refused,
    citations: result.citations.map(citation => citation.id),
  })
  res.json({
    sessionId: session.id,
    messages: [userMessage, assistantMessage],
    citations: result.citations,
    refused: result.refused,
    usage: usage + 1,
    limit: AI_USAGE_LIMIT,
  })
})

export default router
