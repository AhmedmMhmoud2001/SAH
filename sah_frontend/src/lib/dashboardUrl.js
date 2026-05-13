function readInjectedDashboardBase() {
  if (typeof window === 'undefined') return ''
  const w = window.__SAH_DASHBOARD_BASE_URL__
  return typeof w === 'string' ? w.trim().replace(/\/$/, '') : ''
}

/** Public dashboard origin (no trailing slash). Empty if not configured. */
export function getDashboardBaseUrl() {
  const injected = readInjectedDashboardBase()
  if (injected) return injected
  const raw = import.meta.env.VITE_DASHBOARD_BASE_URL
  if (typeof raw === 'string' && raw.trim()) return raw.trim().replace(/\/$/, '')
  return ''
}
