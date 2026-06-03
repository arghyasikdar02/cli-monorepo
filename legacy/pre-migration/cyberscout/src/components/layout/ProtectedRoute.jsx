import { Navigate } from 'react-router-dom'
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
  if (!isAuthenticated || isTokenExpired(token)) {
    if (isAuthenticated) logout()
    return <Navigate to="/login" replace />
  }
  return children
}
