import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import {
  COOKIE_CONSENT_KEY,
  COOKIE_SETTINGS_EVENT,
  defaultCookieConsent,
  persistCookieConsent,
  readCookieConsent,
} from '../../lib/consent'

export default function CookieConsent() {
  const [initialConsent] = useState(readCookieConsent)
  const [consent, setConsent] = useState(initialConsent)
  const [open, setOpen] = useState(!initialConsent)
  const [draft, setDraft] = useState(initialConsent || defaultCookieConsent)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)

  useEffect(() => {
    if (consent) {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
    }
    const current = consent || defaultCookieConsent
    api.trackVisitor({ analytics: current.analytics, marketing: current.marketing }).catch(() => {})
  }, [consent])

  useEffect(() => {
    const reopenSettings = () => {
      setDraft(consent || defaultCookieConsent)
      setOpen(true)
    }
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopenSettings)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopenSettings)
  }, [consent])

  const save = async (nextConsent) => {
    const normalized = persistCookieConsent(nextConsent)
    setConsent(normalized)
    setDraft(normalized)
    setOpen(false)
    try {
      await api.saveCookieConsent(normalized)
    } catch {
      // Consent is still respected locally even if the network is unavailable.
    }
  }

  if (!open) return null

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
            onClick={() => save(defaultCookieConsent)}
            className="is-text"
          >
            Necessary only
          </button>
        </div>
      </div>
    </div>
  )
}
