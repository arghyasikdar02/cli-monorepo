import { useRef, useState } from 'react'
import { api } from '../../lib/api'
import { trackEvent } from '../../lib/analytics'

const initialForm = { name: '', phone: '', email: '', message: '', website: '' }

function validate(form) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Enter your full name.'
  if (form.phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a valid phone number.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (form.message.trim().length < 5) errors.message = 'Add a short message so we know how to help.'
  return errors
}

export default function LeadCaptureForm({
  courseId = null,
  source = 'landing_form',
  dark = false,
  title = 'Talk to Cyber Lab IN',
  defaultMessage = '',
  compact = false,
  submitLabel = 'Request course details',
  onSuccess,
}) {
  const [form, setForm] = useState({ ...initialForm, message: defaultMessage })
  const [status, setStatus] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const startedAt = useRef(Date.now())
  const startedTracking = useRef(false)

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
    if (!startedTracking.current) {
      startedTracking.current = true
      trackEvent('lead_form_start', { source, course_id: courseId })
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) {
      return
    }
    setLoading(true)
    try {
      await api.leadCapture({ ...form, courseId, source, startedAt: startedAt.current })
      setForm({ ...initialForm, message: defaultMessage })
      setStatus('Thanks. We will follow up soon.')
      trackEvent('lead_form_completion', { source, course_id: courseId })
      startedAt.current = Date.now()
      startedTracking.current = false
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
        <label><span>Name</span><input value={form.name} onChange={event => updateField('name', event.target.value)} required autoComplete="name" maxLength="120" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${source}-name-error` : undefined} />{errors.name && <small id={`${source}-name-error`} className="lead-field-error">{errors.name}</small>}</label>
        <label><span>Phone number</span><input value={form.phone} onChange={event => updateField('phone', event.target.value)} type="tel" required autoComplete="tel" inputMode="tel" maxLength="30" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? `${source}-phone-error` : undefined} />{errors.phone && <small id={`${source}-phone-error`} className="lead-field-error">{errors.phone}</small>}</label>
        <label><span>Email address</span><input value={form.email} onChange={event => updateField('email', event.target.value)} type="email" required autoComplete="email" maxLength="254" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${source}-email-error` : undefined} />{errors.email && <small id={`${source}-email-error`} className="lead-field-error">{errors.email}</small>}</label>
        <label className="lead-form-message"><span>How can we help?</span><textarea value={form.message} onChange={event => updateField('message', event.target.value)} required maxLength="2000" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? `${source}-message-error` : undefined} />{errors.message && <small id={`${source}-message-error`} className="lead-field-error">{errors.message}</small>}</label>
        <label className="lead-form-honeypot" aria-hidden="true"><span>Website</span><input value={form.website} onChange={event => setForm(value => ({ ...value, website: event.target.value }))} tabIndex="-1" autoComplete="off" /></label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="lead-form-submit"
      >
        {loading ? 'Sending request...' : submitLabel}
      </button>
      {status && <p className="lead-form-status" role="status">{status}</p>}
      {error && <p className="lead-form-error" role="alert">{error}</p>}
    </form>
  )
}
