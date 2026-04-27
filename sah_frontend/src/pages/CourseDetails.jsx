import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import './home.css'
import './course-details.css'
import { useI18n } from '../i18n/I18nProvider.jsx'

import { getCourse, getEnrollments, resolveAssetUrl } from '../api/index.js'
import clockIcon from '../assets/img_home/tabler_clock-filled.png'
import studentsIcon from '../assets/img_home/mdi_account-student.png'
import featureCert from '../assets/img_home/Group (1).png'
import audienceImage from '../assets/img_home/Group (1).png'
function LevelIcon() {
  return (
    <svg className="cdMeta__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 19V5m0 14h16M8 16v-6m4 6V7m4 9v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function useCourseIdFromUrl() {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : ''
  const parts = pathname.split('/').filter(Boolean)
  // /course/c1
  if (parts[0] === 'course' && parts[1]) return parts[1]
  // /course?id=c1
  const sp =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null
  const q = sp?.get('id') || sp?.get('course')
  return q || 'c1'
}

function MetaItem({ icon, label, value }) {
  return (
    <span className="cdMeta" aria-label={`${label}: ${value}`}>
      <span className="cdMeta__iconWrap" aria-hidden="true">
        {typeof icon === 'string' ? (
          <img className="cdMeta__icon" src={icon} alt="" width="16" height="16" />
        ) : (
          icon
        )}
      </span>
      <span className="cdMeta__value">{value}</span>
    </span>
  )
}

function AccordionItem({ title, index, open, onToggle }) {
  const { t } = useI18n()
  return (
    <div className="cdAcc">
      <button className="cdAcc__btn" type="button" onClick={onToggle}>
        <span className="cdAcc__right">
          <span className="cdAcc__dot" aria-hidden="true">
            {index + 1}
          </span>
          <span className="cdAcc__title">{title}</span>
        </span>
        <span className="cdAcc__chev" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open ? (
        <div className="cdAcc__panel">
          <p className="cdAcc__text">{t('courseDetails.unitPlaceholder')}</p>
        </div>
      ) : null}
    </div>
  )
}

