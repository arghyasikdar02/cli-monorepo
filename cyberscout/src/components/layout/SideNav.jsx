import { NavLink, useNavigate } from 'react-router-dom'
import CLILogo from '../CLILogo'
import { useAppStore } from '../../store/useAppStore'

const mainNav = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/courses', icon: 'school', label: 'Courses' },
  { to: '/ai-tutor', icon: 'smart_toy', label: 'AI Tutor' },
  { to: '/live-classes', icon: 'video_chat', label: 'Live Classes' },
  { to: '/leaderboard', icon: 'leaderboard', label: 'Leaderboard' },
  { to: '/achievements', icon: 'military_tech', label: 'Achievements' },
]

const utilityNav = [
  { to: '/downloads', icon: 'download', label: 'Downloads' },
  { to: '/subscription', icon: 'workspace_premium', label: 'Subscription' },
  { to: '/notifications', icon: 'notifications', label: 'Notifications' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
  { to: '/help', icon: 'help', label: 'Help Center' },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-space-grotesk tracking-tight transition-colors ${
    isActive
      ? 'text-violet-600 font-semibold bg-violet-50/50 border-r-4 border-violet-500 rounded-r-none'
      : 'text-slate-500 hover:bg-slate-100'
  }`

export default function SideNav() {
  const { logout } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-slate-200 bg-slate-50 flex flex-col py-6 z-50">
      <div className="px-5 mb-8">
        <CLILogo variant="mark" size={96} />
        <p className="font-space-grotesk text-[10px] font-bold tracking-[0.2em] uppercase mt-2 text-slate-800">
          CYBER LAB{' '}
          <span className="bg-gradient-to-r from-sky-400 to-violet-600 bg-clip-text text-transparent">IN</span>
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {mainNav.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="pt-4 pb-2 px-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utility</p>
        </div>

        {utilityNav.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pt-4 border-t border-slate-200 space-y-0.5">
        <NavLink to="/profile" className={linkClass}>
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
          <span>Profile</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium font-space-grotesk tracking-tight text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
