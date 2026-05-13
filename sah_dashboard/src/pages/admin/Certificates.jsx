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
              {t('cert.subtitle')}
            </p>
          </div>

          <div className="certFilters">
            <select className="certSelect" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">{t('cert.filter.pending')}</option>
              <option value="approved">{t('cert.filter.approved')}</option>
              <option value="rejected">{t('cert.filter.rejected')}</option>
              <option value="">{t('cert.filter.all')}</option>
            </select>
            <button className="btn btn-secondary" onClick={load} disabled={loading}>
              {loading ? t('msg.loading') : t('cert.refresh')}
            </button>
          </div>
        </div>

        <div className="certTableWrap">
          <table className="certTable">
            <thead>
              <tr>
                <th>{t('cert.col.student')}</th>
                <th>{t('cert.col.course')}</th>
                <th>{t('cert.col.status')}</th>
                <th>{t('cert.col.requestedAt')}</th>
                <th>{t('cert.col.actions')}</th>
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
                          placeholder={t('cert.ph.fullName')}
                          value={r.fullName || ''}
                          disabled
                        />
                        <input
                          className="certSelect"
                          type="text"
                          placeholder={t('cert.ph.fullNameEn')}
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
                          placeholder={t('cert.ph.notes')}
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
                            {t('cert.action.approve')}
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            className="btn btn-danger"
                            onClick={() => updateStatus(r.id, 'rejected')}
                            disabled={savingId === r.id}
                          >
                            {t('cert.action.reject')}
                          </button>
                        )}
                        {r.status !== 'pending' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => updateStatus(r.id, 'pending')}
                            disabled={savingId === r.id}
                          >
                            {t('cert.action.setPending')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                    {loading ? t('msg.loading') : t('cert.noRequests')}
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

