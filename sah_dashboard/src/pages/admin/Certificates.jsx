import { useEffect, useMemo, useState } from 'react'
import { getAdminCertificateRequests, updateAdminCertificateRequest } from '../../api'
import { useI18n } from '../../context/I18nContext'

function pillClass(status) {
  if (status === 'approved') return 'certPill certPill--approved'
  if (status === 'rejected') return 'certPill certPill--rejected'
  return 'certPill certPill--pending'
}

export default function Certificates() {
  const { t, isRTL } = useI18n()
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [savingId, setSavingId] = useState('')
  const [draft, setDraft] = useState({})

  async function load() {
    setLoading(true)
    try {
      const res = await getAdminCertificateRequests(status ? { status } : {})
      setItems(Array.isArray(res?.requests) ? res.requests : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const rows = useMemo(() => items, [items])

  async function updateStatus(id, nextStatus) {
    if (savingId) return
    setSavingId(id)
    try {
      const d = draft[id] || {}
      await updateAdminCertificateRequest(id, {
        status: nextStatus,
        startDate: d.startDate || undefined,
        endDate: d.endDate || undefined,
        notes: d.notes || undefined,
      })
      await load()
    } finally {
      setSavingId('')
    }
  }

  return (
    <div className="admin-page certPage" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-container">
        <div className="certHeader">
          <div>
            <h1 className="certHeader__title">{t('nav.certificates')}</h1>
            <p className="certHeader__sub">
              {isRTL
                ? 'مراجعة طلبات الشهادات واعتمادها'
                : 'Review and approve certificate requests'}
            </p>
          </div>

          <div className="certFilters">
            <select className="certSelect" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">{isRTL ? 'قيد المراجعة' : 'Pending'}</option>
              <option value="approved">{isRTL ? 'معتمدة' : 'Approved'}</option>
              <option value="rejected">{isRTL ? 'مرفوضة' : 'Rejected'}</option>
              <option value="">{isRTL ? 'الكل' : 'All'}</option>
            </select>
            <button className="btn btn-secondary" onClick={load} disabled={loading}>
              {loading ? (isRTL ? 'جاري التحميل...' : 'Loading...') : isRTL ? 'تحديث' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="certTableWrap">
          <table className="certTable">
            <thead>
              <tr>
                <th>{isRTL ? 'الطالب' : 'Student'}</th>
                <th>{isRTL ? 'الدورة' : 'Course'}</th>
                <th>{isRTL ? 'الحالة' : 'Status'}</th>
                <th>{isRTL ? 'تاريخ الطلب' : 'Requested at'}</th>
                <th>{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 1000 }}>{r.user?.name || '-'}</div>
                      <div style={{ opacity: 0.75, fontSize: 12 }}>{r.user?.email || ''}</div>
                    </td>
                    <td>{r.course?.title || '-'}</td>
                    <td>
                      <span className={pillClass(r.status)}>{r.status}</span>
                    </td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                    <td>
                      <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
                        <input
                          className="certSelect"
                          type="text"
                          placeholder={isRTL ? 'الاسم الرباعي للطالب (من الطلب)' : 'Student full name (from request)'}
                          value={r.fullName || ''}
                          disabled
                        />
                        <input
                          className="certSelect"
                          type="text"
                          placeholder={isRTL ? 'الاسم بالإنجليزي (من الطلب)' : 'English full name (from request)'}
                          value={r.fullNameEn || ''}
                          disabled
                        />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <input
                            className="certSelect"
                            type="date"
                            value={(draft[r.id]?.startDate ?? (r.startDate ? new Date(r.startDate).toISOString().slice(0, 10) : ''))}
                            onChange={(e) => setDraft((m) => ({ ...m, [r.id]: { ...(m[r.id] || {}), startDate: e.target.value } }))}
                          />
                          <input
                            className="certSelect"
                            type="date"
                            value={(draft[r.id]?.endDate ?? (r.endDate ? new Date(r.endDate).toISOString().slice(0, 10) : ''))}
                            onChange={(e) => setDraft((m) => ({ ...m, [r.id]: { ...(m[r.id] || {}), endDate: e.target.value } }))}
                          />
                        </div>
                        <input
                          className="certSelect"
                          type="text"
                          placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                          value={(draft[r.id]?.notes ?? (r.notes || ''))}
                          onChange={(e) => setDraft((m) => ({ ...m, [r.id]: { ...(m[r.id] || {}), notes: e.target.value } }))}
                        />
                      </div>
                      <div className="certActions">
                        {r.status !== 'approved' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => updateStatus(r.id, 'approved')}
                            disabled={savingId === r.id}
                          >
                            {isRTL ? 'اعتماد' : 'Approve'}
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            className="btn btn-danger"
                            onClick={() => updateStatus(r.id, 'rejected')}
                            disabled={savingId === r.id}
                          >
                            {isRTL ? 'رفض' : 'Reject'}
                          </button>
                        )}
                        {r.status !== 'pending' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => updateStatus(r.id, 'pending')}
                            disabled={savingId === r.id}
                          >
                            {isRTL ? 'إرجاع للمراجعة' : 'Set pending'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                    {loading ? (isRTL ? 'جاري التحميل...' : 'Loading...') : isRTL ? 'لا يوجد طلبات' : 'No requests'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

