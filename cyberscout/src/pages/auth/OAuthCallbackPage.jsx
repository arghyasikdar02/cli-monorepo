import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

function safeRedirect(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return ''
  return value
}

export default function OAuthCallbackPage() {
  const [params] = useSearchParams()
  const { setSession } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    const error = params.get('error')
    const redirectTarget = safeRedirect(params.get('redirect'))

    if (error) {
      navigate('/login?error=oauth_failed', { replace: true })
      return
    }

    api.me()
      .then(({ user }) => {
        setSession(user)
        navigate(redirectTarget || '/dashboard', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true })
      })
  }, [navigate, params, setSession])

  return (
    <div className="h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-3">
        <span className="oauth-loading-icon"><SiteIcon name="refresh" size={32} /></span>
        <p className="font-space-grotesk text-sm text-on-surface-variant">Completing authentication...</p>
      </div>
    </div>
  )
}
