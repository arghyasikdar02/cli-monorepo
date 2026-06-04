import { Router } from 'express'
import { getPublishedBlogBySlug, listPublishedBlogs } from '../db/repositories.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ blogs: listPublishedBlogs() })
})

router.get('/:slug', (req, res) => {
  const blog = getPublishedBlogBySlug(req.params.slug)
  if (!blog) return res.status(404).json({ error: 'Blog not found' })
  res.json({ blog })
})

export default router
