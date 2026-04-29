import { useState } from 'react'
import './auth.css'
import AuthBrandSide from '../components/auth/AuthBrandSide.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { login as apiLogin, requestDeviceChange } from '../api/index.js'

export default function Login() {
  const { dir, lang, t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [locked, setLocked] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [lastCreds, setLastCreds] = useState({ email: '', password: '' })
  return (
    <div className="authPage" dir={dir} lang={lang}>
      <div className="authSplit">
      <AuthBrandSide />
        <div className="authFormPanel">
          <h1 className="authTitle">{t('auth.loginTitle')}</h1>
          <p className="authSubtitle">
            {t('auth.loginSub')}
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (loading) return
              setErrorMessage('')
              setLocked(false)
              const form = new FormData(e.currentTarget)
              const email = String(form.get('email') || '').trim()
              const password = String(form.get('password') || '').trim()
              setLastCreds({ email, password })
              setLoading(true)
              try {
                await apiLogin({ email, password })
                window.location.assign('/')
              } catch (err) {
                console.error(err)
                const status = err?.status
                const text = String(err?.message || '')
                if (status === 409 && (text.includes('DEVICE_LOCKED') || text.includes('locked'))) {
                  setLocked(true)
                  setErrorMessage(
                    lang === 'en'
                      ? 'This account is locked to another device. You can request a device change.'
                      : 'الحساب مرتبط بجهاز آخر. يمكنك تقديم طلب تغيير جهاز.'
                  )
                } else if (status === 400 && text.includes('DEVICE_ID_REQUIRED')) {
                  setErrorMessage(lang === 'en' ? 'Device ID is required' : 'معرّف الجهاز مطلوب')
                } else {
                  setErrorMessage(lang === 'en' ? 'Login failed' : 'فشل تسجيل الدخول')
                }
              } finally {
                setLoading(false)
              }
            }}
            aria-label={t('nav.login')}
          >
            {errorMessage ? (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412' }}>
                {errorMessage}
              </div>
            ) : null}

            <div className="authField">
              <label className="authLabel" htmlFor="login-email">
                {t('auth.emailOrPhone')}
              </label>
              <input
                className="authInput"
                id="login-email"
                name="email"
                type="text"
                autoComplete="username"
                dir="ltr"
                placeholder={t('auth.emailOrPhonePh')}
                required
              />
            </div>

            <div className="authField">
              <label className="authLabel" htmlFor="login-password">
                {t('auth.password')}
              </label>
              <input
                className="authInput"
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={t('auth.passwordPh')}
                required
              />
            </div>

            <div className="authRow">
              <label className="authCheck">
                <input type="checkbox" name="remember" />
                {t('auth.rememberMe')}
              </label>
              <a className="authLink" href="#forgot">
                {t('auth.forgotPassword')}
              </a>
            </div>

            <button className="authSubmit" type="submit" disabled={loading}>
              {loading ? (lang === 'en' ? 'Signing in...' : 'جاري تسجيل الدخول...') : t('nav.login')}
            </button>
          </form>

          {locked ? (
            <div style={{ marginTop: 12 }}>
              <button
                className="authSubmit"
                type="button"
                disabled={requestLoading}
                onClick={async () => {
                  if (requestLoading) return
                  setRequestLoading(true)
                  setErrorMessage('')
                  try {
                    await requestDeviceChange(lastCreds)
                    setErrorMessage(
                      lang === 'en'
                        ? 'Request submitted. Please wait for admin approval.'
                        : 'تم إرسال الطلب. برجاء انتظار موافقة الأدمن.'
                    )
                  } catch (e) {
                    console.error(e)
                    const status = e?.status
                    const text = String(e?.message || '')
                    if (status === 409 && text.includes('REQUEST_ALREADY_PENDING')) {
                      setErrorMessage(
                        lang === 'en'
                          ? 'A device change request is already pending.'
                          : 'يوجد طلب تغيير جهاز قيد المراجعة بالفعل.'
                      )
                    } else if (status === 401 && text.includes('Invalid credentials')) {
                      setErrorMessage(lang === 'en' ? 'Invalid email or password' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
                    } else {
                      setErrorMessage(lang === 'en' ? 'Failed to submit request' : 'فشل إرسال الطلب')
                    }
                  } finally {
                    setRequestLoading(false)
                  }
                }}
              >
                {requestLoading ? (lang === 'en' ? 'Submitting...' : 'جاري الإرسال...') : (lang === 'en' ? 'Request device change' : 'طلب تغيير الجهاز')}
              </button>
            </div>
          ) : null}

          <p className="authFooterNote">
            {t('auth.noAccount')}{' '}
            <a className="authLink" href="/signup">
              {t('nav.signup')}
            </a>
          </p>
        </div>

       
      </div>
    </div>
  )
}
