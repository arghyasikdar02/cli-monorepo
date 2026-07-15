import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import AuthFrame, { GoogleMark } from '../../components/site/AuthFrame'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const authErrors = {
  oauth_failed: 'Google sign-in failed. Please try again.',
  oauth_unconfigured: 'Google sign-in is not configured for this environment. Use email access or add Google OAuth credentials.',
}

function safeRedirect(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return ''
  return value
}

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(authErrors[searchParams.get('error')] ?? '')
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const { loginWithToken } = useAppStore()
  const navigate = useNavigate()
  const redirectTarget = safeRedirect(searchParams.get('redirect'))
  const signupHref = `/auth?mode=signup${redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ''}`

  const handleGoogleAuth = () => {
    if (!googleEnabled) {
      setError(authErrors.oauth_unconfigured)
      return
    }
    const query = redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''
    window.location.href = `${API_URL}/api/auth/google${query}`
  }

  useEffect(() => {
    document.title = 'Login | Cyber Lab IN'
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user, redirectTo } = await api.login(email, password)
      loginWithToken(token, user)
      navigate(redirectTarget || redirectTo || '/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame eyebrow="Learner portal" title="Continue your cybersecurity learning" description="Log in to access enrolled courses, guided labs, protected materials and recorded progress." footer={<><span>New to Cyber Lab IN?</span><Link to={signupHref}>Create an account</Link><Link to="/">Back to website</Link></>}>
      <div className="auth-form-heading"><p className="site-eyebrow">Login</p><h2>Access your account</h2><p>Use your email and password, or continue with Google when it is configured.</p></div>
      {error && <div className="auth-alert" role="alert"><span className="material-symbols-outlined" aria-hidden="true">error</span><span>{error}</span></div>}
      <button type="button" onClick={handleGoogleAuth} className="auth-google-button"><GoogleMark />Sign in with Google</button>
      <div className="auth-divider"><span>or use email</span></div>
      <form onSubmit={handleSubmit} className="auth-form-fields">
        <label><span>Email address</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="name@example.com" /></label>
        <label><span>Password</span><div className="auth-password-field"><input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /><button type="button" onClick={() => setShowPw(value => !value)} aria-label={showPw ? 'Hide password' : 'Show password'}><span className="material-symbols-outlined" aria-hidden="true">{showPw ? 'visibility_off' : 'visibility'}</span></button></div></label>
        <button type="submit" disabled={loading} className="auth-submit-button">{loading ? 'Logging in...' : 'Log in'}</button>
      </form>
      <p className="auth-support-note">Need account help? <Link to="/contact">Contact Cyber Lab IN</Link>.</p>
    </AuthFrame>
  )
}
