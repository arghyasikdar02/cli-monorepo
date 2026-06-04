import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import { api } from '../../lib/api'
import { useAppStore } from '../../store/useAppStore'

function hasAllowedRole(user, allowedRoles) {
  const roles = user?.roles || [user?.role]
  return roles.some(role => allowedRoles.includes(role))
}

export default function RoleLoginPage({ title, purpose, allowedRoles, redirectTo }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, user, loginWithToken, logout } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && hasAllowedRole(user, allowedRoles)) navigate(redirectTo, { replace: true })
  }, [allowedRoles, isAuthenticated, navigate, redirectTo, user])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.login(email, password)
      if (!hasAllowedRole(result.user, allowedRoles)) {
        logout()
        setError('This account does not have access to this dashboard.')
        return
      }
      loginWithToken(result.token, result.user)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-white/10 p-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_30%_10%,rgba(56,189,248,0.20),transparent_32%),radial-gradient(circle_at_70%_0%,rgba(124,58,237,0.20),transparent_34%)]" />
        <div className="relative">
          <CLILogo variant="full" tone="dark" size={180} />
        </div>
        <div className="relative max-w-md">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cyan-100">
            Role-scoped access
          </span>
          <h1 className="mt-6 font-space-grotesk text-4xl font-black leading-tight">{title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">{purpose}</p>
        </div>
        <p className="relative text-sm text-slate-500">Cyber Lab IN secure dashboard access</p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 p-6 text-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <CLILogo variant="full" tone="light" size={170} className="mx-auto" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <div className="mb-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </div>
              <h2 className="font-space-grotesk text-2xl font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{purpose}</p>
            </div>

            {error && (
              <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block font-space-grotesk text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                  placeholder="name@cyberlabin.com"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-space-grotesk text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</span>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(value => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-xl">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-950 px-5 py-3.5 font-space-grotesk font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Checking access...' : 'Enter dashboard'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
              <Link to="/login" className="font-semibold text-violet-700 hover:underline">Student login</Link>
              <Link to="/" className="text-slate-500 hover:text-slate-800">Back to site</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
