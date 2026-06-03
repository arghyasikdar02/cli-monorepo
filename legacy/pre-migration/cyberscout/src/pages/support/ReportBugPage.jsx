import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'

const BUG_TYPES = ['UI / Visual bug', 'Feature not working', 'Performance issue', 'Video / Audio problem', 'Billing issue', 'Other']

export default function ReportBugPage() {
  const [form, setForm] = useState({ type: '', title: '', desc: '', steps: '' })
  const [submitted, setSubmitted] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  if (submitted) return (
    <AppShell>
      <div className="max-w-[540px] mx-auto px-8 py-16 text-center">
        <span className="material-symbols-outlined text-[64px] text-green-500 block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <h1 className="font-space-grotesk text-2xl font-black text-primary mb-2">Report Submitted!</h1>
        <p className="text-on-surface-variant mb-6">Thanks for the report. We'll investigate and update you within 48 hours.</p>
        <Link to="/help" className="inline-block px-6 py-3 bg-primary text-white font-space-grotesk font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
          Back to Help Center
        </Link>
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      <div className="max-w-[640px] mx-auto px-8 py-8">
        <Link to="/help" className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Help Center
        </Link>
        <h1 className="font-space-grotesk text-2xl font-black text-primary mb-1">Report a Bug</h1>
        <p className="text-on-surface-variant mb-8 text-sm">Help us improve CyberScout by reporting issues you encounter.</p>

        <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="space-y-5">
          <div>
            <label className="block font-space-grotesk text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Bug Type</label>
            <select value={form.type} onChange={set('type')} required
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm outline-none focus:border-secondary transition-all">
              <option value="">Select a category...</option>
              {BUG_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {[
            { k: 'title', label: 'Title', ph: 'Brief summary of the issue', multi: false },
            { k: 'desc', label: 'Description', ph: 'What happened? What did you expect to happen?', multi: true },
            { k: 'steps', label: 'Steps to Reproduce', ph: '1. Go to...\n2. Click on...\n3. Observe...', multi: true },
          ].map(({ k, label, ph, multi }) => (
            <div key={k}>
              <label className="block font-space-grotesk text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{label}</label>
              {multi ? (
                <textarea value={form[k]} onChange={set(k)} placeholder={ph} rows={4} required
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm outline-none focus:border-secondary transition-all resize-none" />
              ) : (
                <input type="text" value={form[k]} onChange={set(k)} placeholder={ph} required
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm outline-none focus:border-secondary transition-all" />
              )}
            </div>
          ))}

          <button type="submit"
            className="w-full py-4 bg-primary text-white font-space-grotesk font-bold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10">
            Submit Report
          </button>
        </form>
      </div>
    </AppShell>
  )
}
