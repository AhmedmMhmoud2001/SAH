/**
 * Default public API (no trailing slash). Used when a production build is opened
 * from a public HTTPS host but env still points at loopback — avoids Chrome
 * "Local Network Access" blocking https://vercel.app → http://localhost.
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

/**
 * Full API base including `/api` suffix (e.g. https://host/api).
 */
export function getResolvedApiUrl() {
  const raw = import.meta.env.VITE_API_URL
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  const prod = import.meta.env.PROD
  const onLoopbackPage = isBrowserOnLoopbackHost()

  if (trimmed) {
    if (prod && !onLoopbackPage && isLocalApiUrl(trimmed)) {
      return `${PUBLIC_PRODUCTION_ORIGIN}/api`
    }
    return trimmed
  }

  if (prod && !onLoopbackPage) {
    return `${PUBLIC_PRODUCTION_ORIGIN}/api`
  }

  return 'http://localhost:3000/api'
}

/**
 * Backend origin without `/api` (e.g. https://host).
 */
export function getResolvedApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  const prod = import.meta.env.PROD
  const onLoopbackPage = isBrowserOnLoopbackHost()

  if (trimmed) {
    const normalized = trimmed.replace(/\/$/, '')
    if (prod && !onLoopbackPage && isLocalApiUrl(normalized)) {
      return PUBLIC_PRODUCTION_ORIGIN
    }
    return normalized
  }

  if (prod && !onLoopbackPage) {
    return PUBLIC_PRODUCTION_ORIGIN
  }

  return 'http://localhost:3000'
}
