import footerLogo from '../../assets/img_home/Frame 5.png'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { useEffect, useMemo, useState } from 'react'
import { getContactInfoCached } from '../../api/contactCache.js'

function IconMail() {
  return (
    <svg className="footer__contactIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg className="footer__contactIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg className="footer__contactIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function IconWhatsApp() {
  return (
    <svg className="footer__contactIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21a9 9 0 1 0-7.7-4.3L3 21l4.6-1.2A8.95 8.95 0 0 0 12 21Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.6c.2-.5.4-.5.7-.5h.6c.2 0 .5.1.6.4l.8 2c.1.3.1.6-.1.8l-.5.6c-.2.2-.2.5 0 .7.6 1.1 1.6 2 2.7 2.6.2.1.5.1.7-.1l.6-.5c.2-.2.5-.2.8-.1l2 .8c.3.1.4.4.4.6v.6c0 .3 0 .5-.5.7-.6.3-1.9.7-3.7 0-2.2-.8-4.1-2.7-5-4.9-.8-1.8-.4-3.1 0-3.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SocialSvgLinkedIn() {
  return (
    <svg className="footer__socialIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zm7.5 0h3.8v2h.1c.5-1 1.8-2.1 3.7-2.1 4 0 4.7 2.6 4.7 6v8.6h-4v-7.6c0-1.8 0-4.1-2.5-4.1s-2.9 2-2.9 4v7.7h-4V8.5z" />
    </svg>
  )
}

function SocialSvgX() {
  return (
    <svg className="footer__socialIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.5 8.6L22.5 22h-5.6l-5.1-6.4L5.8 22H2.5l8-9.1L2 2h5.7l4.7 5.9L18.244 2zm-1.9 18h2.5L7.1 4.5H4.4l11.9 15.5z" />
    </svg>
  )
}

function SocialSvgInstagram() {
  return (
    <svg className="footer__socialIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9ZM20 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </svg>
  )
}

function SocialSvgFacebook() {
  return (
    <svg className="footer__socialIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.49 17.52 2 12 2S2 6.49 2 12.06C2 17.06 5.66 21.2 10.44 22v-7H7.9v-2.87h2.54V9.41c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.87h-2.34V22C18.34 21.2 22 17.06 22 12.06Z" />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const { t } = useI18n()
  const [contact, setContact] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getContactInfoCached()
        if (!cancelled) setContact(data || {})
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const email = useMemo(() => contact?.email || 'info@smahacademy.com', [contact?.email])
  const phone = useMemo(() => contact?.phone || '+966 50 123 4567', [contact?.phone])
  const address = useMemo(() => contact?.address || t('contact.addressValue'), [contact?.address, t])
  const whatsappDigits = useMemo(
    () => (contact?.whatsapp ? String(contact.whatsapp).replace(/[^\d]/g, '') : ''),
    [contact?.whatsapp],
  )

  function safeUrl(url) {
    const raw = (url || '').trim()
    if (!raw) return ''
    if (/^https?:\/\//i.test(raw)) return raw
    return `https://${raw}`
  }

  const socials = useMemo(
    () => [
      { label: 'LinkedIn', href: safeUrl(contact?.linkedin), Icon: SocialSvgLinkedIn },
      { label: 'Instagram', href: safeUrl(contact?.instagram), Icon: SocialSvgInstagram },
      { label: 'X', href: safeUrl(contact?.twitter), Icon: SocialSvgX },
      { label: 'Facebook', href: safeUrl(contact?.facebook), Icon: SocialSvgFacebook },
    ].filter((s) => !!s.href),
    [contact?.facebook, contact?.instagram, contact?.linkedin, contact?.twitter],
  )

  return (
    <footer className="footer" aria-label={t('footer.label')}>
      <div className="container footer__inner">
        <div className="footer__brand">
          <img
            className="footer__logoImg"
            src={footerLogo}
            alt="SMART ACCOUNTING HUB ACADEMY"
            width="168"
            height="48"
            loading="lazy"
            decoding="async"
          />
          <p className="footer__muted">
            {t('home.heroSubtitle')}
          </p>
        </div>

        <nav className="footer__col footer__col--quick" aria-label={t('footer.quickLinks')}>
          <h3 className="footer__title">{t('footer.quickLinks')}</h3>
          <ul className="footer__list">
            <li>
              <a className="footer__link" href="/">
                {t('nav.home')}
              </a>
            </li>
            <li>
              <a className="footer__link" href="/courses">
                {t('nav.courses')}
              </a>
            </li>
            <li>
              <a className="footer__link" href="/about">
                {t('nav.about')}
              </a>
            </li>
            <li>
              <a className="footer__link" href="/contact">
                {t('nav.contact')}
              </a>
            </li>
          </ul>
        </nav>

        <nav className="footer__col footer__col--support" aria-label={t('footer.support')}>
          <h3 className="footer__title">{t('footer.support')}</h3>
          <ul className="footer__list">
            <li>
              <a className="footer__link" href="/login">
                {t('nav.login')}
              </a>
            </li>
            <li>
              <a className="footer__link" href="/signup">
                {t('nav.signup')}
              </a>
            </li>
            <li>
              <a className="footer__link" href="/app">
                {t('footer.dashboard')}
              </a>
            </li>
            <li>
              <a className="footer__link" href="/#faq">
                {t('footer.faq')}
              </a>
            </li>
          </ul>
        </nav>

        <div className="footer__col footer__col--contact" id="contact" aria-label={t('footer.contactUs')}>
          <h3 className="footer__title">{t('footer.contactUs')}</h3>
          <ul className="footer__list footer__contact">
            <li className="footer__contactRow">
              <IconMail />
              <a className="footer__contactLink" href={`mailto:${email}`}>
                {email}
              </a>
            </li>
            <li className="footer__contactRow">
              <IconPhone />
              <a className="footer__contactLink" dir="ltr" href={`tel:${phone}`}>
                {phone}
              </a>
            </li>
            {whatsappDigits ? (
              <li className="footer__contactRow">
                <IconWhatsApp />
                <a
                  className="footer__contactLink"
                  dir="ltr"
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +{whatsappDigits}
                </a>
              </li>
            ) : null}
            <li className="footer__contactRow">
              <IconPin />
              <span className="footer__contactLink">{address}</span>
            </li>
          </ul>

          <div className="footer__social" aria-label={t('nav.social')}>
            {socials.length ? (
              socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  className="footer__socialBtn"
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </a>
              ))
            ) : (
              <>
                <a className="footer__socialBtn" href="#" aria-label="LinkedIn">
                  <SocialSvgLinkedIn />
                </a>
                <a className="footer__socialBtn" href="#" aria-label="Instagram">
                  <SocialSvgInstagram />
                </a>
                <a className="footer__socialBtn" href="#" aria-label="X">
                  <SocialSvgX />
                </a>
                <a className="footer__socialBtn" href="#" aria-label="Facebook">
                  <SocialSvgFacebook />
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottomInner">
          <p className="footer__copyLine">
            {t('footer.rights', { year, brand: 'Qeema Tech' }).replace('Qeema Tech', '')}
            <a
              className="footer__copyLink"
              href="https://www.qeematech.net/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Qeema Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
