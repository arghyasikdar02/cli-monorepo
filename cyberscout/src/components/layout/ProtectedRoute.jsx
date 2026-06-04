import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token, logout } = useAppStore()
  const location = useLocation()
  if (!isAuthenticated || isTokenExpired(token)) {
    if (isAuthenticated) logout()
    const redirect = `${location.pathname}${location.search || ''}`
    return <Navigate to={`/auth?mode=login&redirect=${encodeURIComponent(redirect)}`} replace />
  }
  return children
}
