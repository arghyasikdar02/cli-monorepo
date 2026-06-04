import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'

function safeRedirect(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return ''
  return value
}

export default function OAuthCallbackPage() {
  const [params] = useSearchParams()
  const { loginWithToken } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')
    const redirectTarget = safeRedirect(params.get('redirect'))

    if (error || !token) {
      navigate('/login?error=oauth_failed', { replace: true })
      return
    }

    localStorage.setItem('cyberlab_token', token)
    api.me()
      .then(({ user }) => {
        loginWithToken(token, user)
        navigate(redirectTarget || '/dashboard', { replace: true })
      })
      .catch(() => {
        localStorage.removeItem('cyberlab_token')
        navigate('/login?error=oauth_failed', { replace: true })
      })
  }, [loginWithToken, navigate, params])

  return (
    <div className="h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-3">
        <span className="material-symbols-outlined text-4xl text-secondary animate-spin">refresh</span>
        <p className="font-space-grotesk text-sm text-on-surface-variant">Completing authentication...</p>
      </div>
    </div>
  )
}
