import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { getEnrollments, getMyCertificateRequests, logout } from '../api/index.js'
import './my-courses.css'

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString()
  } catch {
    return ''
  }
}

export default function Notifications() {
  const { dir, lang, t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [enr, certs] = await Promise.all([getEnrollments({ lang }), getMyCertificateRequests()])
        if (cancelled) return
        const enrollments = Array.isArray(enr?.enrollments) ? enr.enrollments : []
        const reqs = Array.isArray(certs?.requests) ? certs.requests : []

        const list = []
        enrollments.forEach((e) => {
          if (e?.status === 'pending') {
            list.push({
              id: `order_pending_${e.courseId}`,
              ts: e.enrolledAt || e.createdAt || new Date().toISOString(),
              title: lang === 'en' ? 'Purchase pending approval' : 'شراء الدورة قيد موافقة الإدارة',
              body: lang === 'en' ? `Course: ${e.course?.title || ''}` : `الدورة: ${e.course?.title || ''}`,
              href: `/course/${e.courseId}`,
            })
          }
          if (e?.status === 'paid') {
            list.push({
              id: `order_paid_${e.courseId}`,
              ts: e.enrolledAt || e.createdAt || new Date().toISOString(),
              title: lang === 'en' ? 'Course access approved' : 'تمت الموافقة على الوصول للدورة',
              body: lang === 'en' ? `Course: ${e.course?.title || ''}` : `الدورة: ${e.course?.title || ''}`,
              href: `/course/${e.courseId}/learn`,
            })
          }
        })

        reqs.forEach((r) => {
          const base = {
            id: `cert_${r.courseId}_${r.status}`,
            ts: r.updatedAt || r.createdAt || new Date().toISOString(),
            href: r.status === 'approved' ? `/certificate/${r.courseId}` : '/my-courses',
          }
          if (r.status === 'pending') {
            list.push({
              ...base,
              title: lang === 'en' ? 'Certificate request pending' : 'طلب الشهادة قيد المراجعة',
              body: lang === 'en' ? `Course ID: ${r.courseId}` : `معرّف الدورة: ${r.courseId}`,
            })
          } else if (r.status === 'approved') {
            list.push({
              ...base,
              title: lang === 'en' ? 'Certificate approved' : 'تم اعتماد الشهادة',
              body: lang === 'en' ? 'You can view and download it now.' : 'يمكنك الآن عرضها وتنزيلها.',
            })
          } else if (r.status === 'rejected') {
            list.push({
              ...base,
              title: lang === 'en' ? 'Certificate request rejected' : 'تم رفض طلب الشهادة',
              body: lang === 'en' ? (r.notes || '') : (r.notes || ''),
            })
          }
        })

        setItems(list)
      } catch (e) {
        if (e?.status === 401) {
          logout()
          window.location.assign('/login')
          return
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lang])

  const sorted = useMemo(() => [...items].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()), [items])

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar authenticated homePath="/app" />
      <main className="myCoursesPage">
        <section className="myCoursesHero" aria-label={t('nav.notifications')}>
          <div className="container">
            <header className="myCoursesHero__header">
              <h1 className="myCoursesHero__title">{t('nav.notifications')}</h1>
              <p className="myCoursesHero__subtitle">
                {lang === 'en' ? 'Updates about your courses and certificates.' : 'تحديثات عن دوراتك وطلبات الشهادات.'}
              </p>
            </header>

            {loading ? (
              <div className="mcWideCard" style={{ padding: 18 }}>
                {lang === 'en' ? 'Loading...' : 'جاري التحميل...'}
              </div>
            ) : sorted.length ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {sorted.map((n) => (
                  <a key={n.id} className="mcWideCard" href={n.href} style={{ padding: 16, textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 1000, color: 'rgba(11, 43, 79, 0.95)' }}>{n.title}</div>
                      <div style={{ fontWeight: 800, color: 'rgba(15, 23, 42, 0.55)', fontSize: 12 }}>{fmtDate(n.ts)}</div>
                    </div>
                    {n.body ? (
                      <div style={{ marginTop: 8, fontWeight: 800, color: 'rgba(15, 23, 42, 0.65)', lineHeight: 1.7 }}>
                        {n.body}
                      </div>
                    ) : null}
                  </a>
                ))}
              </div>
            ) : (
              <div className="myCoursesEmpty">
                <p className="myCoursesEmpty__title">{lang === 'en' ? 'No notifications yet' : 'لا توجد إشعارات بعد'}</p>
                <p className="myCoursesEmpty__text">{lang === 'en' ? 'You will see updates here.' : 'ستظهر التحديثات هنا.'}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

