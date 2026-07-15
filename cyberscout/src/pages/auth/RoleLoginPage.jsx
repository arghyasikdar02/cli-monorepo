import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthFrame from '../../components/site/AuthFrame'
import { api } from '../../lib/api'
import { useAppStore } from '../../store/useAppStore'
import SiteIcon from '../../components/ui/SiteIcon'

function hasAllowedRole(user, allowedRoles) {
  const roles = user?.roles || [user?.role]
  return roles.some(role => allowedRoles.includes(role))
}

function safeRedirect(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return ''
  return value
}

export default function RoleLoginPage({ title, purpose, allowedRoles, redirectTo }) {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, user, setSession, logout } = useAppStore()
  const navigate = useNavigate()
  const redirectTarget = safeRedirect(searchParams.get('redirect'))

  useEffect(() => {
    document.title = `${title} | Cyber Lab IN`
    if (isAuthenticated && hasAllowedRole(user, allowedRoles)) navigate(redirectTarget || redirectTo, { replace: true })
  }, [allowedRoles, isAuthenticated, navigate, redirectTarget, redirectTo, title, user])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.login(email, password)
      if (!hasAllowedRole(result.user, allowedRoles)) {
        await api.logout().catch(() => {})
        logout()
        setError('This account does not have access to this dashboard.')
        return
      }
      setSession(result.user)
      navigate(redirectTarget || redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame eyebrow="Role-scoped access" title={title} description={purpose} footer={<><Link to={`/auth?mode=login${redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ''}`}>Student login</Link><Link to="/">Back to website</Link></>}>
      <div className="auth-form-heading"><p className="site-eyebrow">Authorised dashboard</p><h2>{title}</h2><p>Use an account assigned to the required role. Access is verified again by the backend.</p></div>
      {error && <div className="auth-alert" role="alert"><SiteIcon name="error" /><span>{error}</span></div>}
      <form onSubmit={submit} className="auth-form-fields">
        <label><span>Email address</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="name@cyberlabin.com" /></label>
        <label><span>Password</span><div className="auth-password-field"><input type={showPw ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required autoComplete="current-password" /><button type="button" onClick={() => setShowPw(value => !value)} aria-label={showPw ? 'Hide password' : 'Show password'}><SiteIcon name={showPw ? 'visibility_off' : 'visibility'} /></button></div></label>
        <button type="submit" disabled={loading} className="auth-submit-button">{loading ? 'Checking access...' : 'Enter dashboard'}</button>
      </form>
    </AuthFrame>
  )
}
