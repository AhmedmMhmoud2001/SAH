import { useI18n } from '../../i18n/I18nProvider.jsx'
import { motion, useReducedMotion } from 'framer-motion'

function renderTitleWithBrand(template, brand) {
  const t = String(template || '')
  const token = '{brand}'
  if (!t.includes(token)) return t
  const parts = t.split(token)
  return parts.map((p, idx) =>
    idx === parts.length - 1 ? (
      p
    ) : (
      <span key={idx}>
        {p}
        <span className="hero__accent">{brand}</span>
      </span>
    ),
  )
}

export default function HeroSection({
  heroTitle,
  heroBrand,
  heroSubtitle,
  heroCtaLabel,
  heroCtaHref,
}) {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut', delay },
  })

  const titleFallback = t('home.heroTitle', {
    brand: `<span class="hero__accent">${heroBrand || 'Odoo'}</span>`,
  })
    .split(`<span class="hero__accent">${heroBrand || 'Odoo'}</span>`)
    .map((part, idx, arr) =>
      idx === arr.length - 1 ? (
        part
      ) : (
        <span key={idx}>
          {part}
          <span className="hero__accent">{heroBrand || 'Odoo'}</span>
        </span>
      ),
    )

  return (
    <section className="hero" aria-label={t('home.heroTitle', { brand: 'Odoo' })}>
      <div className="container hero__inner">
        <div className="hero__content hero__content--center">
          <motion.h1 className="hero__accent" {...fadeUp(0.05)}>
            {heroTitle ? renderTitleWithBrand(heroTitle, heroBrand || 'Odoo') : titleFallback}
          </motion.h1>
          <motion.p className="hero__subtitle" {...fadeUp(0.12)}>
            {heroSubtitle || t('home.heroSubtitle')}
          </motion.p>

          <motion.div className="hero__actions hero__actions--center" {...fadeUp(0.18)}>
            <motion.a
              className="btn btn--primary btn--hero"
              href={heroCtaHref || '#courses'}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { y: 0 }}
            >
              {heroCtaLabel || t('home.startLearning')}
            </motion.a>

            <motion.a
              className="heroVideo"
              href="#intro-video"
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { y: 0 }}
            >
              <span className="heroVideo__icon" aria-hidden="true">
                ▶
              </span>
              <span className="heroVideo__text">{t('home.introVideo')}</span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

