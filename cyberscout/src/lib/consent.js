export const COOKIE_CONSENT_KEY = 'cli_cookie_consent'
export const COOKIE_CONSENT_VERSION = 1
export const COOKIE_SETTINGS_EVENT = 'cli:open-cookie-settings'

export const defaultCookieConsent = Object.freeze({
  version: COOKIE_CONSENT_VERSION,
  completed: false,
  necessary: true,
  analytics: false,
  marketing: false,
})

function normalizeConsent(value) {
  if (!value || typeof value !== 'object') return null

  const isLegacyChoice = value.version == null
    && (typeof value.analytics === 'boolean' || typeof value.marketing === 'boolean')
  const isCurrentChoice = value.version === COOKIE_CONSENT_VERSION && value.completed === true

  if (!isLegacyChoice && !isCurrentChoice) return null

  return {
    version: COOKIE_CONSENT_VERSION,
    completed: true,
    necessary: true,
    analytics: Boolean(value.analytics),
    marketing: Boolean(value.marketing),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
  }
}

export function readCookieConsent() {
  if (typeof window === 'undefined') return null

  try {
    return normalizeConsent(JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_KEY) || 'null'))
  } catch {
    return null
  }
}

export function persistCookieConsent(preferences) {
  const consent = {
    version: COOKIE_CONSENT_VERSION,
    completed: true,
    necessary: true,
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    updatedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
  return consent
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))
}
