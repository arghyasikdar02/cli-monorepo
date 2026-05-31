import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import CLILogo from '../../components/CLILogo'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setError('Google sign-in failed. Please try again.')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api.login(email, password)
      loginWithToken(token, user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <section className="hidden lg:flex w-5/12 bg-primary-container flex-col justify-between p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(rgba(167,139,250,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-container/10 rounded-full blur-[120px]" />

        <div className="relative z-10">
          <div className="mb-12">
            <CLILogo variant="mark" size={48} className="brightness-0 invert" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-secondary-container rounded-full animate-pulse" />
              <span className="font-space-grotesk text-[11px] font-bold text-secondary-container tracking-widest uppercase">
                ENCRYPTED SESSION
              </span>
            </div>
            <h1 className="font-space-grotesk text-[32px] font-bold text-white leading-tight mb-4">
              Master the Craft of Digital Defense
            </h1>
            <p className="text-on-primary-container text-base">
              Enter the academy portal to continue your elite cybersecurity training.
            </p>
          </div>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
          <p className="font-space-grotesk text-sm text-on-primary-container">
            Join 2,400+ active security analysts today.
          </p>
        </div>

        <div className="absolute top-1/2 -right-24 -translate-y-1/2 opacity-5">
          <span className="material-symbols-outlined text-[400px] text-white">lock</span>
        </div>
      </section>

      <main className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden text-center mb-8">
            <CLILogo variant="full" size={24} className="mx-auto mb-2" />
          </div>

          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-card p-8">
            <div className="text-center mb-7">
              <div className="w-11 h-11 bg-surface rounded-full flex items-center justify-center mx-auto mb-3 border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary">key</span>
              </div>
              <h3 className="font-space-grotesk text-xl font-semibold text-primary">Secure Access</h3>
              <p className="text-sm text-on-surface-variant mt-1">Verify your identity to proceed</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => { window.location.href = `${API_URL}/api/auth/google` }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-outline-variant hover:bg-slate-50 transition-colors rounded-lg mb-5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-on-surface text-sm font-medium">Sign in with Google</span>
            </button>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 font-space-grotesk text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  or use credentials
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-space-grotesk text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Academic Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="name@cyberscout.edu"
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-outline"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-space-grotesk text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Access Token
                  </label>
                  <button type="button" className="font-space-grotesk text-xs text-secondary hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-outline"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-outline transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPw ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-lg font-space-grotesk font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Establish Session'}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-6 pt-5 border-t border-outline-variant/20">
              New recruit?{' '}
              <Link to="/signup" className="text-secondary font-semibold hover:underline">
                Apply for Enrollment
              </Link>
            </p>
          </div>

          <p className="text-center font-space-grotesk text-xs text-outline flex items-center justify-center gap-1.5 mt-6">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            AES-256 Bit Encryption Protocol Active
          </p>
        </div>
      </main>
    </div>
  )
}
