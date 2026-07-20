import { NavLink, useNavigate } from 'react-router-dom'
import CLILogo from '../CLILogo'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import SiteIcon from '../ui/SiteIcon'

const mainNav = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/learn/courses', icon: 'school', label: 'Courses' },
  { to: '/ai-tutor', icon: 'smart_toy', label: 'Cysensei' },
  { to: '/live-classes', icon: 'video_chat', label: 'Live Classes' },
  { to: '/leaderboard', icon: 'leaderboard', label: 'Leaderboard' },
]

const utilityNav = [
  { to: '/downloads', icon: 'download', label: 'Downloads' },
  { to: '/notifications', icon: 'notifications', label: 'Notifications' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
  { to: '/help', icon: 'help', label: 'Help Center' },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-space-grotesk tracking-tight transition-all ${
    isActive
      ? 'text-violet-600 font-semibold bg-white shadow-sm ring-1 ring-slate-200/80'
      : 'text-slate-500 hover:bg-white hover:text-slate-900'
  }`

export default function SideNav({ mobileOpen = false, isMobile = false, onNavigate = () => {} }) {
  const { logout } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await api.logout().catch(() => {})
    logout()
    navigate('/login')
  }

  return (
    <aside className={`app-side-nav fixed left-0 top-0 h-screen w-60 border-r border-slate-200/80 bg-[#f8fafc]/95 backdrop-blur-xl flex flex-col py-6 z-50 ${mobileOpen ? 'is-mobile-open' : ''}`} aria-label="Learner navigation" aria-hidden={isMobile && !mobileOpen} inert={isMobile && !mobileOpen ? true : undefined}>
      <div className="px-5 mb-8">
        <CLILogo variant="full" tone="light" size={156} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {mainNav.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onNavigate}>
            <SiteIcon name={icon} size={20} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="pt-4 pb-2 px-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utility</p>
        </div>

        {utilityNav.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onNavigate}>
            <SiteIcon name={icon} size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pt-4 border-t border-slate-200/80 space-y-0.5">
        <NavLink to="/profile" className={linkClass} onClick={onNavigate}>
          <SiteIcon name="account_circle" size={20} />
          <span>Profile</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium font-space-grotesk tracking-tight text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <SiteIcon name="logout" size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
