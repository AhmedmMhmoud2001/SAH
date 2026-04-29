import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  approveAdminDeviceChangeRequest,
  clearAdminUserDevice,
  getAdminUser,
  getAdminRoles,
  getAdminUserDeviceChangeRequests,
  getAdminUserDevices,
  getUserProgress,
  revokeAdminUserDevice,
  rejectAdminDeviceChangeRequest,
  resolveAssetUrl,
  updateAdminUser,
  uploadAdminUserAvatar,
} from '../../api'
import { useI18n } from '../../context/I18nContext'
import './AdminPages.css'

export default function UserView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'student' })
  const [roles, setRoles] = useState([{ name: 'student' }, { name: 'admin' }])
  const [deviceRequests, setDeviceRequests] = useState([])
  const [loadingDeviceRequests, setLoadingDeviceRequests] = useState(true)
  const [deviceActionLoadingId, setDeviceActionLoadingId] = useState('')
  const [deviceError, setDeviceError] = useState('')
  const [devices, setDevices] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(true)

  function getRoleLabel(roleName) {
    const normalized = String(roleName || '').trim().toLowerCase()
    if (!normalized) return '-'
    return t(`users.role.${normalized}`) || roleName
  }

  async function loadData() {
    setLoading(true)
    setErrorMessage('')
    setDeviceError('')
    try {
      const [userData, progressData, deviceReqData, devicesData] = await Promise.all([
        getAdminUser(id),
        getUserProgress(id),
        getAdminUserDeviceChangeRequests(id, { status: 'pending' }).catch(() => ({ requests: [] })),
        getAdminUserDevices(id).catch(() => ({ devices: [] })),
      ])
      const rolesData = await getAdminRoles().catch(() => null)
      const roleList = Array.isArray(rolesData?.roles) ? rolesData.roles : []
      if (roleList.length) setRoles(roleList)
      setUser(userData)
      setFormData({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        role: userData?.role || 'student',
      })
      setProgress(Array.isArray(progressData) ? progressData : [])
      setDeviceRequests(Array.isArray(deviceReqData?.requests) ? deviceReqData.requests : [])
      setDevices(Array.isArray(devicesData?.devices) ? devicesData.devices : [])
    } catch (error) {
      setUser(null)
      setProgress([])
      setErrorMessage(error?.response?.data?.error || t('msg.error'))
    } finally {
      setLoading(false)
      setLoadingProgress(false)
      setLoadingDeviceRequests(false)
      setLoadingDevices(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  async function handleUpdate(e) {
    e.preventDefault()
    const updated = await updateAdminUser(id, formData)
    if (avatarFile) {
      const upload = await uploadAdminUserAvatar(id, avatarFile)
      setUser({ ...updated, avatarUrl: upload.avatarUrl })
    } else {
      setUser(updated)
    }
    setAvatarFile(null)
    setShowEditModal(false)
  }

  if (loading) return <p>{t('msg.loading')}</p>
  if (errorMessage) return <p>{errorMessage}</p>
  if (!user) return <p>{t('msg.noData')}</p>

  const deviceInfoParsed = (() => {
    const raw = user?.deviceInfo
    if (!raw) return null
    if (typeof raw !== 'string') return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })()

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('actions.view')} - {user.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => navigate('/admin/users')}>{t('actions.back') || 'Back'}</button>
          <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>{t('actions.edit')}</button>
        </div>
      </div>

      <div className="modal" style={{ maxWidth: 920 }}>
        <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: '96px 1fr', gap: 14, alignItems: 'center' }}>
          {user.avatarUrl ? (
            <img
              src={resolveAssetUrl(user.avatarUrl)}
              alt={user.name}
              style={{ width: 96, height: 96, borderRadius: '999px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: '999px', background: '#e2e8f0', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 28 }}>
              {(user.name || 'U').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div style={{ color: 'var(--text-secondary, #64748b)' }}>
            <div><strong>{t('users.name')}:</strong> {user.name}</div>
            <div><strong>{t('users.email')}:</strong> {user.email}</div>
            <div><strong>Phone:</strong> {user.phone || '-'}</div>
            <div><strong>{t('users.role')}:</strong> {getRoleLabel(user.role)}</div>
            <div><strong>{t('users.created')}:</strong> {new Date(user.createdAt).toLocaleString()}</div>
          </div>
        </div>

        <h3 style={{ marginBottom: '10px' }}>{t('device.title')}</h3>
        <div style={{ marginBottom: 18, color: 'var(--text-secondary, #64748b)' }}>
          <div style={{ marginBottom: 10 }}>
            <strong>{t('device.deviceId')}s:</strong>
            {loadingDevices ? (
              <span style={{ marginLeft: 8 }}>{t('msg.loading')}</span>
            ) : devices.length === 0 ? (
              <span style={{ marginLeft: 8 }}>-</span>
            ) : (
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {devices.slice(0, 2).map((d) => (
                  <div key={d.deviceId} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>
                      {d.deviceId}
                    </span>
                    <span>({d.boundAt ? new Date(d.boundAt).toLocaleString() : '-'})</span>
                    <button
                      className="btn"
                      onClick={async () => {
                        setDeviceError('')
                        try {
                          await revokeAdminUserDevice(user.id, d.deviceId)
                          await loadData()
                        } catch (e) {
                          setDeviceError(e?.response?.data?.error || t('msg.error'))
                        }
                      }}
                    >
                      {t('device.clear')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div><strong>{t('device.deviceId')}:</strong> {user.deviceId || '-'}</div>
          <div><strong>{t('device.boundAt')}:</strong> {user.deviceBoundAt ? new Date(user.deviceBoundAt).toLocaleString() : '-'}</div>
          <div><strong>{t('device.os')}:</strong> {deviceInfoParsed?.platform || '-'}</div>
          <div><strong>{t('device.userAgent')}:</strong> {deviceInfoParsed?.userAgent || '-'}</div>
          <div><strong>{t('device.language')}:</strong> {deviceInfoParsed?.language || '-'}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={async () => {
                setDeviceError('')
                try {
                  await clearAdminUserDevice(user.id)
                  await loadData()
                } catch (e) {
                  setDeviceError(e?.response?.data?.error || t('msg.error'))
                }
              }}
            >
              {t('device.clear')}
            </button>
          </div>
          {deviceError ? <p style={{ marginTop: 8, color: '#b91c1c' }}>{deviceError}</p> : null}
        </div>

        <h3 style={{ marginBottom: '10px' }}>{t('device.requests.title')}</h3>
        {loadingDeviceRequests ? (
          <p>{t('msg.loading')}</p>
        ) : deviceRequests.length === 0 ? (
          <p>{t('msg.noData')}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('device.requests.requestedAt')}</th>
                <th>{t('device.requests.newDeviceId')}</th>
                <th>{t('device.requests.userAgent')}</th>
                <th>{t('device.requests.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {deviceRequests.map((r) => {
                const info = (() => {
                  const raw = r?.newDeviceInfo
                  if (!raw || typeof raw !== 'string') return null
                  try {
                    return JSON.parse(raw)
                  } catch {
                    return null
                  }
                })()
                const isLoading = deviceActionLoadingId === r.id
                return (
                  <tr key={r.id}>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>
                      {r.newDeviceId}
                    </td>
                    <td style={{ maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {info?.userAgent || r.newDeviceInfo || '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-primary"
                          disabled={isLoading}
                          onClick={async () => {
                            setDeviceError('')
                            setDeviceActionLoadingId(r.id)
                            try {
                              await approveAdminDeviceChangeRequest(r.id)
                              await loadData()
                            } catch (e) {
                              setDeviceError(e?.response?.data?.error || t('msg.error'))
                            } finally {
                              setDeviceActionLoadingId('')
                            }
                          }}
                        >
                          {t('device.requests.approve')}
                        </button>
                        <button
                          className="btn"
                          disabled={isLoading}
                          onClick={async () => {
                            setDeviceError('')
                            setDeviceActionLoadingId(r.id)
                            try {
                              await rejectAdminDeviceChangeRequest(r.id)
                              await loadData()
                            } catch (e) {
                              setDeviceError(e?.response?.data?.error || t('msg.error'))
                            } finally {
                              setDeviceActionLoadingId('')
                            }
                          }}
                        >
                          {t('device.requests.reject')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <h3 style={{ marginBottom: '10px' }}>{t('nav.myCourses')}</h3>
        {loadingProgress ? (
          <p>{t('msg.loading')}</p>
        ) : progress.length === 0 ? (
          <p>{t('msg.noData')}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('nav.courses') || 'Course'}</th>
                <th>{t('reports.learning.completedLessons') || 'Completed'}</th>
                <th>{t('reports.learning.completionRate') || 'Progress'}</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((item) => (
                <tr key={item.courseId}>
                  <td>{item.courseName}</td>
                  <td>{item.completed}/{item.total}</td>
                  <td>{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('actions.edit')}</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>{t('users.name')}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{t('users.email')}</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('users.role')}</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  {roles.map((r) => (
                    <option key={r.name} value={r.name}>
                      {getRoleLabel(r.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>{t('actions.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('actions.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
