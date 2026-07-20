import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { hasAnyRole } from '../../lib/roles'
import AccessDenied from './AccessDenied'

export default function RoleProtectedRoute({ children, roles, loginPath }) {
  const { isAuthenticated, authStatus, user, hydrateSession } = useAppStore()
  const location = useLocation()
  const redirect = `${location.pathname}${location.search || ''}`
  const loginTarget = `${loginPath}${loginPath.includes('?') ? '&' : '?'}redirect=${encodeURIComponent(redirect)}`

  useEffect(() => {
    if (authStatus === 'idle') hydrateSession()
  }, [authStatus, hydrateSession])

  if (authStatus === 'idle' || authStatus === 'loading') {
    return <div className="route-loading" role="status" aria-live="polite"><span className="route-loading-indicator" aria-hidden="true" /><span>Checking dashboard access</span></div>
  }
  if (!isAuthenticated) {
    return <Navigate to={loginTarget} replace />
  }
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />
  if (!hasAnyRole(user, roles)) return <AccessDenied loginPath={loginPath} />
  return children
}
