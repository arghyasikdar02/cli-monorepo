import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthFrame from '../../components/site/AuthFrame'
import SiteIcon from '../../components/ui/SiteIcon'
import { api } from '../../lib/api'
import { useAppStore } from '../../store/useAppStore'
import { dashboardPathForUser } from '../../lib/roles'

function passwordIssue(password) {
  if (password.length < 14) return 'Use at least 14 characters.'
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return 'Include uppercase, lowercase, number and symbol characters.'
  }
  return ''
}

export default function RequiredPasswordChangePage() {
  const { user, setSession } = useAppStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = field => event => setForm(value => ({ ...value, [field]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    setError('')
    const validationError = passwordIssue(form.newPassword)
    if (validationError) return setError(validationError)
    if (form.newPassword !== form.confirmPassword) return setError('The new passwords do not match.')
    if (form.currentPassword === form.newPassword) return setError('Choose a password different from the temporary password.')
    setLoading(true)
    try {
      const result = await api.changePassword(form.currentPassword, form.newPassword)
      setSession(result.user)
      navigate(result.redirectTo || dashboardPathForUser(result.user) || '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Your password could not be changed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      eyebrow="Account security"
      title="Set your own password"
      description={`Welcome${user?.name ? `, ${user.name}` : ''}. Replace the temporary password before continuing to your instructor account.`}
    >
      <div className="auth-form-heading">
        <p className="site-eyebrow">Required step</p>
        <h2>Change temporary password</h2>
        <p>Use at least 14 characters with uppercase, lowercase, number and symbol characters.</p>
      </div>
      {error && <div className="auth-alert" role="alert"><SiteIcon name="error" /><span>{error}</span></div>}
      <form onSubmit={submit} className="auth-form-fields">
        <label><span>Current temporary password</span><input type={show ? 'text' : 'password'} value={form.currentPassword} onChange={update('currentPassword')} required autoComplete="current-password" /></label>
        <label><span>New password</span><input type={show ? 'text' : 'password'} value={form.newPassword} onChange={update('newPassword')} required minLength="14" autoComplete="new-password" /></label>
        <label><span>Confirm new password</span><input type={show ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} required minLength="14" autoComplete="new-password" /></label>
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={show} onChange={event => setShow(event.target.checked)} className="h-4 w-4" />Show passwords</label>
        <button type="submit" disabled={loading} className="auth-submit-button">{loading ? 'Updating password...' : 'Set password and continue'}</button>
      </form>
    </AuthFrame>
  )
}
