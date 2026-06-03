import { useState } from 'react'
import { api } from '../../lib/api'

export default function LeadCaptureForm({ courseId = null, source = 'website', dark = false, title = 'Talk to Cyber Lab IN' }) {
  const [form, setForm] = useState({ name: '', email: '' })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    setLoading(true)
    try {
      await api.leadCapture({ ...form, courseId, source })
      setForm({ name: '', email: '' })
      setStatus('Thanks. We will follow up soon.')
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
      <p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-500'}`}>Share your email and we will help you choose the right starting point.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={event => setForm(value => ({ ...value, name: event.target.value }))}
          className={`rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-300 ${
            dark ? 'border-white/10 bg-white/10 placeholder:text-slate-400' : 'border-slate-200 bg-slate-50 placeholder:text-slate-400'
          }`}
          placeholder="Name"
          autoComplete="name"
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
