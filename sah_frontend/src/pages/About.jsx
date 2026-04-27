import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import IntroVideoModal from '../components/home/IntroVideoModal.jsx'
import './home.css'
import './about.css'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useEffect, useState } from 'react'

import cardHeader from '../assets/img_home/Group 1000001635.png'
import { getAbout, resolveAssetUrl } from '../api/index.js'

export default function About() {
  const { dir, lang, t } = useI18n()
  const [introOpen, setIntroOpen] = useState(false)
  const [about, setAbout] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function syncFromHash() {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      setIntroOpen(hash === '#intro-video')
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await getAbout()
        if (!cancelled) setAbout(data)
      } catch (e) {
        console.error(e)
        if (!cancelled) setAbout(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function closeIntro() {
    setIntroOpen(false)
    if (typeof window === 'undefined') return
    if (window.location.hash === '#intro-video') {
      window.history.pushState('', document.title, window.location.pathname + window.location.search)
    }
  }

  const title = lang === 'en' ? about?.titleEn : about?.titleAr
  const contentHtml = lang === 'en' ? about?.contentEn : about?.contentAr
  const imageUrl = about?.imageUrl ? resolveAssetUrl(about.imageUrl) : cardHeader

  function toEmbedUrl(url) {
    if (!url) return ''
    const raw = url.trim()
    if (raw.includes('youtube.com/embed/')) return raw
    const watch = raw.match(/[?&]v=([^&]+)/)
    if (raw.includes('youtube.com/watch') && watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`
    const short = raw.match(/youtu\.be\/([^?&]+)/)
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`
    return raw
  }

  const videoUrl = toEmbedUrl(about?.videoUrl)

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar />

      <main className="aboutPage">
        <section className="aboutHero" aria-label={t('nav.about')}>
          <div className="container aboutHero__inner">
            <div className="aboutHero__content">
              <h1 className="aboutHero__title">{title || t('about.title')}</h1>

              {loading ? (
                <p className="aboutHero__text">{lang === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
              ) : contentHtml ? (
                <div className="aboutHero__text" dangerouslySetInnerHTML={{ __html: contentHtml }} />
              ) : (
                <>
                  <p className="aboutHero__text">{t('about.p1')}</p>
                  <p className="aboutHero__text">{t('about.p2')}</p>
                  <p className="aboutHero__text">{t('about.p3')}</p>
                </>
              )}

              <a className="aboutHero__video" href="#intro-video">
                <span className="aboutHero__play" aria-hidden="true">
                  ▶
                </span>
                {t('about.introVideo')}
              </a>
            </div>

            <div className="aboutHero__media" aria-hidden="true">
              <div className="aboutCollage">
                <img
                  className="aboutCollage__img"
                  src={imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <IntroVideoModal
        open={introOpen}
        onClose={closeIntro}
        videoUrl={videoUrl || 'https://www.youtube.com/embed/ysz5S6PUM-U'}
      />
      <Footer />
    </div>
  )
}

