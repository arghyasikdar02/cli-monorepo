import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { api, API_BASE } from '../../lib/api'
import AuthFrame, { GoogleMark } from '../../components/site/AuthFrame'
import SiteIcon from '../../components/ui/SiteIcon'


function safeRedirect(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return ''
  return value
}

export default function SignUpPage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const { setSession } = useAppStore()
  const navigate = useNavigate()
  const redirectTarget = safeRedirect(searchParams.get('redirect'))
  const loginHref = `/auth?mode=login${redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ''}`

  const handleGoogleAuth = () => {
    if (!googleEnabled) {
      setError('Google sign-in is unavailable right now. Create your account with email and password instead.')
      return
    }
    const query = redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''
    window.location.href = `${API_BASE}/api/auth/google${query}`
  }

  useEffect(() => {
    document.title = 'Create an Account | Cyber Lab IN'
    let active = true
    api.authConfig()
      .then(({ googleEnabled }) => {
        if (active) setGoogleEnabled(Boolean(googleEnabled))
      })
      .catch(() => {
        if (active) setGoogleEnabled(false)
      })
    return () => {
      active = false
    }
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError("Passwords don't match")
      return
    }
    if (form.password.length < 12) {
      setError('Use at least 12 characters. A short passphrase is acceptable.')
      return
    }
    setLoading(true)
    try {
      const { user, redirectTo } = await api.register(form.name, form.email, form.password)
      setSession(user)
      navigate(redirectTarget || redirectTo || '/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame eyebrow="Learner registration" title="Create your Cyber Lab IN account" description="Register for learner access, then enrol in a published course to open its lessons, materials and guided practice." footer={<><span>Already have an account?</span><Link to={loginHref}>Log in</Link><Link to="/">Back to website</Link></>}>
      <div className="auth-form-heading"><p className="site-eyebrow">Create account</p><h2>Register as a learner</h2><p>Use your email and a strong password, or continue with Google when it is configured.</p></div>
      {error && <div className="auth-alert" role="alert"><SiteIcon name="error" /><span>{error}</span></div>}
      <button type="button" onClick={handleGoogleAuth} className="auth-google-button"><GoogleMark />Continue with Google</button>
      <div className="auth-divider"><span>or create with email</span></div>
      <form onSubmit={handleSubmit} className="auth-form-fields">
        <label><span>Full name</span><input type="text" value={form.name} onChange={set('name')} required autoComplete="name" /></label>
        <label><span>Email address</span><input type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
        <label><span>Password</span><input type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" aria-describedby="password-help" /></label>
        <p id="password-help" className="auth-field-help">Use at least 12 characters. A short passphrase is acceptable.</p>
        <label><span>Confirm password</span><input type="password" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" /></label>
        <button type="submit" disabled={loading} className="auth-submit-button">{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthFrame>
  )
}
