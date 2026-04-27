const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export function getToken() {
  return localStorage.getItem('sah_token') || localStorage.getItem('token')
}

export function getStoredUser() {
  const raw = localStorage.getItem('sah_user') || localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveAuthSession({ token, user }) {
  if (token) {
    localStorage.setItem('sah_token', token)
    localStorage.setItem('token', token)
  }
  if (user) {
    const serialized = JSON.stringify(user)
    localStorage.setItem('sah_user', serialized)
    localStorage.setItem('user', serialized)
  }
}

export function clearAuthSession() {
  localStorage.removeItem('sah_token')
  localStorage.removeItem('sah_user')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

function isExpiredSession(response, result) {
  const msg = String(result?.error || '').toLowerCase()
  return response?.status === 401 || msg.includes('user not found') || msg.includes('invalid token')
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Failed to create account.')
  saveAuthSession(result)
  return result
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Failed to login.')
  saveAuthSession(result)
  return result
}

export async function getMyProfile() {
  const token = getToken()
  if (!token) throw new Error('No token found.')
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (isExpiredSession(response, result)) {
      clearAuthSession()
      throw new Error('Session expired. Please login again.')
    }
    throw new Error(result.error || 'Failed to load profile.')
  }
  if (result?.user) {
    saveAuthSession({ token, user: result.user })
  }
  return result?.user || null
}

export async function getMyEnrollments(lang = 'ar') {
  const token = getToken()
  if (!token) throw new Error('No token found.')
  const response = await fetch(`${API_BASE_URL}/api/enrollments?lang=${encodeURIComponent(lang)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (isExpiredSession(response, result)) {
      clearAuthSession()
      throw new Error('Session expired. Please login again.')
    }
    throw new Error(result.error || 'Failed to load enrollments.')
  }
  return Array.isArray(result?.enrollments) ? result.enrollments : []
}

export async function updateMyProfile(payload) {
  const token = getToken()
  if (!token) throw new Error('No token found.')
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Failed to update profile.')
  saveAuthSession({ token, user: result.user })
  return result.user
}

export async function changeMyPassword(payload) {
  const token = getToken()
  if (!token) throw new Error('No token found.')
  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Failed to change password.')
  return result
}

export async function uploadMyAvatar(file) {
  const token = getToken()
  if (!token) throw new Error('No token found.')
  const form = new FormData()
  form.append('avatar', file)
  const response = await fetch(`${API_BASE_URL}/api/auth/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Failed to upload avatar.')
  const current = getStoredUser() || {}
  const nextUser = { ...current, avatarUrl: result.avatarUrl }
  saveAuthSession({ token, user: nextUser })
  return result
}

export async function deleteMyAccount() {
  const token = getToken()
  if (!token) throw new Error('No token found.')
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Failed to delete account.')
  clearAuthSession()
  return result
}

export function resolveApiUrl(pathname = '') {
  if (!pathname) return API_BASE_URL
  return `${API_BASE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}
