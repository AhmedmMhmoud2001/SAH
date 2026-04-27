import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import './home.css'
import './auth.css'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { checkout as apiCheckout, getCourse, getOrderStatus, validateCoupon, logout } from '../api/index.js'

function readCourseId() {
  try {
    const sp = new URLSearchParams(window.location.search)
    return sp.get('courseId') || sp.get('id') || ''
  } catch {
    return ''
  }
}

export default function Checkout() {
  const { dir, lang, t } = useI18n()
  const courseId = readCourseId()
  const [course, setCourse] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const c = await getCourse(courseId, { lang })
        if (!cancelled) setCourse(c)
      } catch (e) {
        console.error(e)
        if (!cancelled) setCourse(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [courseId, lang])

  const price = useMemo(() => {
    const p = course?.price
    return typeof p === 'number' ? p : Number(p || 0)
  }, [course])

  async function onApplyCoupon() {
    if (!couponCode.trim()) {
      setSummary(null)
      return
    }
    setApplying(true)
    try {
      const res = await validateCoupon({ courseId, couponCode: couponCode.trim() })
      setSummary(res)
    } catch (e) {
      console.error(e)
      if (e?.status === 401) {
        logout()
        window.location.assign('/login')
        return
      }
      setSummary(null)
      alert(lang === 'en' ? 'Invalid coupon' : 'الكوبون غير صالح')
    } finally {
      setApplying(false)
    }
  }

  async function onConfirm() {
    setConfirming(true)
    try {
      const res = await apiCheckout({ courseId, couponCode: couponCode.trim() || undefined })
      if (res?.alreadyEnrolled) {
        window.location.assign(`/course/${courseId}/learn`)
        return
      }
      // New flow: wait for admin approval
      setOrderId(res?.orderId || '')
      setWaiting(true)
    } catch (e) {
      console.error(e)
      if (e?.status === 401) {
        logout()
        window.location.assign('/login')
        return
      }
      alert(lang === 'en' ? 'Checkout failed' : 'فشل إتمام الشراء')
    } finally {
      setConfirming(false)
    }
  }

  async function onCheckStatus() {
    if (!orderId) return
    setChecking(true)
    try {
      const res = await getOrderStatus(orderId)
      if (res?.status === 'paid') {
        window.location.assign(`/course/${courseId}/learn`)
        return
      }
      alert(lang === 'en' ? 'Still pending admin approval.' : 'مازال الطلب قيد انتظار موافقة الأدمن.')
    } catch (e) {
      console.error(e)
      if (e?.status === 401) {
        logout()
        window.location.assign('/login')
        return
      }
      alert(lang === 'en' ? 'Failed to check status' : 'فشل التحقق من حالة الطلب')
    } finally {
      setChecking(false)
    }
  }

  const title = lang === 'en' ? course?.enTitle ?? course?.title : course?.title
  const originalTotal = summary?.originalTotal ?? price
  const discountAmount = summary?.discountAmount ?? 0
  const finalTotal = summary?.finalTotal ?? price

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar />
      <main style={{ padding: '34px 0' }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
            {lang === 'en' ? 'Checkout' : 'إتمام الشراء'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>
            {lang === 'en' ? 'Apply a coupon if you have one.' : 'لو معك كوبون خصم، ضعه هنا.'}
          </p>

          {loading ? (
            <div style={{ padding: 18 }}>{t('msg.loading')}</div>
          ) : !course ? (
            <div style={{ padding: 18 }}>{lang === 'en' ? 'Course not found' : 'الدورة غير موجودة'}</div>
          ) : waiting ? (
            <div
              style={{
                background: 'var(--card-bg, #fff)',
                border: '1px solid rgba(15,23,42,.12)',
                borderRadius: 16,
                padding: 18,
                boxShadow: '0 14px 34px rgba(2,6,23,.06)',
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                {lang === 'en' ? 'Pending admin approval' : 'بانتظار موافقة الأدمن'}
              </h2>
              <p style={{ margin: '10px 0 0', color: 'var(--text-muted)' }}>
                {lang === 'en'
                  ? 'Your order was created successfully. You will be able to access the course after admin confirmation.'
                  : 'تم إنشاء طلبك بنجاح. ستتمكن من دخول الدورة بعد تأكيد الأدمن.'}
              </p>
              {orderId ? (
                <p style={{ margin: '10px 0 0', fontWeight: 800, fontSize: 13 }}>
                  {lang === 'en' ? 'Order ID:' : 'رقم الطلب:'} <span style={{ fontFamily: 'monospace' }}>{orderId}</span>
                </p>
              ) : null}

              <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <a className="btn btn--ghost" href="/my-courses">
                  {lang === 'en' ? 'My courses' : 'دوراتي'}
                </a>
                <button className="btn btn--primary" type="button" onClick={onCheckStatus} disabled={checking || !orderId}>
                  {checking ? (lang === 'en' ? 'Checking...' : 'جاري التحقق...') : (lang === 'en' ? 'Check status' : 'تحقق من الحالة')}
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'var(--card-bg, #fff)',
                border: '1px solid rgba(15,23,42,.12)',
                borderRadius: 16,
                padding: 18,
                boxShadow: '0 14px 34px rgba(2,6,23,.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{title}</h2>
                  <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
                    {lang === 'en' ? 'Course price' : 'سعر الدورة'}
                  </p>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {originalTotal} {lang === 'en' ? 'SAR' : 'ر.س'}
                </div>
              </div>

              <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
                <label style={{ fontWeight: 800 }}>{lang === 'en' ? 'Coupon code' : 'كود الكوبون'}</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. ACC10120' : 'مثال: ACC10120'}
                    style={{
                      flex: '1 1 260px',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(15,23,42,.12)',
                    }}
                  />
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={onApplyCoupon}
                    disabled={applying}
                    style={{ minWidth: 160 }}
                  >
                    {applying ? (lang === 'en' ? 'Applying...' : 'جاري التطبيق...') : (lang === 'en' ? 'Apply' : 'تطبيق')}
                  </button>
                </div>

                <div style={{ marginTop: 8, borderTop: '1px solid rgba(15,23,42,.08)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lang === 'en' ? 'Discount' : 'الخصم'}</span>
                    <span style={{ fontWeight: 800 }}>
                      -{discountAmount} {lang === 'en' ? 'SAR' : 'ر.س'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 900 }}>{lang === 'en' ? 'Total' : 'الإجمالي'}</span>
                    <span style={{ fontWeight: 900 }}>
                      {finalTotal} {lang === 'en' ? 'SAR' : 'ر.س'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <a className="btn btn--ghost" href={`/course/${courseId}`}>
                    {lang === 'en' ? 'Back' : 'رجوع'}
                  </a>
                  <button className="btn btn--primary" type="button" onClick={onConfirm} disabled={confirming}>
                    {confirming ? (lang === 'en' ? 'Confirming...' : 'جاري التأكيد...') : (lang === 'en' ? 'Confirm & Start' : 'تأكيد وابدأ')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

