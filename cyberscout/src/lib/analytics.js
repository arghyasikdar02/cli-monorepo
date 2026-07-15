import { api } from './api'
import { readCookieConsent } from './consent'

function analyticsAllowed() {
  return Boolean(readCookieConsent()?.analytics)
}

export function trackEvent(event, properties = {}) {
  if (!analyticsAllowed()) return
  api.trackEvent(event, properties).catch(() => {})
}
