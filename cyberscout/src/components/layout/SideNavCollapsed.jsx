import { NavLink, useNavigate } from 'react-router-dom'
import CLILogo from '../CLILogo'
import { useAppStore } from '../../store/useAppStore'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/courses', icon: 'school', label: 'Courses' },
  { to: '/ai-tutor', icon: 'smart_toy', label: 'AI Tutor' },
  { to: '/live-classes', icon: 'video_chat', label: 'Live Classes' },
  { to: '/leaderboard', icon: 'leaderboard', label: 'Leaderboard' },
  { to: '/achievements', icon: 'military_tech', label: 'Achievements' },
]

const linkClass = ({ isActive }) =>
  `p-2 rounded-lg transition-colors ${
    isActive ? 'bg-violet-50 text-violet-600' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
  }`

export default function SideNavCollapsed() {
  const { logout } = useAppStore()
  const navigate = useNavigate()

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 border-r border-slate-100 bg-white flex flex-col items-center py-6 z-50 shadow-sm">
      <div className="mb-8">
        <CLILogo variant="mark" size={32} />
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} title={label} className={linkClass}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </NavLink>
        ))}
      </nav>
      <div className="flex flex-col gap-4">
        <NavLink to="/settings" title="Settings" className={linkClass}>
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </NavLink>
        <button
          title="Sign Out"
          onClick={() => { logout(); navigate('/login') }}
          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
        </button>
      </div>
    </aside>
  )
}
