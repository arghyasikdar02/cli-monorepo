import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import CourseCard from '../../components/ui/CourseCard'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

export default function CourseCatalogPage() {
  const [searchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All Levels')
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.publicCourses()
      .then(({ courses }) => {
        if (!active) return
        setCourses(courses)
        setError('')
      })
      .catch(err => {
        if (!active) return
        setError(err.message || 'Unable to load courses')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(courses.map(course => course.category).filter(Boolean)))], [courses])
  const levels = useMemo(() => ['All Levels', ...Array.from(new Set(courses.map(course => course.level).filter(Boolean)))], [courses])

  const filtered = useMemo(() =>
    courses.filter(c => {
      if (category !== 'All' && c.category !== category) return false
      if (level !== 'All Levels' && c.level !== level) return false
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }),
    [courses, category, level, search]
  )

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-space-grotesk text-3xl font-black text-primary mb-1">Course Catalog</h1>
          <p className="text-on-surface-variant">A focused two-course beginner program built from the Basic Course I and II curriculum.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 flex-1 max-w-xs">
            <SiteIcon name="search" size={20} className="text-slate-400" />
            <input
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white outline-none focus:border-secondary"
          >
            {levels.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold font-space-grotesk border transition-all ${
                category === cat
                  ? 'bg-primary-container text-white border-primary-container'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-secondary hover:text-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-card">
            Loading courses...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <p className="text-sm text-on-surface-variant mb-5">
            Showing <span className="font-bold text-on-surface">{filtered.length}</span> courses
          </p>
        )}

        {!loading && !error && filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : !loading && !error ? (
          <div className="text-center py-20 text-on-surface-variant">
            <SiteIcon name="search_off" size={54} className="mx-auto mb-3 text-slate-300" />
            <p className="font-space-grotesk font-semibold">No courses found</p>
            <p className="text-sm mt-1">Try adjusting your filters or check again when courses are published.</p>
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
