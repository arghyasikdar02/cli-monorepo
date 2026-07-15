import { useState } from 'react'
import { api } from '../../lib/api'

const initialForm = { name: '', phone: '', email: '', message: '' }

function validate(form) {
  if (form.name.trim().length < 2) return 'Enter your name.'
  if (form.phone.replace(/\D/g, '').length < 7) return 'Enter a valid phone number.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid email address.'
  if (form.message.trim().length < 5) return 'Add a short message so we know how to help.'
  return ''
}

export default function LeadCaptureForm({
  courseId = null,
  source = 'landing_form',
  dark = false,
  title = 'Talk to Cyber Lab IN',
  defaultMessage = '',
  compact = false,
  onSuccess,
}) {
  const [form, setForm] = useState({ ...initialForm, message: defaultMessage })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    const validationError = validate(form)
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    try {
      await api.leadCapture({ ...form, courseId, source })
      setForm({ ...initialForm, message: defaultMessage })
      setStatus('Thanks. We will follow up soon.')
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Could not submit lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className={`lead-form ${compact ? 'lead-form-compact' : ''}`}
      data-theme={dark ? 'dark' : 'light'}
    >
      <h3>{title}</h3>
      <p className="lead-form-intro">
        Share your details and we will help you choose the right starting point.
      </p>
      <div className="lead-form-fields">
        <label><span>Name</span><input value={form.name} onChange={event => setForm(value => ({ ...value, name: event.target.value }))} required autoComplete="name" /></label>
        <label><span>Phone number</span><input value={form.phone} onChange={event => setForm(value => ({ ...value, phone: event.target.value }))} type="tel" required autoComplete="tel" inputMode="tel" /></label>
        <label><span>Email address</span><input value={form.email} onChange={event => setForm(value => ({ ...value, email: event.target.value }))} type="email" required autoComplete="email" /></label>
        <label className="lead-form-message"><span>How can we help?</span><textarea value={form.message} onChange={event => setForm(value => ({ ...value, message: event.target.value }))} required /></label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="lead-form-submit"
      >
        {loading ? 'Sending...' : 'Request guidance'}
      </button>
      {status && <p className="lead-form-status" role="status">{status}</p>}
      {error && <p className="lead-form-error" role="alert">{error}</p>}
    </form>
  )
}
