import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import { api } from '../../lib/api'

const categories = [
  'Beginner Cybersecurity',
  'Ethical Hacking',
  'Web Security',
  'SOC & Defensive Security',
  'Digital Forensics',
  'Cloud Security',
  'Career Guidance',
]

function formatDate(value) {
  if (!value) return 'Date pending'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''
  const filteredBlogs = activeCategory ? blogs.filter(blog => blog.category === activeCategory) : blogs

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
          Cyber Lab IN resources explain cybersecurity concepts for beginners and connect each guide to relevant courses, learning paths, hands-on labs and defensive security practice.
        </p>
        <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-3">
          <Link to="/courses" className="rounded-xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm hover:text-sky-800">Explore online cybersecurity courses</Link>
          <Link to="/learning-paths" className="rounded-xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm hover:text-sky-800">Choose a cybersecurity learning path</Link>
          <Link to="/courses/cybersecurity/cyber-security-essentials" className="rounded-xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm hover:text-sky-800">Start with Cyber Security Essentials</Link>
        </div>
        <section className="mt-10" aria-label="Blog categories">
          <h2 className="font-space-grotesk text-xl font-black">Categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/blog" className={`rounded-full border px-4 py-2 text-sm font-bold ${!activeCategory ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-800'}`}>
              All resources
            </Link>
            {categories.map(category => (
              <Link
                key={category}
                to={`/blog?category=${encodeURIComponent(category)}`}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${activeCategory === category ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-800'}`}
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
        {loading && <div className="mt-10 rounded-2xl border border-slate-200 p-8 text-slate-500">Loading published posts...</div>}
        {error && <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>}
        {!loading && !error && (
          <section className="mt-12 grid gap-5 md:grid-cols-2">
            {filteredBlogs.map(blog => (
              <article key={blog.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{blog.category || 'Cybersecurity Guide'}</p>
                <h2 className="font-space-grotesk text-2xl font-black">{blog.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{blog.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-500">
                  <span>By {blog.authorName || 'Cyber Lab IN'}</span>
                  <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                </div>
                <Link to={`/blog/${blog.slug}`} className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white">
                  Read guide
                </Link>
              </article>
            ))}
            {filteredBlogs.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-sm font-bold text-slate-600">
                No published guides in this category yet. New resources will appear here after editorial review.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
