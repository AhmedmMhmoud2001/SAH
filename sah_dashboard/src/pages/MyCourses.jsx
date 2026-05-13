import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import { useI18n } from '../context/I18nContext'
import './pages.css'

export default function MyCourses() {
  const { t, lang } = useI18n()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [certMap, setCertMap] = useState({})
  const [requestingCourseId, setRequestingCourseId] = useState('')

  useEffect(() => {
    loadEnrollments()
  }, [lang])

  async function loadEnrollments() {
    try {
      const [res, certs] = await Promise.all([api.getEnrollments(lang), api.getMyCertificateRequests()])
      setEnrollments(res.enrollments || [])
      const reqs = Array.isArray(certs?.requests) ? certs.requests : []
      const map = {}
      reqs.forEach((r) => {
        if (r?.courseId) map[r.courseId] = r.status
      })
      setCertMap(map)
    } catch (err) {
      console.error('Failed to load enrollments:', err)
    } finally {
      setLoading(false)
    }
  }

  const sorted = useMemo(
    () => [...(enrollments || [])].sort((a, b) => (b?.progress ?? 0) - (a?.progress ?? 0)),
    [enrollments],
  )

  async function onRequestCertificate(courseId) {
    if (!courseId || requestingCourseId) return
    setRequestingCourseId(courseId)
    try {
      await api.requestCertificate(courseId)
      setCertMap((m) => ({ ...m, [courseId]: 'pending' }))
    } catch (err) {
      if (err?.response?.status === 409) {
        setCertMap((m) => ({ ...m, [courseId]: 'pending' }))
      } else {
        alert(t('myCourses.certRequestFailed'))
      }
    } finally {
      setRequestingCourseId('')
    }
  }

  return (
    <div className="dashboard-content">
      <main className="dashboard-main">
        <div className="container myCoursesPage">
          <section className="my-courses-section">
            <header className="myCoursesHeader">
              <h2 className="myCoursesTitle">{t('myCourses.title')}</h2>
            </header>

            {loading ? (
              <p>{t('msg.loading')}</p>
            ) : sorted.length === 0 ? (
              <div className="empty-state">
                <p>{t('myCourses.empty')}</p>
                <Link to="/courses" className="btn">
                  {t('myCourses.browseCourses')}
                </Link>
              </div>
            ) : (
              <div className="myCoursesGrid">
                {sorted.map((enrollment) => {
                  const progress = Number(enrollment.progress || 0)
                  const courseId = enrollment.courseId
                  const status = certMap[courseId] || null
                  const canRequest = progress >= 100 && !status
                  const title = enrollment.course?.title || ''
                  const imgUrl = api.resolveAssetUrl(enrollment.course?.image || '')
                  return (
                    <article key={enrollment.enrollmentId} className="myCourseCard">
                      <Link to={`/course/${courseId}/learn`} className="myCourseCard__main" aria-label={title}>
                        <div className="myCourseCard__thumb" aria-hidden="true">
                          {imgUrl ? <img src={imgUrl} alt="" loading="lazy" /> : null}
                        </div>
                        <div className="myCourseCard__body">
                          <h3 className="myCourseCard__title">{title}</h3>

                          <div className="myCourseProg">
                            <div className="myCourseProg__row">
                              <span className="myCourseProg__pct">{t('myCourses.progress', { pct: progress })}</span>
                            </div>
                            <div className="myCourseProg__bar" role="progressbar" aria-valuenow={progress}>
                              <span className="myCourseProg__fill" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </div>
                      </Link>

                      <div className="myCourseCard__cta">
                        {progress >= 100 ? (
                          status === 'approved' ? (
                            <button className="btn myCourseBtn" disabled>
                              {t('myCourses.certApproved')}
                            </button>
                          ) : status === 'pending' ? (
                            <button className="btn myCourseBtn" disabled>
                              {t('myCourses.certPending')}
                            </button>
                          ) : status === 'rejected' ? (
                            <button className="btn myCourseBtn" disabled>
                              {t('myCourses.certRejected')}
                            </button>
                          ) : (
                            <button
                              className="btn myCourseBtn"
                              type="button"
                              onClick={() => onRequestCertificate(courseId)}
                              disabled={!canRequest || requestingCourseId === courseId}
                            >
                              {requestingCourseId === courseId ? t('myCourses.requesting') : t('myCourses.requestCert')}
                            </button>
                          )
                        ) : (
                          <Link to={`/course/${courseId}/learn`} className="btn myCourseBtn">
                            {t('myCourses.completeCourse')}
                          </Link>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
