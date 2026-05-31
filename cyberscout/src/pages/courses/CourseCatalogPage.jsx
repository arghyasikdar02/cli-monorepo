import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import CourseCard from '../../components/ui/CourseCard'
import { courses } from '../../data/courses'

const CATEGORIES = ['All', 'Network Defense', 'Penetration Testing', 'Cloud Security', 'Application Security', 'Incident Response']
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function CourseCatalogPage() {
  const [searchParams] = useSearchParams()
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All Levels')
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  const filtered = useMemo(() =>
    courses.filter(c => {
      if (category !== 'All' && c.category !== category) return false
      if (level !== 'All Levels' && c.level !== level) return false
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }),
    [category, level, search]
  )

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-space-grotesk text-3xl font-black text-primary mb-1">Course Catalog</h1>
          <p className="text-on-surface-variant">Master cybersecurity from fundamentals to expert-level techniques.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 flex-1 max-w-xs">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
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
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
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

        {/* Results count */}
        <p className="text-sm text-on-surface-variant mb-5">
          Showing <span className="font-bold text-on-surface">{filtered.length}</span> courses
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl text-slate-300 block mb-3">search_off</span>
            <p className="font-space-grotesk font-semibold">No courses found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
