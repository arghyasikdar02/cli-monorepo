import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import { api } from '../../lib/api'

function courseUrl(course) {
  return `/courses/${course.categorySlug || 'cybersecurity'}/${course.slug}`
}

function authHrefForCourse(course) {
  return `/auth?mode=login&redirect=${encodeURIComponent(`/learn/courses/${course.id}`)}`
}

export default function PublicCoursesPage() {
  const { categorySlug } = useParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = categorySlug ? 'Cybersecurity Courses | Cyber Lab IN' : 'Courses | Cyber Lab IN'
    api.publicCourses()
      .then(({ courses }) => {
        setCourses(courses)
        setError('')
      })
      .catch(err => setError(err.message || 'Unable to load courses'))
      .finally(() => setLoading(false))
  }, [categorySlug])

  const visibleCourses = useMemo(() => {
    if (!categorySlug) return courses
    return courses.filter(course => course.categorySlug === categorySlug)
  }, [categorySlug, courses])

  if (!loading && categorySlug && courses.some(course => course.id === categorySlug)) {
    return <Navigate to={`/learn/courses/${categorySlug}`} replace />
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/"><CLILogo variant="full" tone="light" size={150} /></Link>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
            <Link to="/about" className="hover:text-slate-950">About</Link>
            <Link to="/blog" className="hover:text-slate-950">Blog</Link>
            <Link to="/login" className="rounded-lg bg-slate-950 px-4 py-2.5 text-white">Login</Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <nav className="mb-10 flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link to="/" className="font-semibold text-slate-700">Home</Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">Courses</span>
          {categorySlug && (
            <>
              <span>/</span>
              <span>Cybersecurity</span>
            </>
          )}
        </nav>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Cyber Lab IN Courses</p>
            <h1 className="mt-4 font-space-grotesk text-4xl font-black tracking-tight sm:text-6xl">
              Practical cybersecurity courses, built around real practice.
            </h1>
          </div>
          <p className="text-lg leading-8 text-slate-600">
            Browse beginner-friendly online cybersecurity training with guided labs, phishing analysis, web security basics, defensive workflows, and certificate-ready learning.
          </p>
        </section>

        {loading && <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">Loading courses from the database...</div>}
        {error && <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>}

        {!loading && !error && (
          <section className="mt-12 grid gap-5 md:grid-cols-2">
            {visibleCourses.map(course => (
              <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                <div className="flex flex-wrap gap-2">
                  {[course.level, course.duration, course.mode, course.credential].filter(Boolean).map(item => (
                    <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item}</span>
                  ))}
                </div>
                <h2 className="mt-5 font-space-grotesk text-2xl font-black">{course.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{course.description}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link to={courseUrl(course)} className="inline-flex justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white">
                    View Course
                  </Link>
                  <Link to={authHrefForCourse(course)} className="inline-flex justify-center rounded-lg border border-slate-200 px-5 py-3 text-sm font-bold text-slate-900">
                    Start Learning
                  </Link>
                </div>
              </article>
            ))}
            {!visibleCourses.length && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">No published courses are available in this category yet.</div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
