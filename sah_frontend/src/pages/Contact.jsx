import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import './home.css'
import './contact.css'
import { useI18n } from '../i18n/I18nProvider.jsx'
import contactIllus from '../assets/img_contact/contact-illus.png'
import { toastSuccess } from '../ui/toast.js'
import { useEffect, useMemo, useState } from 'react'
import { getPublicContactInfo, submitContactMessage } from '../api/index.js'

function IconMail() {
  return (
    <svg className="contactCard__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16v12H4V6Zm0 0 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg className="contactCard__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg className="contactCard__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

export default function Contact() {
  const { dir, lang, t } = useI18n()
  const [info, setInfo] = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingInfo(true)
      try {
        const data = await getPublicContactInfo()
        if (!cancelled) setInfo(data || {})
      } catch (e) {
        console.error(e)
        if (!cancelled) setInfo(null)
      } finally {
        if (!cancelled) setLoadingInfo(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const addressValue = useMemo(() => {
    return info?.address || t('contact.addressValue')
  }, [info?.address, t])

  const emailValue = useMemo(() => {
    return info?.email || 'info@smahacademy.com'
  }, [info?.email])

  const phoneValue = useMemo(() => {
    return info?.phone || '+966 50 123 4567'
  }, [info?.phone])

  async function onSend(e) {
    e.preventDefault()
    if (sending) return
    setSending(true)
    try {
      await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: '',
        message: form.message.trim(),
      })
      toastSuccess(t('toast.contactSent'))
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      console.error(err)
      alert(lang === 'en' ? 'Failed to send message' : 'فشل إرسال الرسالة')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar />

      <main className="contactPage">
        <section className="contactHero" aria-label={t('nav.contact')}>
          <div className="container contactHero__inner">
            <header className="contactHero__header">
              <h1 className="contactHero__title">{t('contact.title')}</h1>
              <p className="contactHero__subtitle">
                {t('contact.subtitle')}
              </p>
            </header>

            <div className="contactHero__grid">
            <aside className="contactIllus" aria-hidden="true">
                <div className="contactIllus__wrap contactIllus__wrap--img">
                  <img
                    className="contactIllus__img"
                    src={contactIllus}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </aside>
              <form className="contactForm" aria-label={t('contact.form')} onSubmit={onSend}>
                <div className="contactForm__field">
                  <label className="contactForm__label" htmlFor="fullName">
                    {t('contact.fullName')}
                  </label>
                  <input
                    className="contactForm__input"
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t('contact.fullNamePh')}
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="contactForm__field">
                  <label className="contactForm__label" htmlFor="email">
                    {t('contact.emailOrPhone')}
                  </label>
                  <input
                    className="contactForm__input"
                    id="email"
                    name="email"
                    type="text"
                    dir="ltr"
                    placeholder={t('contact.emailOrPhonePh')}
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="contactForm__field">
                  <label className="contactForm__label" htmlFor="message">
                    {t('contact.message')}
                  </label>
                  <textarea
                    className="contactForm__textarea"
                    id="message"
                    name="message"
                    placeholder={t('contact.messagePh')}
                    rows={7}
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>

                <button className="contactForm__submit" type="submit" disabled={sending}>
                  {sending ? (lang === 'en' ? 'Sending...' : 'جاري الإرسال...') : t('contact.send')}
                </button>
              </form>

              {/* <aside className="contactIllus" aria-hidden="true">
                <div className="contactIllus__wrap contactIllus__wrap--img">
                  <img
                    className="contactIllus__img"
                    src={contactIllus}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </aside> */}
            </div>

            <section className="contactCards" aria-label={t('contact.info')}>
              <article className="contactCard">
                <div className="contactCard__iconWrap" aria-hidden="true">
                  <IconPin />
                </div>
                <div className="contactCard__text">
                  <p className="contactCard__label">{t('contact.address')}</p>
                  <p className="contactCard__value">
                    {loadingInfo ? (lang === 'en' ? 'Loading...' : 'جاري التحميل...') : addressValue}
                  </p>
                </div>
              </article>
              <article className="contactCard">
                <div className="contactCard__iconWrap" aria-hidden="true">
                  <IconMail />
                </div>
                <div className="contactCard__text">
                  <p className="contactCard__label">{t('contact.email')}</p>
                  <p className="contactCard__value" dir="ltr">
                    {loadingInfo ? '...' : emailValue}
                  </p>
                </div>
              </article>

          
              <article className="contactCard">
                <div className="contactCard__iconWrap" aria-hidden="true">
                  <IconPhone />
                </div>
                <div className="contactCard__text">
                  <p className="contactCard__label">{t('contact.phone')}</p>
                  <p className="contactCard__value" dir="ltr">
                    {loadingInfo ? '...' : phoneValue}
                  </p>
                </div>
              </article>

            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

