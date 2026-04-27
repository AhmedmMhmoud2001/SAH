import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { downloadMyCertificatePdf, getMyCertificatePdf, getMyCertificateRequests, logout, resolveAssetUrl } from '../api/index.js'
import './my-courses.css'

function getCourseIdFromPath() {
  if (typeof window === 'undefined') return ''
  const p = window.location.pathname || ''
  const m = p.match(/\/certificate\/([^/]+)\/?$/i)
  return m ? decodeURIComponent(m[1]) : ''
}

export default function CertificateView() {
  const { dir, lang } = useI18n()
  const [loading, setLoading] = useState(true)
  const [reqs, setReqs] = useState([])
  const [pdfArUrl, setPdfArUrl] = useState('')
  const [pdfEnUrl, setPdfEnUrl] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const courseId = useMemo(getCourseIdFromPath, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getMyCertificateRequests()
        if (cancelled) return
        setReqs(Array.isArray(res?.requests) ? res.requests : [])
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
  }, [])

  const item = reqs.find((r) => String(r.courseId) === String(courseId)) || null
  const arUrl = item?.certificateImageArUrl ? resolveAssetUrl(item.certificateImageArUrl) : ''
  const enUrl = item?.certificateImageEnUrl ? resolveAssetUrl(item.certificateImageEnUrl) : ''

  async function loadPdf(which) {
    if (pdfLoading) return
    setPdfLoading(true)
    try {
      const blob = await getMyCertificatePdf(courseId, { lang: which })
      const url = URL.createObjectURL(blob)
      if (which === 'en') {
        if (pdfEnUrl) URL.revokeObjectURL(pdfEnUrl)
        setPdfEnUrl(url)
      } else {
        if (pdfArUrl) URL.revokeObjectURL(pdfArUrl)
        setPdfArUrl(url)
      }
    } catch (e) {
      if (e?.status === 401) {
        logout()
        window.location.assign('/login')
        return
      }
      alert(lang === 'en' ? 'Failed to generate PDF' : 'تعذر توليد ملف PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  async function downloadPdf(which) {
    if (pdfLoading) return
    setPdfLoading(true)
    try {
      const blob = await downloadMyCertificatePdf(courseId, { lang: which })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate_${courseId}_${which === 'en' ? 'en' : 'ar'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2500)
    } catch (e) {
      if (e?.status === 401) {
        logout()
        window.location.assign('/login')
        return
      }
      alert(lang === 'en' ? 'Failed to download PDF' : 'تعذر تنزيل ملف PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert(lang === 'en' ? 'Link copied' : 'تم نسخ الرابط')
    } catch {
      alert(lang === 'en' ? 'Copy failed' : 'تعذر نسخ الرابط')
    }
  }

  if (loading) {
    return (
      <div className="app" dir={dir} lang={lang}>
        <Navbar authenticated homePath="/app" />
        <main className="myCoursesPage">
          <div className="container" style={{ padding: '28px 0' }}>
            {lang === 'en' ? 'Loading...' : 'جاري التحميل...'}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!item || item.status !== 'approved') {
    return (
      <div className="app" dir={dir} lang={lang}>
        <Navbar authenticated homePath="/app" />
        <main className="myCoursesPage">
          <div className="container" style={{ padding: '28px 0' }}>
            <h2 style={{ margin: 0, fontWeight: 1000, color: 'rgba(11, 43, 79, 0.95)' }}>
              {lang === 'en' ? 'Certificate' : 'الشهادة'}
            </h2>
            <p style={{ marginTop: 10, color: 'rgba(15, 23, 42, 0.65)', fontWeight: 800 }}>
              {item?.status === 'rejected'
                ? (lang === 'en' ? 'Your certificate request was rejected.' : 'تم رفض طلب الشهادة.')
                : (lang === 'en'
                  ? 'Certificate is not available yet.'
                  : 'الشهادة غير متاحة الآن. تأكد من اعتماد الطلب.')}
            </p>
            {item?.status === 'rejected' && item?.notes ? (
              <p style={{ marginTop: 10, color: 'rgba(15, 23, 42, 0.55)', fontWeight: 800, lineHeight: 1.8 }}>
                {item.notes}
              </p>
            ) : null}
            <a className="mcWideBtn" href="/my-courses" style={{ width: 'fit-content' }}>
              {lang === 'en' ? 'Back' : 'رجوع'}
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar authenticated homePath="/app" />
      <main className="myCoursesPage">
        <div className="container" style={{ padding: '22px 0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontWeight: 1000, color: 'rgba(11, 43, 79, 0.95)' }}>
              {lang === 'en' ? 'Your certificate' : 'شهادتك'}
            </h2>
            <button className="mcWideBtn" type="button" onClick={copyLink}>
              {lang === 'en' ? 'Copy link' : 'مشاركة الرابط'}
            </button>
          </div>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
            <div className="mcWideCard" style={{ padding: 14 }}>
              <div style={{ fontWeight: 1000, marginBottom: 10 }}>{lang === 'en' ? 'Arabic' : 'عربي'}</div>
              {arUrl ? (
                <>
                  <a href={arUrl} target="_blank" rel="noreferrer">
                    <img src={arUrl} alt="Certificate AR" style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(15,23,42,0.10)' }} />
                  </a>
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a className="mcWideBtn" href={arUrl} download>
                      {lang === 'en' ? 'Download' : 'تنزيل'}
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  <button className="mcWideBtn" type="button" onClick={() => loadPdf('ar')} disabled={pdfLoading}>
                    {pdfLoading ? (lang === 'en' ? 'Generating...' : 'جاري التوليد...') : (lang === 'en' ? 'Generate PDF' : 'توليد PDF')}
                  </button>
                  {pdfArUrl ? (
                    <>
                      <a className="mcWideBtn" href={pdfArUrl} target="_blank" rel="noreferrer">
                        {lang === 'en' ? 'Open PDF' : 'فتح PDF'}
                      </a>
                      <button className="mcWideBtn" type="button" onClick={() => downloadPdf('ar')} disabled={pdfLoading}>
                        {lang === 'en' ? 'Download PDF' : 'تنزيل PDF'}
                      </button>
                    </>
                  ) : (
                    <div style={{ color: 'rgba(15,23,42,0.6)', fontWeight: 800 }}>
                      {lang === 'en' ? 'PDF not generated yet' : 'لم يتم توليد PDF بعد'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mcWideCard" style={{ padding: 14 }}>
              <div style={{ fontWeight: 1000, marginBottom: 10 }}>{lang === 'en' ? 'English' : 'إنجليزي'}</div>
              {enUrl ? (
                <>
                  <a href={enUrl} target="_blank" rel="noreferrer">
                    <img src={enUrl} alt="Certificate EN" style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(15,23,42,0.10)' }} />
                  </a>
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a className="mcWideBtn" href={enUrl} download>
                      {lang === 'en' ? 'Download' : 'تنزيل'}
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  <button className="mcWideBtn" type="button" onClick={() => loadPdf('en')} disabled={pdfLoading}>
                    {pdfLoading ? (lang === 'en' ? 'Generating...' : 'جاري التوليد...') : (lang === 'en' ? 'Generate PDF' : 'توليد PDF')}
                  </button>
                  {pdfEnUrl ? (
                    <>
                      <a className="mcWideBtn" href={pdfEnUrl} target="_blank" rel="noreferrer">
                        {lang === 'en' ? 'Open PDF' : 'فتح PDF'}
                      </a>
                      <button className="mcWideBtn" type="button" onClick={() => downloadPdf('en')} disabled={pdfLoading}>
                        {lang === 'en' ? 'Download PDF' : 'تنزيل PDF'}
                      </button>
                    </>
                  ) : (
                    <div style={{ color: 'rgba(15,23,42,0.6)', fontWeight: 800 }}>
                      {lang === 'en' ? 'PDF not generated yet' : 'لم يتم توليد PDF بعد'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <a className="mcWideBtn" href="/my-courses" style={{ width: 'fit-content' }}>
              {lang === 'en' ? 'Back to my courses' : 'الرجوع إلى دوراتي'}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

