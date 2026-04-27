import { useState, useEffect } from 'react'
import { useI18n } from '../../context/I18nContext'
import api from '../../api'
import './AdminPages.css'

export default function Subscriptions() {
  const { t } = useI18n()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSubscriptions() }, [])

  async function loadSubscriptions() {
    try {
      const res = await api.get('/admin/subscriptions')
      setSubscriptions(res.data.subscriptions)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const classes = { active: 'badge-success', completed: 'badge-primary', expired: 'badge-danger', pending: 'badge-warning' }
    return classes[status] || 'badge'
  }

  if (loading) return <p>{t('msg.loading')}</p>

  return (
    <div className="admin-page">
      <h1 className="page-title">{t('subs.title')}</h1>

      <table className="data-table">
        <thead>
          <tr>
            <th>{t('subs.user')}</th>
            <th>{t('subs.course')}</th>
            <th>{t('subs.startDate')}</th>
            <th>{t('subs.status')}</th>
            <th>{t('subs.progress')}</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id}>
              <td>
                <div>
                  <p className="user-name">{sub.user?.name}</p>
                  <p className="user-email">{sub.user?.email}</p>
                </div>
              </td>
              <td>{sub.course?.title}</td>
              <td>{new Date(sub.enrolledAt).toLocaleDateString()}</td>
              <td>
                <span className={`badge ${getStatusBadge(sub.status)}`}>
                  {t(`subs.${sub.status}`) || sub.status}
                </span>
              </td>
              <td>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${sub.progress}%` }}></div>
                </div>
                <p className="progress-text">{sub.progress}%</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}