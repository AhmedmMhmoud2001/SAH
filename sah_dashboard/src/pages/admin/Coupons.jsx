import { useState, useEffect } from 'react'
import { Edit, Trash2, Plus, Tag } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { getAdminCoupons, getAdminCourses, createAdminCoupon, updateAdminCoupon, deleteAdminCoupon } from '../../api'
import './AdminPages.css'

export default function Coupons() {
  const { t } = useI18n()
  const [coupons, setCoupons] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [formData, setFormData] = useState({
    courseId: '',
    code: '', discountType: 'percentage', discountValue: 0, 
    minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, 
    startDate: '', expiryDate: '', isActive: true
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => { loadCoupons() }, [])

  async function loadCoupons() {
    try {
      const [data, coursesRes] = await Promise.all([
        getAdminCoupons(),
        getAdminCourses({ limit: 300 }),
      ])
      setCoupons(data.coupons || [])
      setCourses(coursesRes?.courses || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (isEdit) {
        await updateAdminCoupon(editingId, formData)
      } else {
        await createAdminCoupon(formData)
      }
      setShowModal(false)
      loadCoupons()
    } catch (error) {
      alert(t('coupons.saveFailed'))
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('coupons.deleteConfirm'))) return
    try {
      await deleteAdminCoupon(id)
      loadCoupons()
    } catch (error) {
      alert(t('coupons.deleteFailed'))
    }
  }

  function openAdd() {
    setIsEdit(false)
    setFormData({
      courseId: '',
      code: '', discountType: 'percentage', discountValue: 0, 
      minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, 
      startDate: '', expiryDate: '', isActive: true
    })
    setShowModal(true)
  }

  function openEdit(coupon) {
    setIsEdit(true)
    setEditingId(coupon.id)
    setFormData({
      courseId: coupon.courseId || coupon.course?.id || '',
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    })
    setShowModal(true)
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('coupons.title')}</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> {t('coupons.add')}</button>
      </div>

      {loading ? <p>{t('msg.loading')}</p> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('coupons.course') || t('quizzes.course') || 'Course'}</th>
              <th>{t('coupons.code')}</th>
              <th>{t('coupons.discount')}</th>
              <th>{t('coupons.limits')}</th>
              <th>{t('coupons.expiry')}</th>
              <th>{t('coupons.status')}</th>
              <th>{t('actions.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.course?.title || '-'}</td>
                <td><span className="badge badge-outline"><Tag size={12} style={{marginRight: '4px'}} /> {coupon.code}</span></td>
                <td>
                  {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' SAR'}
                </td>
                <td>
                  <div style={{fontSize: '12px'}}>
                    {t('coupons.minOrder')}: {coupon.minOrderAmount || 0} SAR<br/>
                    {t('coupons.usageLimit')}: {coupon.usageLimit || t('coupons.infinity')} ({coupon.usageCount} {t('coupons.used')})
                  </div>
                </td>
                <td>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : t('coupons.noExpiry')}</td>
                <td>
                  <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {coupon.isActive ? t('coupons.active') : t('coupons.inactive')}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => openEdit(coupon)} title={t('actions.edit')}>
                      <Edit size={18} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(coupon.id)} title={t('actions.delete')}>
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
            <h2>{isEdit ? t('coupons.edit') : t('coupons.add')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('quizzes.course') || 'Course'}</label>
                <select value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} required>
                  <option value="">{t('videos.selectCourse') || 'Select course'}</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('coupons.code')}</label>
                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>{t('coupons.type')}</label>
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                    <option value="percentage">{t('coupons.type.percentage')}</option>
                    <option value="fixed">{t('coupons.type.fixed')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('coupons.value')}</label>
                  <input type="number" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required />
                </div>
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>{t('coupons.minOrder')}</label>
                  <input type="number" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>{t('coupons.usageLimit')}</label>
                  <input type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>{t('coupons.expiryDate')}</label>
                <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                  {t('coupons.active')}
                </label>
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
