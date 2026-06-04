import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const STORAGE_KEY = 'cli_cookie_consent'
const defaultConsent = { necessary: true, analytics: false, marketing: false }

function readConsent() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return stored ? { ...defaultConsent, ...stored } : null
  } catch {
    return null
  }
}

export default function CookieConsent() {
  const [consent, setConsent] = useState(readConsent)
  const [open, setOpen] = useState(!readConsent())
  const [draft, setDraft] = useState(readConsent() || defaultConsent)

  useEffect(() => {
    const current = consent || defaultConsent
    api.trackVisitor({ analytics: current.analytics, marketing: current.marketing }).catch(() => {})
  }, [consent])

  const save = async (nextConsent) => {
    const normalized = { ...defaultConsent, ...nextConsent, necessary: true }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    setConsent(normalized)
    setDraft(normalized)
    setOpen(false)
    try {
      await api.saveCookieConsent(normalized)
    } catch {
      // Consent is still respected locally even if the network is unavailable.
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[70] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
      >
        Cookie settings
      </button>
    )
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-[0_24px_90px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-900 dark:text-white sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="font-space-grotesk text-base font-bold">Cookie preferences</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Necessary cookies keep login, security, and visitor counting working. Analytics and marketing cookies are optional and only used if you opt in.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              ['necessary', 'Necessary', true],
              ['analytics', 'Analytics', false],
              ['marketing', 'Marketing', false],
            ].map(([key, label, locked]) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-white/5">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(draft[key])}
                  disabled={locked}
                  onChange={event => setDraft(value => ({ ...value, [key]: event.target.checked }))}
                  className="h-4 w-4 accent-sky-600"
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-44">
          <button
            type="button"
            onClick={() => save({ necessary: true, analytics: true, marketing: true })}
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => save(draft)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 dark:border-white/10 dark:text-white"
          >
            Save choices
          </button>
          <button
            type="button"
            onClick={() => save(defaultConsent)}
            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Necessary only
          </button>
        </div>
      </div>
    </div>
  )
}
