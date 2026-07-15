import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

export default function TopAppBar({ onMenuOpen = null }) {
  const { user } = useAppStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/learn/courses?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="app-top-bar sticky top-0 z-40 h-16 bg-white/95 border-b border-slate-200 flex items-center justify-between px-8">
      <div className="app-top-bar-start">
        {onMenuOpen && <button type="button" className="app-mobile-nav-button" onClick={onMenuOpen} aria-label="Open learner navigation"><span className="material-symbols-outlined">menu</span></button>}
        <label className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
        <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
        <span className="sr-only">Search courses</span>
        <input
          className="app-course-search bg-transparent outline-none text-sm w-56 placeholder:text-slate-400"
          placeholder="Search courses"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        /></label>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/notifications" className="relative text-slate-500 hover:text-violet-600 transition-colors" aria-label="Course notifications"><span className="material-symbols-outlined text-[22px]">notifications</span></Link>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <Link to="/profile" aria-label="Open profile">
            <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-sm font-bold text-primary border-2 border-white shadow-sm select-none">
              {user?.name?.[0] ?? 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
