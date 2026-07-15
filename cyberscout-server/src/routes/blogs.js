import { Router } from 'express'
import { getPublishedBlogBySlug, listPublishedBlogs } from '../db/repositories.js'

const router = Router()

router.get('/', async (_req, res) => {
  res.json({ blogs: await listPublishedBlogs() })
})

router.get('/:slug', async (req, res) => {
  const blog = await getPublishedBlogBySlug(req.params.slug)
  if (!blog) return res.status(404).json({ error: 'Blog not found' })
  res.json({ blog })
})

export default router
