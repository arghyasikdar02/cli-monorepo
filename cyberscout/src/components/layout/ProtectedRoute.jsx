import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authStatus, hydrateSession } = useAppStore()
  const location = useLocation()

  useEffect(() => {
    if (authStatus === 'idle') hydrateSession()
  }, [authStatus, hydrateSession])

  if (authStatus === 'idle' || authStatus === 'loading') {
    return <div className="route-loading" role="status" aria-live="polite"><span className="route-loading-indicator" aria-hidden="true" /><span>Checking your secure session</span></div>
  }
  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search || ''}`
    return <Navigate to={`/auth?mode=login&redirect=${encodeURIComponent(redirect)}`} replace />
  }
  return children
}
