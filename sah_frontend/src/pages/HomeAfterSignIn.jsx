import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import FeaturesSection from '../components/home/FeaturesSection.jsx'
import ContinueLearningSection from '../components/home/ContinueLearningSection.jsx'
import CoursesSection from '../components/home/CoursesSection.jsx'
import TestimonialsSection from '../components/home/TestimonialsSection.jsx'
import StepsSection from '../components/home/StepsSection.jsx'
import CTASection from '../components/home/CTASection.jsx'
import './home.css'
import './home-after.css'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useEffect, useState } from 'react'
import { getHome } from '../api/index.js'

export default function HomeAfterSignIn() {
  const { dir, lang } = useI18n()
  const [home, setHome] = useState(null)

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

  return (
    <div className="app app--home" dir={dir} lang={lang}>
      <Navbar authenticated homePath="/app" topBarTransparent logoHome />
      <main>
        <HeroSection
          heroTitle={home?.heroTitle}
          heroBrand={home?.heroBrand}
          heroSubtitle={home?.heroSubtitle}
          heroCtaLabel={home?.heroCtaLabel}
          heroCtaHref={home?.heroCtaHref}
        />
        <FeaturesSection items={home?.features} />
        <ContinueLearningSection />
        <CoursesSection />
        <TestimonialsSection items={home?.testimonials} />
        <StepsSection steps={home?.steps} />
        <CTASection ctaTitle={home?.ctaTitle} ctaSub={home?.ctaSub} ctaBtn={home?.ctaBtn} ctaHref={home?.ctaHref} />
      </main>
      <Footer />
    </div>
  )
}