export default function CourseDetails() {
  const courseId = useCourseIdFromUrl()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openIdx, setOpenIdx] = useState(0)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const { dir, lang, t } = useI18n()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const data = await getCourse(courseId, { lang })
        if (!mounted) return
        setCourse(data)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [courseId, lang])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = (() => {
          try {
            return localStorage.getItem('token')
          } catch {
            return null
          }
        })()
        if (!token) {
          if (!cancelled) setIsEnrolled(false)
          return
        }
        const res = await getEnrollments({ lang })
        const items = Array.isArray(res?.enrollments) ? res.enrollments : []
        const enrolled = items.some((e) => e?.course?.id === courseId || e?.courseId === courseId)
        if (!cancelled) setIsEnrolled(enrolled)
      } catch {
        if (!cancelled) setIsEnrolled(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [courseId, lang])

  if (loading || !course) {
    return (
      <div className="app" dir={dir} lang={lang}>
        <Navbar />
        <main className="courseDetailsPage">
          <div className="container" style={{ padding: 24 }}>
            <p>{t('msg.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  const levelLabel =
    lang === 'en'
      ? course.level === 'مبتدئ'
        ? 'Beginner'
        : course.level === 'متوسط'
          ? 'Intermediate'
          : course.level === 'متقدم'
            ? 'Advanced'
            : course.level
      : course.level

  const curriculumListRaw = lang === 'en' ? course.enCurriculum ?? course.curriculum : course.curriculum
  const audienceListRaw = lang === 'en' ? course.enAudience ?? course.audience : course.audience
  const curriculumList = Array.isArray(curriculumListRaw) ? curriculumListRaw : []
  const audienceList = Array.isArray(audienceListRaw) ? audienceListRaw : []
  const priceValue =
    typeof course.price === 'number'
      ? String(course.price)
      : String(course.price || '').replace(/[^\d]/g, '') || '0'

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar />

      <main className="courseDetailsPage">
        <section className="cdHero" aria-label={t('courseDetails.details')}>
          <div className="container cdHero__inner">
          
           
            <div className="cdHero__media" aria-hidden="true">
              <div className="cdHero__frame" />
              <div className="cdHero__imgWrap">
                <img className="cdHero__img" src={resolveAssetUrl(course.image)} alt="" />
              </div>
            </div>
            <div className="cdHero__content">
              <h1 className="cdHero__title">
                {lang === 'en' ? course.enTitle ?? course.title : course.title}
              </h1>
              <p className="cdHero__subtitle">
                {lang === 'en' ? course.enLongDesc ?? course.longDesc : course.longDesc}
              </p>

              <div className="cdHero__meta" aria-label={t('courseDetails.meta')}>
                <MetaItem icon={clockIcon} label={t('courseDetails.duration')} value={course.duration} />
                <MetaItem
                  icon={studentsIcon}
                  label={t('courseDetails.students')}
                  value={`${course.students}+`}
                />
                <MetaItem
                  icon={<LevelIcon />}
                  label={t('courseDetails.level')}
                  value={levelLabel ?? (lang === 'en' ? 'Beginner' : 'مبتدئ')}
                />
              </div>

              <div className="cdHero__priceRow">
                <p
                  className="cdHero__price"
                  aria-label={t('courseDetails.priceAria', { price: course.price })}
                >
                  {lang === 'en' ? (
                    <>
                      <span className="cdHero__priceValue">{priceValue}</span>
                      <span className="cdHero__priceCurrency">SAR</span>
                    </>
                  ) : (
                    <>
                      <span className="cdHero__priceCurrency">ر.س</span>
                      <span className="cdHero__priceValue">{priceValue}</span>
                    </>
                  )}
                </p>
               
               
              </div>
              <p className="cdHero__note">{t('courseDetails.oneTime')}</p>
              {isEnrolled ? (
                <a className="cdHero__buy" href={`/course/${encodeURIComponent(courseId)}/learn`}>
                  {t('learn.start') || (lang === 'en' ? 'Start learning' : 'ابدأ التعلم')}
                </a>
              ) : (
                <button
                  className="cdHero__buy"
                  type="button"
                  disabled={enrolling}
                  onClick={async () => {
                    if (enrolling) return
                    const token = (() => {
                      try {
                        return localStorage.getItem('token')
                      } catch {
                        return null
                      }
                    })()
                    if (!token) {
                      window.location.assign('/login')
                      return
                    }
                    window.location.assign(`/checkout?courseId=${encodeURIComponent(courseId)}`)
                  }}
                >
                  {t('courseDetails.buyNow')}
                </button>
              )}
            </div>

          </div>
        </section>

        <section className="cdCert" aria-label={t('courseDetails.certTitle')}>
          <div className="container cdCert__inner">
            <div className="cdCert__iconWrap" aria-hidden="true">
              <img className="cdCert__icon" src={featureCert} alt="" />
            </div>
            <div>
              <h2 className="cdCert__title">{t('courseDetails.certTitle')}</h2>
              <p className="cdCert__text">{t('courseDetails.certText')}</p>
            </div>
          </div>
        </section>

        <section className="cdCurr" aria-label={t('courseDetails.curriculumTitle')}>
          <div className="container">
            <div className="cdCurr__panel">
              <h2 className="cdCurr__title">{t('courseDetails.curriculumTitle')}</h2>
              <div className="cdCurr__list">
                {curriculumList.map((t, idx) => (
                  <AccordionItem
                    key={t}
                    title={t}
                    index={idx}
                    open={openIdx === idx}
                    onToggle={() => setOpenIdx((v) => (v === idx ? -1 : idx))}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="cdAudience" aria-label={t('courseDetails.audienceTitle')}>
          <div className="container">
            <div className="cdAudience__panel">
              <div className="cdAudience__illusWrap" aria-hidden="true">
                <img className="cdAudience__illusImg" src={audienceImage} alt="" loading="lazy" />
              </div>
              <div className="cdAudience__content">
                <h2 className="cdAudience__title">{t('courseDetails.audienceTitle')}</h2>
                <ul className="cdAudience__list" role="list">
                  {audienceList.map((a) => (
                    <li key={a} className="cdAudience__item">
                      
                      <span>{a}</span>
                      <span className="cdAudience__check" aria-hidden="true">
                        ✓
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

