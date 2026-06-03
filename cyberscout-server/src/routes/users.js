import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { assignRole, findById, listUsers, publicUser, suspendUser, updateUser, VALID_ROLES } from '../store/users.js'
import { recordAudit } from '../store/platformStore.js'
import { pick, requireFields } from '../lib/validation.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole('admin', 'super_admin', 'support'))

router.get('/', (_req, res) => {
  res.json({ users: listUsers(), roles: VALID_ROLES })
})

router.get('/:userId', (req, res) => {
  const user = findById(req.params.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
})

router.patch('/:userId', (req, res) => {
  const updates = pick(req.body, ['name', 'email', 'status', 'rank', 'xp', 'level', 'isPro'])
  const user = updateUser(req.params.userId, updates)
  if (!user) return res.status(404).json({ error: 'User not found' })
  recordAudit('user.update', req.user.id, 'user', user.id, updates)
  res.json({ user: publicUser(user) })
})

router.patch('/:userId/suspend', (req, res) => {
  const user = suspendUser(req.params.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  recordAudit('user.suspend', req.user.id, 'user', user.id, {})
  res.json({ user: publicUser(user) })
})

router.patch('/:userId/role', (req, res) => {
  const error = requireFields(req.body, ['role'])
  if (error) return res.status(400).json({ error })
  const user = assignRole(req.params.userId, req.body.role)
  if (!user) return res.status(400).json({ error: 'Invalid user or role' })
  recordAudit('user.assign_role', req.user.id, 'user', user.id, { role: req.body.role })
  res.json({ user: publicUser(user) })
})

export default router
