import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { api, API_BASE } from '../../lib/api'
import AuthFrame, { GoogleMark } from '../../components/site/AuthFrame'
import SiteIcon from '../../components/ui/SiteIcon'

const authErrors = {
  oauth_failed: 'Google sign-in failed. Please try again.',
  oauth_state: 'Google sign-in could not be verified. Please start again from this page.',
  oauth_unconfigured: 'Google sign-in is unavailable right now. Use your email and password instead.',
  oauth_cancelled: 'Google sign-in was cancelled.',
  oauth_link_required: 'This email already has a Cyber Lab IN account. Log in with email first, then connect Google from your profile.',
  oauth_forbidden: 'This Google authorization is not available for your account role.',
  account_suspended: 'This account is suspended. Contact Cyber Lab IN support.',
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
  const { setSession } = useAppStore()
  const navigate = useNavigate()
  const redirectTarget = safeRedirect(searchParams.get('redirect'))
  const signupHref = `/auth?mode=signup${redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ''}`

  const handleGoogleAuth = () => {
    if (!googleEnabled) {
      setError(authErrors.oauth_unconfigured)
      return
    }
    const query = redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''
    window.location.href = `${API_BASE}/api/auth/google${query}`
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
      const { user, redirectTo } = await api.login(email, password)
      setSession(user)
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
      {error && <div className="auth-alert" role="alert"><SiteIcon name="error" /><span>{error}</span></div>}
      <button type="button" onClick={handleGoogleAuth} className="auth-google-button"><GoogleMark />Sign in with Google</button>
      <div className="auth-divider"><span>or use email</span></div>
      <form onSubmit={handleSubmit} className="auth-form-fields">
        <label><span>Email address</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="name@example.com" /></label>
        <label><span>Password</span><div className="auth-password-field"><input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /><button type="button" onClick={() => setShowPw(value => !value)} aria-label={showPw ? 'Hide password' : 'Show password'}><SiteIcon name={showPw ? 'visibility_off' : 'visibility'} /></button></div></label>
        <button type="submit" disabled={loading} className="auth-submit-button">{loading ? 'Logging in...' : 'Log in'}</button>
      </form>
      <p className="auth-support-note">Need account help? <Link to="/contact">Contact Cyber Lab IN</Link>.</p>
    </AuthFrame>
  )
}
