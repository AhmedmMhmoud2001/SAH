import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import './home.css'
import './courses.css'
import './my-courses.css'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { getEnrollments, getMyCertificateRequests, requestCertificate, logout } from '../api/index.js'

function MyCourseCard({
  course,
  progressPercent,
  hrefContinue,
  certStatus,
  certImages,
  onRequestCert,
  requesting,
  t,
  lang,
}) {
  const title = lang === 'en' ? course.enTitle ?? course.title : course.title
  const shortDesc = lang === 'en' ? course.enShortDesc ?? course.shortDesc : course.shortDesc
  const hasCert = certStatus === 'approved'
  return (
    <article className="mcWideCard" aria-label={title}>
      <a className="mcWideCard__main" href={hrefContinue}>
        <div className="mcWideCard__thumb" aria-hidden="true">
          <img className="mcWideCard__img" src={course.image} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="mcWideCard__body">
          <h3 className="mcWideCard__title">{title}</h3>
          <p className="mcWideCard__desc">{shortDesc}</p>

          <div className="mcWideProg" aria-label={t('myCourses.progressAria', { p: progressPercent })}>
            <div className="mcWideProg__row">
              <span className="mcWideProg__pct">{t('myCourses.progressPct', { p: progressPercent })}</span>
            </div>
            <div className="mcWideProg__bar" role="progressbar" aria-valuenow={progressPercent}>
              <span className="mcWideProg__fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </a>

      <div className="mcWideCard__cta">
        {progressPercent >= 100 ? (
          hasCert ? (
            <a className="mcWideBtn" href={`/certificate/${encodeURIComponent(course.id)}`}>
              {lang === 'en' ? 'View certificate' : 'عرض الشهادة'}
            </a>
          ) : certStatus === 'rejected' ? (
            <button type="button" className="mcWideBtn" disabled>
              {lang === 'en' ? 'Certificate rejected' : 'تم رفض الشهادة'}
            </button>
          ) : certStatus === 'pending' ? (
            <button type="button" className="mcWideBtn" disabled>
              {lang === 'en' ? 'Certificate pending' : 'طلب الشهادة قيد المراجعة'}
            </button>
          ) : (
            <button type="button" className="mcWideBtn" onClick={onRequestCert} disabled={requesting}>
              {lang === 'en' ? 'Request certificate' : 'طلب شهادة'}
            </button>
          )
        ) : (
          <a className="mcWideBtn" href={hrefContinue}>
            {t('myCourses.continue')}
          </a>
        )}
      </div>
    </article>
  )
}

