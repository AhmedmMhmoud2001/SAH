import { useI18n } from '../../i18n/I18nProvider.jsx'
import { useEffect, useState } from 'react'
import { getEnrollments, resolveAssetUrl, logout } from '../../api/index.js'
import '../../pages/home-after.css'

function ProgressCard({ title, progress, image, courseId }) {
  const { t, lang } = useI18n()
  return (
    <article className="continueCard">
      <div className="continueCard__content">
        <h3 className="continueCard__title">{title}</h3>
        <div className="continueCard__progressRow">
          <div
            className="continueCard__progressBar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="continueCard__progressFill" style={{ width: `${progress}%` }} />
          </div>
          <p className="continueCard__percent">{t('homeAfter.completed', { p: progress })}</p>
        </div>
        <a className="continueCard__btn" href={`/course/${courseId}`}>
          {t('homeAfter.continue')}
        </a>
      </div>

      <div className="continueCard__thumbWrap" aria-hidden="true">
        <img className="continueCard__thumb" src={image} alt="" loading="lazy" />
      </div>
    </article>
  )
}

export default function ContinueLearningSection() {
  const { t, lang } = useI18n()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await getEnrollments({ lang })
        const enrollments = data?.enrollments || []
        const mapped = enrollments.map((e) => ({
          id: e.enrollmentId,
          courseId: e.courseId,
          title: e.course?.title || '',
          progress: e.progress ?? 0,
          image: resolveAssetUrl(e.course?.image) || '',
        }))
        if (!cancelled) setItems(mapped)
      } catch (e) {
        console.error(e)
        if (e?.status === 401) {
          logout()
          if (typeof window !== 'undefined') window.location.assign('/login')
        }
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [lang])

  return (
    <section className="continueSection" aria-label={t('homeAfter.title')}>
      <div className="container">
        <header className="continueSection__header">
          <h2 className="continueSection__title">{t('homeAfter.title')}</h2>
          <p className="continueSection__subtitle">{t('homeAfter.subtitle')}</p>
          <a className="continueSection__allBtn" href="/my-courses">
            {t('homeAfter.goMyCourses')}
          </a>
        </header>
        <div className="continueGrid">
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>{lang === 'en' ? 'Loading...' : 'جاري التحميل...'}</p>
          ) : items.length ? (
            items.slice(0, 4).map((c) => <ProgressCard key={c.id} {...c} />)
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>{lang === 'en' ? 'No enrolled courses yet.' : 'لا توجد دورات مسجلة بعد.'}</p>
          )}
        </div>
      </div>
    </section>
  )
}
