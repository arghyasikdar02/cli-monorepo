import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { useFocusTrap } from '../../hooks/useFocusTrap'

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
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)

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
        className="cookie-settings-button"
      >
        Cookie settings
      </button>
    )
  }

  return (
    <div className="cookie-consent-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title" ref={panelRef}>
      <div className="cookie-consent-grid">
        <div>
          <h2 id="cookie-consent-title">Cookie preferences</h2>
          <p>
            Necessary cookies keep login, security, and visitor counting working. Analytics and marketing cookies are optional and only used if you opt in.
          </p>
          <div className="cookie-consent-options">
            {[
              ['necessary', 'Necessary', true],
              ['analytics', 'Analytics', false],
              ['marketing', 'Marketing', false],
            ].map(([key, label, locked]) => (
              <label key={key}>
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(draft[key])}
                  disabled={locked}
                  onChange={event => setDraft(value => ({ ...value, [key]: event.target.checked }))}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="cookie-consent-actions">
          <button
            type="button"
            onClick={() => save({ necessary: true, analytics: true, marketing: true })}
            className="is-primary"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => save(draft)}
            className="is-secondary"
          >
            Save choices
          </button>
          <button
            type="button"
            onClick={() => save(defaultConsent)}
            className="is-text"
          >
            Necessary only
          </button>
        </div>
      </div>
    </div>
  )
}
