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
      className={`rounded-2xl border p-5 ${
        dark
          ? 'border-white/10 bg-white/5 text-white'
          : 'border-slate-200 bg-white text-slate-950 shadow-sm'
      }`}
    >
      <h3 className="font-space-grotesk text-lg font-bold">{title}</h3>
      <p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
        Share your details and we will help you choose the right starting point.
      </p>
      <div className={`mt-4 grid gap-3 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <input
          value={form.name}
          onChange={event => setForm(value => ({ ...value, name: event.target.value }))}
          className={`rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-300 ${
            dark ? 'border-white/10 bg-white/10 placeholder:text-slate-400' : 'border-slate-200 bg-slate-50 placeholder:text-slate-400'
          }`}
          placeholder="Name"
          required
          autoComplete="name"
        />
        <input
          value={form.phone}
          onChange={event => setForm(value => ({ ...value, phone: event.target.value }))}
          className={`rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-300 ${
            dark ? 'border-white/10 bg-white/10 placeholder:text-slate-400' : 'border-slate-200 bg-slate-50 placeholder:text-slate-400'
          }`}
          placeholder="Phone number"
          type="tel"
          required
          autoComplete="tel"
        />
        <input
          value={form.email}
          onChange={event => setForm(value => ({ ...value, email: event.target.value }))}
          className={`rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-300 ${
            dark ? 'border-white/10 bg-white/10 placeholder:text-slate-400' : 'border-slate-200 bg-slate-50 placeholder:text-slate-400'
          }`}
          placeholder="Email"
          type="email"
          required
          autoComplete="email"
        />
        <textarea
          value={form.message}
          onChange={event => setForm(value => ({ ...value, message: event.target.value }))}
          className={`min-h-24 rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-300 ${compact ? '' : 'sm:col-span-2'} ${
            dark ? 'border-white/10 bg-white/10 placeholder:text-slate-400' : 'border-slate-200 bg-slate-50 placeholder:text-slate-400'
          }`}
          placeholder="Message"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          dark ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-800'
        }`}
      >
        {loading ? 'Sending...' : 'Request guidance'}
      </button>
      {status && <p className="mt-3 text-sm font-semibold text-emerald-500">{status}</p>}
      {error && <p className="mt-3 text-sm font-semibold text-red-500">{error}</p>}
    </form>
  )
}
