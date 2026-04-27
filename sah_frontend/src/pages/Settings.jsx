import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { logout } from '../api/index.js'
import './my-courses.css'

function readUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function Settings() {
  const { dir, lang, setLang, t } = useI18n()
  const user = readUser()

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar authenticated homePath="/app" />
      <main className="myCoursesPage">
        <section className="myCoursesHero" aria-label={t('nav.settings')}>
          <div className="container">
            <header className="myCoursesHero__header">
              <h1 className="myCoursesHero__title">{t('nav.settings')}</h1>
              <p className="myCoursesHero__subtitle">
                {lang === 'en' ? 'Manage your preferences.' : 'إدارة تفضيلات حسابك.'}
              </p>
            </header>

            <div className="mcWideCard" style={{ padding: 18 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontWeight: 1000, color: 'rgba(11, 43, 79, 0.95)' }}>
                  {lang === 'en' ? 'Account' : 'الحساب'}
                </div>
                <div style={{ color: 'rgba(15, 23, 42, 0.72)', fontWeight: 800 }}>
                  {lang === 'en' ? 'Name' : 'الاسم'}: {user?.name || '-'}
                </div>
                <div style={{ color: 'rgba(15, 23, 42, 0.72)', fontWeight: 800 }}>
                  {lang === 'en' ? 'Email' : 'البريد'}: {user?.email || '-'}
                </div>
              </div>
            </div>

            <div className="mcWideCard" style={{ padding: 18, marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 1000, color: 'rgba(11, 43, 79, 0.95)' }}>
                    {lang === 'en' ? 'Language' : 'اللغة'}
                  </div>
                  <div style={{ color: 'rgba(15, 23, 42, 0.62)', fontWeight: 800, marginTop: 6 }}>
                    {lang === 'en' ? 'Choose your display language.' : 'اختر لغة العرض.'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="mcWideBtn" type="button" onClick={() => setLang('ar')} disabled={lang === 'ar'}>
                    العربية
                  </button>
                  <button className="mcWideBtn" type="button" onClick={() => setLang('en')} disabled={lang === 'en'}>
                    English
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              <button
                className="mcWideBtn"
                type="button"
                onClick={() => {
                  logout()
                  window.location.assign('/')
                }}
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

