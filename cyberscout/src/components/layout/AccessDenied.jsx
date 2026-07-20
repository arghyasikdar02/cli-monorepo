import { useNavigate } from 'react-router-dom'
import CLILogo from '../CLILogo'
import SiteIcon from '../ui/SiteIcon'
import { api } from '../../lib/api'
import { dashboardPathForUser } from '../../lib/roles'
import { useAppStore } from '../../store/useAppStore'

export default function AccessDenied({ loginPath }) {
  const { user, logout } = useAppStore()
  const navigate = useNavigate()
  const dashboardPath = dashboardPathForUser(user)

  const switchAccount = async () => {
    await api.logout().catch(() => {})
    logout()
    navigate(loginPath, { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-xl border border-slate-200 bg-white p-8 shadow-card" aria-labelledby="access-denied-title">
        <CLILogo variant="full" tone="light" size={154} />
        <div className="mt-8 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-700" aria-hidden="true">
          <SiteIcon name="lock" size={22} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-red-700">403 access denied</p>
        <h1 id="access-denied-title" className="mt-2 font-space-grotesk text-2xl font-black text-slate-950">This dashboard is not assigned to your role</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Your account is signed in, but it does not have permission to open this dashboard.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {dashboardPath && <button type="button" onClick={() => navigate(dashboardPath, { replace: true })} className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">Open my dashboard</button>}
          <button type="button" onClick={switchAccount} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800">Sign in with another account</button>
        </div>
      </section>
    </main>
  )
}
