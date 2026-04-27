import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, Eye } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { getAdminUsers, updateAdminUser, deleteAdminUser, resolveAssetUrl, uploadAdminUserAvatar, getAdminRoles } from '../../api'
import './AdminPages.css'

export default function Users() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'student' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [roles, setRoles] = useState([
    { name: 'student' },
    { name: 'admin' },
  ])

  function getRoleLabel(roleName) {
    const normalized = String(roleName || '').trim().toLowerCase()
    if (!normalized) return '-'
    return t(`users.role.${normalized}`) || roleName
  }

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await getAdminUsers({ search })
      setUsers(data.users || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function loadRoles() {
    try {
      const data = await getAdminRoles()
      const list = Array.isArray(data?.roles) ? data.roles : []
      if (list.length) {
        setRoles(list)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await updateAdminUser(editingUserId, formData)
      if (avatarFile) {
        await uploadAdminUserAvatar(editingUserId, avatarFile)
      }
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', role: 'student' })
      setAvatarFile(null)
      loadUsers()
    } catch (error) {
      alert(error.response?.data?.error || t('users.saveFailed'))
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('msg.confirmDelete'))) return
    try {
      await deleteAdminUser(id)
      loadUsers()
    } catch (error) {
      alert(t('users.deleteFailed'))
    }
  }

  async function openEdit(user) {
    await loadRoles()
    setEditingUserId(user.id)
    setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role })
    setAvatarFile(null)
    setShowModal(true)
  }

  function handleView(user) {
    navigate(`/admin/users/${user.id}`)
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('users.title')}</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/users/new')}>+ {t('users.add')}</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder={t('actions.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn" onClick={loadUsers}>{t('actions.search')}</button>
      </div>

      {loading ? <p>{t('msg.loading')}</p> : users.length === 0 ? <p>{t('msg.noData')}</p> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('users.name')}</th>
              <th>Photo</th>
              <th>{t('users.email')}</th>
              <th>Phone</th>
              <th>{t('users.role')}</th>
              <th>{t('users.created')}</th>
              <th>{t('actions.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>
                  {user.avatarUrl ? (
                    <img
                      src={resolveAssetUrl(user.avatarUrl)}
                      alt={user.name}
                      style={{ width: 36, height: 36, borderRadius: '999px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '999px', background: '#e2e8f0', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                      {(user.name || 'U').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td><span className={`badge badge-${String(user.role || '').toLowerCase()}`}>{getRoleLabel(user.role)}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => handleView(user)} title={t('actions.view')}>
                      <Eye size={18} />
                    </button>
                    <button className="action-btn" onClick={() => openEdit(user)} title={t('actions.edit')}>
                      <Edit size={18} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(user.id)} title={t('actions.delete')}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('actions.edit')}</h2>
            <form onSubmit={handleSubmit}>
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
                <label>Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
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
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>{t('actions.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('actions.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}