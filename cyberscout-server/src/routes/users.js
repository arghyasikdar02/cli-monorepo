import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/access.js'
import { assignRole, findUserById, listUsers, publicUser, recordAudit, suspendUser, updateUser, VALID_ROLES } from '../db/repositories.js'
import { pick, requireFields } from '../lib/validation.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole('admin', 'super_admin', 'support'))

router.get('/', async (req, res) => {
  res.json({
    users: await listUsers({ role: req.query.role, status: req.query.status, search: req.query.search }),
    roles: VALID_ROLES,
  })
})

router.get('/:userId', async (req, res) => {
  const user = await findUserById(req.params.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
})

router.patch('/:userId', async (req, res) => {
  const updates = pick(req.body, ['name', 'email', 'status', 'rank', 'xp', 'level', 'isPro'])
  const user = await updateUser(req.params.userId, updates)
  if (!user) return res.status(404).json({ error: 'User not found' })
  await recordAudit('user.update', req.user.id, 'user', user.id, updates)
  res.json({ user: publicUser(user) })
})

router.patch('/:userId/suspend', async (req, res) => {
  const user = await suspendUser(req.params.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  await recordAudit('user.suspend', req.user.id, 'user', user.id, {})
  res.json({ user: publicUser(user) })
})

router.patch('/:userId/role', async (req, res) => {
  const error = requireFields(req.body, ['role'])
  if (error) return res.status(400).json({ error })
  const user = await assignRole(req.params.userId, req.body.role)
  if (!user) return res.status(400).json({ error: 'Invalid user or role' })
  await recordAudit('user.assign_role', req.user.id, 'user', user.id, { role: req.body.role })
  res.json({ user: publicUser(user) })
})

export default router
