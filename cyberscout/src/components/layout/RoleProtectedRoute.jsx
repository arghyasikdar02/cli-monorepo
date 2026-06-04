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

function hasAnyRole(user, allowedRoles) {
  const roles = user?.roles || [user?.role]
  return roles.some(role => allowedRoles.includes(role))
}

export default function RoleProtectedRoute({ children, roles, loginPath }) {
  const { isAuthenticated, token, user, logout } = useAppStore()
  const location = useLocation()
  const redirect = `${location.pathname}${location.search || ''}`
  const loginTarget = `${loginPath}${loginPath.includes('?') ? '&' : '?'}redirect=${encodeURIComponent(redirect)}`
  if (!isAuthenticated || isTokenExpired(token)) {
    if (isAuthenticated) logout()
    return <Navigate to={loginTarget} replace />
  }
  if (!hasAnyRole(user, roles)) return <Navigate to={loginTarget} replace />
  return children
}
