/**
 * Fallback when env + injected index script are missing (should not happen after `vite build`).
 */
const PUBLIC_PRODUCTION_ORIGIN = 'https://sah.nodeteam.site'

function isLoopbackHostname(hostname) {
  if (!hostname) return false
  const h = String(hostname).toLowerCase()
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
}

function isLocalApiUrl(url) {
  try {
    return isLoopbackHostname(new URL(url).hostname)
  } catch {
    return false
  }
}

function isBrowserOnLoopbackHost() {
  if (typeof window === 'undefined' || !window.location?.hostname) return false
  return isLoopbackHostname(window.location.hostname)
}

function readInjectedApiUrl() {
  if (typeof window === 'undefined') return ''
  const w = window.__SAH_API_URL__
  return typeof w === 'string' ? w.trim() : ''
}

function readInjectedApiBase() {
  if (typeof window === 'undefined') return ''
  const w = window.__SAH_API_BASE_URL__
  return typeof w === 'string' ? w.trim().replace(/\/$/, '') : ''
}

/**
 * Full API base including `/api` suffix (e.g. https://host/api).
 * Order: index.html inject (build) → Vite env → dev localhost / prod public.
 */
export function getResolvedApiUrl() {
  const prod = import.meta.env.PROD
  const dev = import.meta.env.DEV
  const onLoopbackPage = isBrowserOnLoopbackHost()

  const injected = readInjectedApiUrl()
  if (injected) {
    if (prod && !onLoopbackPage && isLocalApiUrl(injected)) {
      return `${PUBLIC_PRODUCTION_ORIGIN}/api`
    }
    return injected
  }

  const raw = import.meta.env.VITE_API_URL
  const trimmed = typeof raw === 'string' ? raw.trim() : ''

  if (trimmed) {
    if (prod && !onLoopbackPage && isLocalApiUrl(trimmed)) {
      return `${PUBLIC_PRODUCTION_ORIGIN}/api`
    }
    return trimmed
  }

  if (dev) {
    return 'http://localhost:3000/api'
  }
  return `${PUBLIC_PRODUCTION_ORIGIN}/api`
}

/**
 * Backend origin without `/api` (e.g. https://host).
 */
export function getResolvedApiBaseUrl() {
  const prod = import.meta.env.PROD
  const dev = import.meta.env.DEV
  const onLoopbackPage = isBrowserOnLoopbackHost()

  const injected = readInjectedApiBase()
  if (injected) {
    if (prod && !onLoopbackPage && isLocalApiUrl(`${injected}/`)) {
      return PUBLIC_PRODUCTION_ORIGIN
    }
    return injected
  }

  const raw = import.meta.env.VITE_API_BASE_URL
  const trimmed = typeof raw === 'string' ? raw.trim() : ''

  if (trimmed) {
    const normalized = trimmed.replace(/\/$/, '')
    if (prod && !onLoopbackPage && isLocalApiUrl(normalized)) {
      return PUBLIC_PRODUCTION_ORIGIN
    }
    return normalized
  }

  if (dev) {
    return 'http://localhost:3000'
  }
  return PUBLIC_PRODUCTION_ORIGIN
}
