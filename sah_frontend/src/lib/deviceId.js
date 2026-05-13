const STORAGE_KEY = 'sah_student_device_id'
const LEGACY_STORAGE_KEY = 'deviceId'

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `sah-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * Stable per-browser device id for student auth (required by API).
 * Uses a namespaced key to avoid collisions with other scripts / apps.
 */
export function getOrCreateDeviceId() {
  try {
    if (typeof localStorage === 'undefined') return randomId()

    let existing = String(localStorage.getItem(STORAGE_KEY) || '').trim()
    if (!existing) {
      const legacy = String(localStorage.getItem(LEGACY_STORAGE_KEY) || '').trim()
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy)
        existing = legacy
      }
    }
    if (existing) return existing

    const id = randomId()
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    return randomId()
  }
}

/** Non-empty string suitable for JSON body (backend requires string deviceId). */
export function getDeviceIdForRequest() {
  const id = getOrCreateDeviceId()
  const s = typeof id === 'string' ? id.trim() : String(id || '').trim()
  return s || randomId()
}

export function getDeviceInfo() {
  try {
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      platform: typeof navigator !== 'undefined' ? (navigator.platform || '') : '',
      language: typeof navigator !== 'undefined' ? (navigator.language || '') : '',
      timezone: (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
        } catch {
          return ''
        }
      })(),
    }
  } catch {
    return {}
  }
}
