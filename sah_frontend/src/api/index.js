const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function apiOrigin() {
  return API_URL.replace(/\/api\/?$/, '')
}

function getToken() {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

export function resolveAssetUrl(urlOrPath) {
  if (!urlOrPath) return ''
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath
  // Frontend-local assets should be resolved from the frontend origin (Vite),
  // not from backend API origin.
  if (urlOrPath.startsWith('/src/') || urlOrPath.startsWith('/assets/')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${urlOrPath}`
    }
    return urlOrPath
  }
  if (urlOrPath.startsWith('/')) return `${apiOrigin()}${urlOrPath}`
  return `${apiOrigin()}/${urlOrPath}`
}

async function request(path) {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return await res.json()
}

async function requestAuth(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(text || `Request failed: ${res.status}`)
    err.status = res.status
    throw err
  }
  return await res.json()
}

export async function fetchAuthBlob(path) {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(text || `Request failed: ${res.status}`)
    err.status = res.status
    throw err
  }
  return await res.blob()
}

export function logout() {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } catch {
    // ignore
  }
}

export async function login({ email, password }) {
  const data = await requestAuth('/auth/login', { method: 'POST', body: { email, password } })
  if (data?.token) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user || null))
  }
  return data
}

export async function register({ name, email, phone, password }) {
  const data = await requestAuth('/auth/register', { method: 'POST', body: { name, email, phone, password } })
  if (data?.token) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user || null))
  }
  return data
}

export async function getCourses({ lang = 'ar', page = 1, limit = 8, featured } = {}) {
  const qs = new URLSearchParams({
    lang: String(lang),
    page: String(page),
    limit: String(limit),
  })
  if (featured !== undefined) qs.set('featured', featured ? 'true' : 'false')
  return await request(`/courses?${qs.toString()}`)
}

export async function getCourse(id, { lang = 'ar' } = {}) {
  return await request(`/courses/${encodeURIComponent(id)}?lang=${encodeURIComponent(lang)}`)
}

export async function getLessons(courseId, { lang = 'ar' } = {}) {
  return await request(`/courses/${encodeURIComponent(courseId)}/lessons?lang=${encodeURIComponent(lang)}`)
}

export async function getAbout() {
  return await request('/about')
}

export async function getPublicContactInfo() {
  return await request('/contact/info')
}

export async function submitContactMessage({ name, email, subject, message }) {
  const res = await fetch(`${API_URL}/contact/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return await res.json()
}

export async function getHome({ lang = 'ar' } = {}) {
  return await request(`/home?lang=${encodeURIComponent(lang)}`)
}

export async function getEnrollments({ lang = 'ar' } = {}) {
  return await requestAuth(`/enrollments?lang=${encodeURIComponent(lang)}`)
}

export async function enroll(courseId) {
  return await requestAuth('/enrollments', { method: 'POST', body: { courseId } })
}

export async function getProgress(courseId) {
  return await requestAuth(`/progress/${encodeURIComponent(courseId)}`)
}

export async function markLessonComplete(courseId, lessonId, completed) {
  return await requestAuth(`/progress/${encodeURIComponent(courseId)}`, {
    method: 'POST',
    body: { lessonId, completed },
  })
}

export async function getFinalQuiz(courseId, { lang = 'ar' } = {}) {
  return await request(`/courses/${encodeURIComponent(courseId)}/quizzes/final?lang=${encodeURIComponent(lang)}`)
}

export async function getQuiz(quizId, { lang = 'ar' } = {}) {
  return await request(`/quizzes/${encodeURIComponent(quizId)}?lang=${encodeURIComponent(lang)}`)
}

export async function submitQuiz(quizId, answers) {
  return await requestAuth(`/quizzes/${encodeURIComponent(quizId)}/submit`, {
    method: 'POST',
    body: { answers },
  })
}

export async function validateCoupon({ courseId, couponCode }) {
  return await requestAuth('/checkout/validate', {
    method: 'POST',
    body: { courseId, couponCode },
  })
}

export async function checkout({ courseId, couponCode }) {
  return await requestAuth('/checkout', {
    method: 'POST',
    body: { courseId, couponCode: couponCode || undefined },
  })
}

export async function getOrderStatus(orderId) {
  return await requestAuth(`/checkout/status/${encodeURIComponent(orderId)}`)
}

export async function getMyCertificateRequests() {
  return await requestAuth('/certificates/my')
}

export async function requestCertificate({ courseId, fullName, fullNameEn }) {
  return await requestAuth('/certificates/request', { method: 'POST', body: { courseId, fullName, fullNameEn } })
}

export async function getMyCertificatePdf(courseId, { lang = 'ar' } = {}) {
  const safeLang = String(lang).toLowerCase() === 'en' ? 'en' : 'ar'
  return await fetchAuthBlob(`/certificates/pdf/${encodeURIComponent(courseId)}?lang=${encodeURIComponent(safeLang)}`)
}

export async function downloadMyCertificatePdf(courseId, { lang = 'ar' } = {}) {
  const safeLang = String(lang).toLowerCase() === 'en' ? 'en' : 'ar'
  return await fetchAuthBlob(`/certificates/pdf/${encodeURIComponent(courseId)}?lang=${encodeURIComponent(safeLang)}&download=1`)
}

