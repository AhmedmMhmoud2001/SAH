import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import FeaturesSection from '../components/home/FeaturesSection.jsx'
import ContinueLearningSection from '../components/home/ContinueLearningSection.jsx'
import CoursesSection from '../components/home/CoursesSection.jsx'
import TestimonialsSection from '../components/home/TestimonialsSection.jsx'
import StepsSection from '../components/home/StepsSection.jsx'
import CTASection from '../components/home/CTASection.jsx'
import IntroVideoModal from '../components/home/IntroVideoModal.jsx'
import './home.css'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useEffect, useState } from 'react'
import { getHome } from '../api/index.js'

export default function Home() {
  const { dir, lang } = useI18n()
  const [introOpen, setIntroOpen] = useState(false)
  const [home, setHome] = useState(null)
  const [isAuthed, setIsAuthed] = useState(false)

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
    ;(async () => {
      try {
        const data = await getHome({ lang })
        if (!cancelled) setHome(data)
      } catch (e) {
        console.error(e)
        if (!cancelled) setHome(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lang])

  useEffect(() => {
    function read() {
      try {
        setIsAuthed(!!localStorage.getItem('token'))
      } catch {
        setIsAuthed(false)
      }
    }
    read()
    window.addEventListener('storage', read)
    window.addEventListener('focus', read)
    return () => {
      window.removeEventListener('storage', read)
      window.removeEventListener('focus', read)
    }
  }, [])

  function closeIntro() {
    setIntroOpen(false)
    if (typeof window === 'undefined') return
    if (window.location.hash === '#intro-video') {
      window.history.pushState('', document.title, window.location.pathname + window.location.search)
    }
  }

  return (
    <div className="app app--home" dir={dir} lang={lang}>
      <Navbar topBarTransparent logoHome />
      <main>
        <HeroSection
          heroTitle={home?.heroTitle}
          heroBrand={home?.heroBrand}
          heroSubtitle={home?.heroSubtitle}
          heroCtaLabel={home?.heroCtaLabel}
          heroCtaHref={home?.heroCtaHref}
        />
        <FeaturesSection items={home?.features} />
        {isAuthed ? <ContinueLearningSection /> : null}
        <CoursesSection />
        <TestimonialsSection items={home?.testimonials} />
        <StepsSection steps={home?.steps} />
        <div id="faq" className="faqAnchor" aria-hidden="true" />
        <CTASection ctaTitle={home?.ctaTitle} ctaSub={home?.ctaSub} ctaBtn={home?.ctaBtn} ctaHref={home?.ctaHref} />
      </main>
      <IntroVideoModal
        open={introOpen}
        onClose={closeIntro}
        videoUrl={home?.introVideoUrl || 'https://www.youtube.com/embed/ysz5S6PUM-U'}
      />
      <Footer />
    </div>
  )
}