export default function MyCourses() {
  const { dir, lang, t } = useI18n()
  const [items, setItems] = useState([])
  const [certMap, setCertMap] = useState({})
  const [requestingCourseId, setRequestingCourseId] = useState('')
  const [certForm, setCertForm] = useState({ open: false, courseId: '', fullName: '', fullNameEn: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [enr, certs] = await Promise.all([
          getEnrollments({ lang }),
          getMyCertificateRequests(),
        ])
        if (cancelled) return
        const enrollments = Array.isArray(enr?.enrollments) ? enr.enrollments : []
        setItems(
          enrollments.map((e) => ({
            course: { ...e.course, id: e.courseId },
            progressPercent: Number(e.progress || 0),
            hrefContinue: `/course/${e.courseId}/learn`,
          })),
        )
        const reqs = Array.isArray(certs?.requests) ? certs.requests : []
        const map = {}
        reqs.forEach((r) => {
          if (r?.courseId) map[r.courseId] = r.status
        })
        setCertMap(map)
      } catch (e) {
        console.error(e)
        if (e?.status === 401) {
          logout()
          window.location.assign('/login')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lang])

  const sorted = useMemo(
    () => [...items].sort((a, b) => (b.progressPercent ?? 0) - (a.progressPercent ?? 0)),
    [items],
  )

  async function onRequestCert(courseId) {
    setCertForm({ open: true, courseId, fullName: '', fullNameEn: '' })
  }

  async function submitCertForm() {
    if (submitting) return
    const fullName = String(certForm.fullName || '').trim()
    const fullNameEn = String(certForm.fullNameEn || '').trim()
    if (!fullName) {
      alert(lang === 'en' ? 'Full name is required' : 'الاسم الرباعي مطلوب')
      return
    }
    if (!fullNameEn) {
      alert(lang === 'en' ? 'English full name is required' : 'الاسم بالإنجليزي مطلوب')
      return
    }
    setSubmitting(true)
    setRequestingCourseId(certForm.courseId)
    try {
      await requestCertificate({ courseId: certForm.courseId, fullName, fullNameEn })
      setCertMap((m) => ({ ...m, [certForm.courseId]: 'pending' }))
      setCertForm({ open: false, courseId: '', fullName: '', fullNameEn: '' })
    } catch (e) {
      console.error(e)
      if (e?.status === 401) {
        logout()
        window.location.assign('/login')
        return
      }
      if (e?.status === 409) {
        setCertMap((m) => ({ ...m, [certForm.courseId]: 'pending' }))
        setCertForm({ open: false, courseId: '', fullName: '', fullNameEn: '' })
        return
      }
      alert(lang === 'en' ? 'Failed to request certificate' : 'فشل إرسال طلب الشهادة')
    } finally {
      setSubmitting(false)
      setRequestingCourseId('')
    }
  }

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar authenticated homePath="/app" />
      <main className="myCoursesPage">
        <section className="myCoursesHero" aria-label={t('nav.myCourses')}>
          <div className="container">
            <header className="myCoursesHero__header">
              <h1 className="myCoursesHero__title">{t('nav.myCourses')}</h1>
              <p className="myCoursesHero__subtitle">{t('myCourses.subtitle')}</p>
            </header>

            {sorted.length ? (
              <section className="myCoursesWideGrid" aria-label={t('nav.myCourses')}>
                {sorted.map((it) => (
                  <MyCourseCard
                    key={it.course.id}
                    {...it}
                    certStatus={certMap[it.course.id] || null}
                    requesting={requestingCourseId === it.course.id || submitting}
                    onRequestCert={() => onRequestCert(it.course.id)}
                    t={t}
                    lang={lang}
                  />
                ))}
              </section>
            ) : (
              <div className="myCoursesEmpty">
                <p className="myCoursesEmpty__title">{t('myCourses.emptyTitle')}</p>
                <p className="myCoursesEmpty__text">{t('myCourses.emptyText')}</p>
                <a className="btn btn--primary" href="/courses">
                  {t('myCourses.browse')}
                </a>
              </div>
            )}
          </div>
        </section>

        {certForm.open ? (
          <div className="mcModal" role="dialog" aria-modal="true">
            <div
              className="mcModal__backdrop"
              onClick={() => (submitting ? null : setCertForm({ open: false, courseId: '', fullName: '', fullNameEn: '' }))}
            />
            <div className="mcModal__card">
              <h3 className="mcModal__title">{lang === 'en' ? 'Certificate request' : 'طلب شهادة'}</h3>
              <p className="mcModal__sub">{lang === 'en' ? 'Enter your full name as you want it on the certificate.' : 'اكتب الاسم الرباعي كما تريد ظهوره في الشهادة.'}</p>

              <label className="mcModal__label">{lang === 'en' ? 'Full name (4 parts)' : 'الاسم الرباعي'}</label>
              <input
                className="mcModal__input"
                value={certForm.fullName}
                onChange={(e) => setCertForm((s) => ({ ...s, fullName: e.target.value }))}
                placeholder={lang === 'en' ? 'First Middle Middle Last' : 'الاسم الأول - الثاني - الثالث - الرابع'}
                disabled={submitting}
              />

              <label className="mcModal__label">{lang === 'en' ? 'Full name (English)' : 'الاسم بالإنجليزي'}</label>
              <input
                className="mcModal__input"
                dir="ltr"
                value={certForm.fullNameEn}
                onChange={(e) => setCertForm((s) => ({ ...s, fullNameEn: e.target.value }))}
                placeholder="First Middle Middle Last"
                disabled={submitting}
              />

              <div className="mcModal__actions">
                <button
                  className="btn btn--secondary"
                  type="button"
                  disabled={submitting}
                  onClick={() => setCertForm({ open: false, courseId: '', fullName: '', fullNameEn: '' })}
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <button className="btn btn--primary" type="button" disabled={submitting} onClick={submitCertForm}>
                  {submitting ? (lang === 'en' ? 'Submitting...' : 'جاري الإرسال...') : lang === 'en' ? 'Submit request' : 'إرسال الطلب'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

