import { api } from './api'

const CONSENT_KEY = 'cli_cookie_consent'

function analyticsAllowed() {
  try {
    return Boolean(JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null')?.analytics)
  } catch {
    return false
  }
}

export function trackEvent(event, properties = {}) {
  if (!analyticsAllowed()) return
  api.trackEvent(event, properties).catch(() => {})
}
