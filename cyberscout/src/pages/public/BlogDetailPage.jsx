import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import { api } from '../../lib/api'

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.blog(slug)
      .then(({ blog }) => {
        setBlog(blog)
        setError('')
      })
      .catch(err => setError(err.message || 'Unable to load blog post'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!blog) return
    document.title = blog.metaTitle || `${blog.title} | Cyber Lab IN`
    let meta = document.head.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', blog.metaDescription || blog.excerpt)
  }, [blog])

  const schema = useMemo(() => {
    if (!blog) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt,
      url: `${siteUrl}/blog/${blog.slug}`,
      publisher: { '@type': 'Organization', name: 'Cyber Lab IN', url: siteUrl },
    }
  }, [blog])

  if (loading) return <div className="min-h-screen bg-white p-8 text-slate-600">Loading blog...</div>
  if (error || !blog) return <div className="min-h-screen bg-white p-8 text-red-700">{error || 'Blog not found'}</div>

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/"><CLILogo variant="full" tone="light" size={150} /></Link>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
            <Link to="/courses" className="hover:text-slate-950">Courses</Link>
            <Link to="/blog" className="hover:text-slate-950">Blog</Link>
            <Link to="/login" className="rounded-lg bg-slate-950 px-4 py-2.5 text-white">Login</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Link to="/blog" className="text-sm font-bold text-sky-700 hover:text-sky-900">Back to blog</Link>
        <h1 className="mt-6 font-space-grotesk text-4xl font-black tracking-tight sm:text-6xl">{blog.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{blog.excerpt}</p>
        <article className="mt-10 space-y-6 text-base leading-8 text-slate-700">
          {blog.body.split('\n\n').map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="font-space-grotesk text-xl font-black">Learn by doing</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Build practical confidence with guided labs, phishing analysis, web security basics, and defensive reporting.
          </p>
          <Link to="/courses/cybersecurity/cyber-security-essentials" className="mt-5 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white">
            Explore Cyber Security Essentials
          </Link>
        </section>
      </main>
    </div>
  )
}
