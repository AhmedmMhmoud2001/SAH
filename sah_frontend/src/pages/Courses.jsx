import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import './home.css'
import './courses.css'
import { useI18n } from '../i18n/I18nProvider.jsx'

import clockIcon from '../assets/img_home/tabler_clock-filled.png'
import studentsIcon from '../assets/img_home/mdi_account-student.png'
import { useEffect, useMemo, useState } from 'react'
import { getCourses, resolveAssetUrl } from '../api/index.js'

function CourseMeta({ icon, label, value, variant }) {
  return (
    <span className="course__meta" aria-label={`${label}: ${value}`}>
      <span
        className={
          variant === 'clock'
            ? 'course__metaIconWrap course__metaIconWrap--clock'
            : 'course__metaIconWrap course__metaIconWrap--grad'
        }
      >
        <img className="course__metaIcon" src={icon} alt="" width="16" height="16" />
      </span>
      <span className="course__metaValue">{value}</span>
    </span>
  )
}

function CourseCard({ id, title, duration, students, price, shortDesc, image }) {
  const { t } = useI18n()
  return (
    <a className="course--clickable" href={`/course/${id}`} aria-label={title}>
      <article className="course course--page">
        <div className="course__header">
          <img
            className="course__image"
            src={image}
            alt=""
            width="360"
            height="210"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="course__body">
          <div className="course__metaRow" aria-label={t('courseDetails.meta')}>
            <CourseMeta
              variant="clock"
              icon={clockIcon}
              label={t('courseDetails.duration')}
              value={duration}
            />
            <CourseMeta
              variant="grad"
              icon={studentsIcon}
              label={t('courseDetails.students')}
              value={students}
            />
          </div>
          <h3 className="course__title">{title}</h3>
          <p className="course__desc">{shortDesc}</p>
          <div className="course__bottom">
            <span className="course__detailsBtn" aria-hidden="true">
              {t('coursesPage.details')}
            </span>
            <p className="course__price" aria-label={t('courseDetails.priceAria', { price })}>
              {price}
            </p>
          </div>
        </div>
      </article>
    </a>
  )
}

function CheckItem({ children }) {
  return (
    <li className="why__item">
      <span className="why__check" aria-hidden="true">
        ✓
      </span>
      <span className="why__text">{children}</span>
    </li>
  )
}

export default function Courses() {
  const { dir, lang, t } = useI18n()
  const perPage = 8
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    ;(async () => {
      try {
        const data = await getCourses({ lang, page, limit: perPage })
        if (!mounted) return
        setCourses(data.courses || [])
        setPagination(data.pagination || { page: page, pages: 1 })
      } catch (e) {
        if (!mounted) return
        setError(t('msg.loading') || 'Failed to load courses')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [lang, page])

  const totalPages = Math.max(1, pagination.pages || 1)
  const pageSafe = Math.min(Math.max(1, page), totalPages)

  const pageItems = useMemo(() => courses, [courses])

  function goTo(p) {
    const next = Math.min(Math.max(1, p), totalPages)
    setPage(next)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar />

      <main className="coursesPage">
        <section className="coursesHero" aria-label={t('coursesPage.title')}>
          <div className="container">
            <header className="coursesHero__header">
              <h1 className="coursesHero__title">{t('coursesPage.title')}</h1>
              <p className="coursesHero__subtitle">
                {t('coursesPage.subtitle')}
              </p>
            </header>

            <section className="coursesGrid coursesGrid--page" aria-label={t('nav.courses')}>
              {loading ? (
                <p style={{ padding: 16 }}>{t('msg.loading')}</p>
              ) : error ? (
                <p style={{ padding: 16 }}>{error}</p>
              ) : (
                pageItems.map((c) => (
                  <CourseCard
                    key={c.id}
                    id={c.id}
                    image={resolveAssetUrl(c.image)}
                    duration={c.duration || '—'}
                    students={c.students || '0'}
                    price={lang === 'en' ? `${c.price} SAR` : `${c.price} ر.س`}
                    title={lang === 'en' ? c.enTitle ?? c.title : c.title}
                    shortDesc={lang === 'en' ? c.enShortDesc ?? c.shortDesc : c.shortDesc}
                  />
                ))
              )}
            </section>

            {totalPages > 1 ? (
              <nav className="pager" aria-label={t('coursesPage.pagination')}>
                <button
                  type="button"
                  className="pager__btn"
                  onClick={() => goTo(pageSafe - 1)}
                  disabled={pageSafe === 1}
                >
                  {t('coursesPage.prev')}
                </button>

                <div className="pager__nums" role="list">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const n = idx + 1
                    const active = n === pageSafe
                    return (
                      <button
                        key={n}
                        type="button"
                        className={active ? 'pager__num pager__num--active' : 'pager__num'}
                        onClick={() => goTo(n)}
                        aria-current={active ? 'page' : undefined}
                        aria-label={t('coursesPage.pageAria', { n })}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  className="pager__btn"
                  onClick={() => goTo(pageSafe + 1)}
                  disabled={pageSafe === totalPages}
                >
                  {t('coursesPage.next')}
                </button>
              </nav>
            ) : null}
          </div>
        </section>

        <section className="why" aria-label={t('coursesPage.whyTitle')}>
          <div className="container why__inner">
            <h2 className="why__title">{t('coursesPage.whyTitle')}</h2>
            <div className="why__cols">
              <ul className="why__list" role="list">
                <CheckItem>{t('coursesPage.why1')}</CheckItem>
                <CheckItem>{t('coursesPage.why2')}</CheckItem>
              </ul>
              <ul className="why__list" role="list">
                <CheckItem>{t('coursesPage.why3')}</CheckItem>
                <CheckItem>{t('coursesPage.why4')}</CheckItem>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

