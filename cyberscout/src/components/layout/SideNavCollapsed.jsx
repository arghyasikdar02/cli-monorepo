import { NavLink, useNavigate } from 'react-router-dom'
import CLILogo from '../CLILogo'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import SiteIcon from '../ui/SiteIcon'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/learn/courses', icon: 'school', label: 'Courses' },
  { to: '/ai-tutor', icon: 'smart_toy', label: 'Cysensei' },
  { to: '/live-classes', icon: 'video_chat', label: 'Live Classes' },
  { to: '/leaderboard', icon: 'leaderboard', label: 'Leaderboard' },
]

const linkClass = ({ isActive }) =>
  `p-2 rounded-lg transition-all ${
    isActive ? 'bg-white text-violet-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
  }`

export default function SideNavCollapsed() {
  const { logout } = useAppStore()
  const navigate = useNavigate()

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 border-r border-slate-200/80 bg-[#f8fafc]/95 backdrop-blur-xl flex flex-col items-center py-6 z-50">
      <div className="mb-8">
        <CLILogo variant="mark" tone="light" size={40} />
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} title={label} className={linkClass}>
            <SiteIcon name={icon} size={22} />
          </NavLink>
        ))}
      </nav>
      <div className="flex flex-col gap-4">
        <NavLink to="/settings" title="Settings" className={linkClass}>
          <SiteIcon name="settings" size={22} />
        </NavLink>
        <button
          title="Sign Out"
          aria-label="Sign out"
          onClick={async () => { await api.logout().catch(() => {}); logout(); navigate('/login') }}
          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <SiteIcon name="logout" size={22} />
        </button>
      </div>
    </aside>
  )
}
