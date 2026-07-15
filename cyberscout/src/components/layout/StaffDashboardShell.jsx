import { Link, useNavigate } from 'react-router-dom'
import CLILogo from '../CLILogo'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import AuthenticatedIconFont from './AuthenticatedIconFont'

export default function StaffDashboardShell({ title, subtitle, children, loginPath }) {
  const { user, logout } = useAppStore()
  const navigate = useNavigate()

  const signOut = async () => {
    await api.logout().catch(() => {})
    logout()
    navigate(loginPath, { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AuthenticatedIconFont />
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center">
            <CLILogo variant="full" tone="light" size={150} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name || 'Cyber Lab IN'}</p>
              <p className="text-xs text-slate-500">{(user?.roles || [user?.role]).filter(Boolean).join(', ')}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Cyber Lab IN</p>
          <h1 className="mt-2 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  )
}
