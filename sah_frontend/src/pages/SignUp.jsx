import { useState } from 'react'
import './auth.css'
import AuthBrandSide from '../components/auth/AuthBrandSide.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { register as apiRegister } from '../api/index.js'

export default function SignUp() {
  const { dir, lang, t } = useI18n()
  const [loading, setLoading] = useState(false)
  return (
    <div className="authPage" dir={dir} lang={lang}>
      <div className="authSplit">
       

        <AuthBrandSide />
        <div className="authFormPanel">
          <h1 className="authTitle">{t('auth.signupTitle')}</h1>
          <p className="authSubtitle">
            {t('auth.signupSub')}
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (loading) return
              const form = new FormData(e.currentTarget)
              const name = String(form.get('name') || '').trim()
              const email = String(form.get('email') || '').trim()
              const password = String(form.get('password') || '').trim()
              const passwordConfirm = String(form.get('passwordConfirm') || '').trim()
              if (password !== passwordConfirm) {
                alert(lang === 'en' ? 'Passwords do not match' : 'كلمتا المرور غير متطابقتين')
                return
              }
              setLoading(true)
              try {
                await apiRegister({ name, email, phone: '', password })
                window.location.assign('/')
              } catch (err) {
                console.error(err)
                alert(lang === 'en' ? 'Sign up failed' : 'فشل إنشاء الحساب')
              } finally {
                setLoading(false)
              }
            }}
            aria-label={t('nav.signup')}
          >
            <div className="authField">
              <label className="authLabel" htmlFor="signup-name">
                {t('auth.fullName')}
              </label>
              <input
                className="authInput"
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder={t('auth.namePh')}
                required
              />
            </div>

            <div className="authField">
              <label className="authLabel" htmlFor="signup-email">
                {t('auth.emailOrPhone')}
              </label>
              <input
                className="authInput"
                id="signup-email"
                name="email"
                type="text"
                autoComplete="email"
                dir="ltr"
                placeholder={t('auth.emailOrPhonePh')}
                required
              />
            </div>

            <div className="authField">
              <label className="authLabel" htmlFor="signup-password">
                {t('auth.password')}
              </label>
              <input
                className="authInput"
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.passwordPh')}
                minLength={6}
                required
              />
            </div>

            <div className="authField">
              <label className="authLabel" htmlFor="signup-password2">
                {t('auth.confirmPassword')}
              </label>
              <input
                className="authInput"
                id="signup-password2"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.confirmPasswordPh')}
                minLength={6}
                required
              />
            </div>

            <div className="authRow" style={{ marginBottom: 18 }}>
              <label className="authCheck">
                <input type="checkbox" name="terms" required />
                {t('auth.agreeTerms')}
              </label>
            </div>

            <button className="authSubmit" type="submit" disabled={loading}>
              {loading ? (lang === 'en' ? 'Creating account...' : 'جاري إنشاء الحساب...') : t('nav.signup')}
            </button>
          </form>

          <p className="authFooterNote">
            {t('auth.haveAccount')}{' '}
            <a className="authLink" href="/login">
              {t('nav.login')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
