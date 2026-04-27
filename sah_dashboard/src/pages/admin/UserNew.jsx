import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAdminUser, getAdminRoles, uploadAdminUserAvatar } from '../../api'
import { useI18n } from '../../context/I18nContext'
import './AdminPages.css'

export default function UserNew() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [roles, setRoles] = useState([{ name: 'student' }, { name: 'admin' }])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student',
  })

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getAdminRoles()
        const list = Array.isArray(data?.roles) ? data.roles : []
        if (list.length) setRoles(list)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

  function getRoleLabel(roleName) {
    const normalized = String(roleName || '').trim().toLowerCase()
    if (!normalized) return '-'
    return t(`users.role.${normalized}`) || roleName
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const created = await createAdminUser(formData)
      if (avatarFile && created?.id) {
        await uploadAdminUserAvatar(created.id, avatarFile)
      }
      navigate('/admin/users')
    } catch (error) {
      alert(error?.response?.data?.error || t('users.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('users.add')}</h1>
        <button className="btn" type="button" onClick={() => navigate('/admin/users')}>
          {t('actions.cancel')}
        </button>
      </div>

      <form className="card" onSubmit={handleSubmit}>
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
          <label>{t('users.password')}</label>
          <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
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
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? `${t('msg.loading')}` : t('actions.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
