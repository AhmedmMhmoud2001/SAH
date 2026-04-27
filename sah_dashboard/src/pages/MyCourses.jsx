import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import './pages.css'

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [certMap, setCertMap] = useState({})
  const [requestingCourseId, setRequestingCourseId] = useState('')

  useEffect(() => {
    loadEnrollments()
  }, [])

  async function loadEnrollments() {
    try {
      const [res, certs] = await Promise.all([api.getEnrollments('ar'), api.getMyCertificateRequests()])
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
      // If already requested, backend returns 409. Treat it as pending on UI.
      if (err?.response?.status === 409) {
        setCertMap((m) => ({ ...m, [courseId]: 'pending' }))
      } else {
        alert('Failed to request certificate')
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
              <h2 className="myCoursesTitle">دوراتي</h2>
            </header>
            
            {loading ? (
              <p>Loading...</p>
            ) : sorted.length === 0 ? (
              <div className="empty-state">
                <p>You haven't enrolled in any courses yet.</p>
                <Link to="/courses" className="btn">Browse Courses</Link>
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
                              <span className="myCourseProg__pct">مكتمل {progress}%</span>
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
                            <button className="btn myCourseBtn" disabled>تم اعتماد الشهادة</button>
                          ) : status === 'pending' ? (
                            <button className="btn myCourseBtn" disabled>طلب الشهادة قيد المراجعة</button>
                          ) : status === 'rejected' ? (
                            <button className="btn myCourseBtn" disabled>تم رفض طلب الشهادة</button>
                          ) : (
                            <button
                              className="btn myCourseBtn"
                              onClick={() => onRequestCertificate(courseId)}
                              disabled={!canRequest || requestingCourseId === courseId}
                            >
                              {requestingCourseId === courseId ? 'جاري الإرسال...' : 'طلب شهادة'}
                            </button>
                          )
                        ) : (
                          <Link to={`/course/${courseId}/learn`} className="btn myCourseBtn">أكمل الدورة</Link>
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