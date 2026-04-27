import { useI18n } from '../../i18n/I18nProvider.jsx'
import { motion, useReducedMotion } from 'framer-motion'

const STEPS = [
  {
    number: '01',
    title: 'اختر الدورة',
    desc: 'اختر الدورة المناسبة لمستواك وهدفك المهني.',
  },
  {
    number: '02',
    title: 'ابدأ التعلم',
    desc: 'تابع الدروس وطبّق عملياً مع تمارين ومهام.',
  },
  {
    number: '03',
    title: 'احصل على الشهادة',
    desc: 'أكمل التقييم لتحصل على شهادة إتمام معتمدة.',
  },
]

function Step({ number, title, desc }) {
  return (
    <li className="step">
      <div className="step__badge" aria-hidden="true">
        {number}
      </div>
      <h3 className="step__title">{title}</h3>
      <p className="step__desc">{desc}</p>
    </li>
  )
}

export default function StepsSection({ steps }) {
  const { t, lang } = useI18n()
  const reduceMotion = useReducedMotion()
  const enter = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }
  const fallback = [
    {
      number: '01',
      title: lang === 'en' ? 'Choose a course' : 'اختر الدورة',
      desc:
        lang === 'en'
          ? 'Pick the right course for your level and goal.'
          : 'اختر الدورة المناسبة لمستواك وهدفك المهني.',
    },
    {
      number: '02',
      title: lang === 'en' ? 'Start learning' : 'ابدأ التعلم',
      desc:
        lang === 'en'
          ? 'Watch lessons and practice with tasks.'
          : 'تابع الدروس وطبّق عملياً مع تمارين ومهام.',
    },
    {
      number: '03',
      title: lang === 'en' ? 'Get certified' : 'احصل على الشهادة',
      desc:
        lang === 'en'
          ? 'Complete the evaluation to earn a certificate.'
          : 'أكمل التقييم لتحصل على شهادة إتمام معتمدة.',
    },
  ]
  const list = Array.isArray(steps) && steps.length ? steps : fallback
  return (
    <section className="section" aria-label={t('home.stepsTitle')}>
      <div className="container">
        <motion.header className="section__header" {...enter}>
          <h2 className="section__title">{t('home.stepsTitle')}</h2>
          <p className="section__subtitle">{t('home.stepsSub')}</p>
        </motion.header>

        <motion.ol className="steps" role="list" {...enter} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}>
          {list.map((s, idx) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.04 * idx }}
              style={{ display: 'contents' }}
            >
              <Step {...s} />
            </motion.div>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}

