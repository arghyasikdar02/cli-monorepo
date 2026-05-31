import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import CLILogo from '../../components/CLILogo'

export default function SignUpPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginWithToken } = useAppStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError("Passwords don't match")
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { token, user } = await api.register(form.name, form.email, form.password)
      loginWithToken(token, user)
      navigate('/getting-started')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <section className="hidden lg:flex w-5/12 bg-primary-container flex-col justify-between p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(rgba(167,139,250,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10">
          <div className="mb-12">
            <CLILogo variant="mark" size={48} className="brightness-0 invert" />
          </div>
          <h1 className="font-space-grotesk text-[32px] font-bold text-white leading-tight mb-4">
            Begin Your Security Journey
          </h1>
          <p className="text-on-primary-container text-base">
            Join 2,400+ security professionals. Hands-on labs, AI tutoring, and real-world scenarios.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[['50+', 'Security Courses'], ['2.4k+', 'Students'], ['28', 'Achievements'], ['100%', 'Hands-On']].map(([num, label]) => (
            <div key={label} className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="font-space-grotesk text-2xl font-black text-white">{num}</p>
              <p className="text-on-primary-container text-xs">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-card p-8">
            <div className="text-center mb-7">
              <div className="w-11 h-11 bg-surface rounded-full flex items-center justify-center mx-auto mb-3 border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary">person_add</span>
              </div>
              <h3 className="font-space-grotesk text-xl font-semibold text-primary">Create Account</h3>
              <p className="text-sm text-on-surface-variant mt-1">Join the academy today</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { k: 'name', label: 'Full Name', type: 'text', ph: 'John Doe' },
                { k: 'email', label: 'Email Address', type: 'email', ph: 'john@example.com' },
                { k: 'password', label: 'Password', type: 'password', ph: '••••••••' },
                { k: 'confirm', label: 'Confirm Password', type: 'password', ph: '••••••••' },
              ].map(({ k, label, type, ph }) => (
                <div key={k}>
                  <label className="block font-space-grotesk text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[k]}
                    onChange={set(k)}
                    required
                    placeholder={ph}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-outline"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-lg font-space-grotesk font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Enlist Now'}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-6 pt-5 border-t border-outline-variant/20">
              Already enlisted?{' '}
              <Link to="/login" className="text-secondary font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
