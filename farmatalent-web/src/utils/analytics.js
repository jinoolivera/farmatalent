const CONSENT_KEY = 'ft_cookie_consent'
const EVENTS_KEY = 'ft_analytics_events'
const MAX_EVENTS = 200

function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.analytics === true
  } catch {
    return false
  }
}

export function trackEvent(name, props = {}) {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return

  const event = {
    name,
    props,
    path: window.location.pathname + window.location.search,
    timestamp: new Date().toISOString(),
  }

  try {
    const current = JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]')
    const next = [...current, event].slice(-MAX_EVENTS)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('ft:analytics-event', { detail: event }))
  } catch {
    // noop
  }
}
