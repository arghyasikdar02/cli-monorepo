import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

export default function TopAppBar() {
  const { user, unreadCount } = useAppStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/learn/courses?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
        <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
        <input
          className="bg-transparent outline-none text-sm w-56 placeholder:text-slate-400"
          placeholder="Search labs or courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="flex items-center gap-5">
        {user && (
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            <span className="text-sm font-bold font-space-grotesk">{user.streakDays} Day Streak</span>
          </div>
        )}

        <Link to="/notifications" className="relative text-slate-500 hover:text-violet-600 transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-error ring-2 ring-white" />
          )}
        </Link>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          {!user?.isPro && (
            <Link
              to="/subscription"
              className="bg-primary-container text-white px-4 py-1.5 rounded-lg text-sm font-bold font-space-grotesk hover:opacity-90 transition-opacity"
            >
              Upgrade Pro
            </Link>
          )}
          <Link to="/profile">
            <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-sm font-bold text-primary border-2 border-white shadow-sm select-none">
              {user?.name?.[0] ?? 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
