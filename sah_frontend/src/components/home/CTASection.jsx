import { useI18n } from '../../i18n/I18nProvider.jsx'
import { motion, useReducedMotion } from 'framer-motion'

export default function CTASection({ ctaTitle, ctaSub, ctaBtn, ctaHref }) {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const enter = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.65, ease: 'easeOut' },
  }
  return (
    <div className="ctaSection__containerdiv">
    <section className="ctaSection" aria-label={t('home.ctaTitle')}>
      <div className="container ctaSection__container">
        <motion.div className="ctaPanel" {...enter}>
          <div className="ctaPanel__decor" aria-hidden="true">
            <span className="ctaPanel__decorWaves" />
            <span className="ctaPanel__decorDots" />
          </div>
          <div className="ctaPanel__inner">
            <h2 className="ctaPanel__title">{ctaTitle || t('home.ctaTitle')}</h2>
            <p className="ctaPanel__subtitle">
              {ctaSub || t('home.ctaSub')}
            </p>
            <motion.a
              className="ctaPanel__btn"
              href={ctaHref || '#courses'}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { y: 0 }}
            >
              {ctaBtn || t('home.ctaBtn')}
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
    </div>
  )
}
