import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import { api } from '../../lib/api'

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Cybersecurity Blog | Cyber Lab IN'
    api.blogs()
      .then(({ blogs }) => setBlogs(blogs))
      .catch(err => setError(err.message || 'Unable to load blog posts'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/"><CLILogo variant="full" tone="light" size={150} /></Link>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
            <Link to="/courses" className="hover:text-slate-950">Courses</Link>
            <Link to="/about" className="hover:text-slate-950">About</Link>
            <Link to="/login" className="rounded-lg bg-slate-950 px-4 py-2.5 text-white">Login</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Cyber Lab IN Blog</p>
        <h1 className="mt-4 max-w-4xl font-space-grotesk text-4xl font-black tracking-tight sm:text-6xl">
          Beginner-friendly cybersecurity guides.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Clear explanations, practical security habits, and internal links into hands-on Cyber Lab IN training.
        </p>
        {loading && <div className="mt-10 rounded-2xl border border-slate-200 p-8 text-slate-500">Loading published posts...</div>}
        {error && <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>}
        {!loading && !error && (
          <section className="mt-12 grid gap-5 md:grid-cols-2">
            {blogs.map(blog => (
              <article key={blog.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                <h2 className="font-space-grotesk text-2xl font-black">{blog.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{blog.excerpt}</p>
                <Link to={`/blog/${blog.slug}`} className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white">
                  Read guide
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
