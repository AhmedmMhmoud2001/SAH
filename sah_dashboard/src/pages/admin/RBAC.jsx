import { useState, useEffect } from 'react'
import { Shield, ShieldAlert, ShieldCheck, Plus, Edit, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { getAdminRoles, getAdminPermissions, createAdminRole, updateAdminRole, deleteAdminRole } from '../../api'
import './AdminPages.css'

export default function RBAC() {
  const { t } = useI18n()
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPermissions: []
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([
        getAdminRoles(),
        getAdminPermissions()
      ])
      setRoles(rolesRes.roles || [])
      setPermissions(permsRes.permissions || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        permissions: formData.selectedPermissions
      }
      if (isEdit) {
        await updateAdminRole(editingId, payload)
      } else {
        await createAdminRole(payload)
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      alert(t('rbac.saveFailed'))
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('rbac.deleteConfirm'))) return
    try {
      await deleteAdminRole(id)
      loadData()
    } catch (error) {
      alert(error?.response?.data?.error || t('rbac.deleteFailed'))
    }
  }

  function openAdd() {
    setIsEdit(false)
    setFormData({ name: '', description: '', selectedPermissions: [] })
    setShowModal(true)
  }

  function openEdit(role) {
    setIsEdit(true)
    setEditingId(role.id)
    setFormData({
      name: role.name,
      description: role.description || '',
      selectedPermissions: role.permissions.map(p => p.permission.id)
    })
    setShowModal(true)
  }

  function togglePermission(id) {
    const next = formData.selectedPermissions.includes(id)
      ? formData.selectedPermissions.filter(pId => pId !== id)
      : [...formData.selectedPermissions, id]
    setFormData({ ...formData, selectedPermissions: next })
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('rbac.title')}</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> {t('rbac.createRole')}</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <p className="stat-card-title">{t('rbac.totalRoles')}</p>
          <p className="stat-card-value">{roles.length}</p>
          <div className="stat-card-icon" style={{ color: 'var(--primary)' }}>
            <ShieldCheck size={32} />
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">{t('rbac.availablePermissions')}</p>
          <p className="stat-card-value">{permissions.length}</p>
          <div className="stat-card-icon" style={{ color: 'var(--secondary)' }}>
            <ShieldAlert size={32} />
          </div>
        </div>
      </div>

      {loading ? <p>{t('msg.loading')}</p> : (
        <div className="roles-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('rbac.roleName')}</th>
                <th>{t('rbac.description')}</th>
                <th>{t('rbac.users')}</th>
                <th>{t('rbac.permissions')}</th>
                <th>{t('rbac.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Shield size={18} color={role.name === 'admin' ? 'var(--primary)' : 'var(--text-muted)'} />
                      <span style={{ fontWeight: 600 }}>{role.name.toUpperCase()}</span>
                    </div>
                  </td>
                  <td>{role.description || '-'}</td>
                  <td>{role._count?.users || 0}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {role.permissions.slice(0, 3).map(p => (
                        <span key={p.permission.id} className="badge badge-outline" style={{ fontSize: '10px' }}>
                          {p.permission.name}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="badge badge-outline" style={{ fontSize: '10px' }}>{t('rbac.more', { n: role.permissions.length - 3 })}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="action-btn" onClick={() => openEdit(role)} title={t('rbac.editRole')}>
                        <Edit size={18} />
                      </button>
                      {role.name !== 'admin' && (
                        <button className="action-btn delete" onClick={() => handleDelete(role.id)} title={t('rbac.deleteRole')}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <h2>{isEdit ? t('rbac.editRole') : t('rbac.createNewRole')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('rbac.roleNameLabel')}</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})} 
                  placeholder={t('rbac.roleNamePh')}
                  required 
                  disabled={isEdit && formData.name === 'admin'}
                />
              </div>
              <div className="form-group">
                <label>{t('rbac.description')}</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder={t('rbac.descriptionPh')}
                />
              </div>

              <div className="form-group">
                <label>{t('rbac.assignPermissions')}</label>
                <div className="permissions-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '10px', 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  padding: '10px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  {permissions.map(perm => (
                    <div 
                      key={perm.id} 
                      className={`perm-item ${formData.selectedPermissions.includes(perm.id) ? 'active' : ''}`}
                      onClick={() => togglePermission(perm.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'all 0.2s',
                        background: formData.selectedPermissions.includes(perm.id) ? 'var(--primary-light)' : 'transparent'
                      }}
                    >
                      {formData.selectedPermissions.includes(perm.id) 
                        ? <CheckCircle2 size={18} color="var(--primary)" /> 
                        : <Circle size={18} color="var(--text-muted)" />
                      }
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{perm.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{perm.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
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
