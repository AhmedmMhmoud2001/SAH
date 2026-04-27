import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAdminCourse, updateAdminCourse, uploadCourseImage } from '../../api'
import { useI18n } from '../../context/I18nContext'

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function CourseForm({ mode, initialData }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState(() => ({
    title: '',
    enTitle: '',
    code: '',
    shortDesc: '',
    enShortDesc: '',
    longDesc: '',
    enLongDesc: '',
    duration: '',
    level: '',
    price: 0,
    curriculum: [],
    enCurriculum: [],
    curriculumDetails: [],
    enCurriculumDetails: [],
    audience: [],
    enAudience: [],
    certificateText: '',
    enCertificateText: '',
    imageUrl: '',
    isFeatured: false,
    ...initialData,
  }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      let payload = { ...formData }
      if (imageFile) {
        const uploaded = await uploadCourseImage(imageFile)
        if (uploaded?.url) payload.imageUrl = uploaded.url
      }
      if (mode === 'edit') {
        await updateAdminCourse(formData.id, payload)
        navigate(`/admin/courses/${formData.id}`)
      } else {
        const created = await createAdminCourse(payload)
        navigate(`/admin/courses/${created.id}`)
      }
    } catch (e2) {
      alert('Error saving course')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">{mode === 'edit' ? t('courses.edit') : t('courses.add')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="modal" style={{ maxWidth: 900 }}>
        <div className="form-group">
          <label>{t('courses.titleAr') || 'Title (Arabic)'}</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>{t('courses.titleEn') || 'Title (English)'}</label>
          <input type="text" value={formData.enTitle} onChange={(e) => setFormData({ ...formData, enTitle: e.target.value })} />
        </div>
        <div className="form-group">
          <label>{t('courses.code') || 'Code'}</label>
          <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>{t('courses.image') || 'Course image (upload)'}</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          {formData.imageUrl ? (
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Current: {formData.imageUrl}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label className="checkbox-field">
            <input
              type="checkbox"
              className="checkbox-field__input"
              checked={!!formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            />
            <span>{t('courses.featured') || 'Featured course'}</span>
          </label>
        </div>

        <div className="form-group">
          <label>{t('courses.shortDescAr') || 'Short Description (Arabic)'}</label>
          <textarea value={formData.shortDesc} onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })} rows={3} />
        </div>
        <div className="form-group">
          <label>{t('courses.shortDescEn') || 'Short Description (English)'}</label>
          <textarea value={formData.enShortDesc} onChange={(e) => setFormData({ ...formData, enShortDesc: e.target.value })} rows={3} />
        </div>
        <div className="form-group">
          <label>{t('courses.longDescAr') || 'Long Description (Arabic)'}</label>
          <textarea value={formData.longDesc} onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })} rows={4} />
        </div>
        <div className="form-group">
          <label>{t('courses.longDescEn') || 'Long Description (English)'}</label>
          <textarea value={formData.enLongDesc} onChange={(e) => setFormData({ ...formData, enLongDesc: e.target.value })} rows={4} />
        </div>

        <div className="form-group">
          <label>{t('courses.price') || 'Price'}</label>
          <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>{t('courses.duration') || 'Duration'}</label>
          <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
        </div>
        <div className="form-group">
          <label>{t('courses.level') || 'Level'}</label>
          <select value={formData.level || ''} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
            <option value="">{t('courses.selectLevel') || (t('actions.select') || 'اختر')}</option>
            <option value="Beginner">{t('level.beginner') || 'Beginner'}</option>
            <option value="Intermediate">{t('level.intermediate') || 'Intermediate'}</option>
            <option value="Advanced">{t('level.advanced') || 'Advanced'}</option>
          </select>
        </div>

        <div className="form-group">
          <label>Curriculum (Arabic) — modules (title + description)</label>
          <div style={{ display: 'grid', gap: 10 }}>
            {(formData.curriculumDetails || []).map((m, idx) => (
              <div key={idx} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 10 }}>
                <input
                  type="text"
                  placeholder="Title (AR)"
                  value={m?.title || ''}
                  onChange={(e) => {
                    const next = [...(formData.curriculumDetails || [])]
                    next[idx] = { ...(next[idx] || {}), title: e.target.value }
                    setFormData({ ...formData, curriculumDetails: next })
                  }}
                />
                <textarea
                  placeholder="Description (AR)"
                  value={m?.description || ''}
                  onChange={(e) => {
                    const next = [...(formData.curriculumDetails || [])]
                    next[idx] = { ...(next[idx] || {}), description: e.target.value }
                    setFormData({ ...formData, curriculumDetails: next })
                  }}
                  rows={3}
                  style={{ marginTop: 8 }}
                />
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      const next = [...(formData.curriculumDetails || [])]
                      next.splice(idx, 1)
                      setFormData({ ...formData, curriculumDetails: next })
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setFormData({
                    ...formData,
                    curriculumDetails: [...(formData.curriculumDetails || []), { title: '', description: '' }],
                  })
                }
              >
                + Add module (AR)
              </button>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Curriculum (English) — modules (title + description)</label>
          <div style={{ display: 'grid', gap: 10 }}>
            {(formData.enCurriculumDetails || []).map((m, idx) => (
              <div key={idx} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 10 }}>
                <input
                  type="text"
                  placeholder="Title (EN)"
                  value={m?.title || ''}
                  onChange={(e) => {
                    const next = [...(formData.enCurriculumDetails || [])]
                    next[idx] = { ...(next[idx] || {}), title: e.target.value }
                    setFormData({ ...formData, enCurriculumDetails: next })
                  }}
                />
                <textarea
                  placeholder="Description (EN)"
                  value={m?.description || ''}
                  onChange={(e) => {
                    const next = [...(formData.enCurriculumDetails || [])]
                    next[idx] = { ...(next[idx] || {}), description: e.target.value }
                    setFormData({ ...formData, enCurriculumDetails: next })
                  }}
                  rows={3}
                  style={{ marginTop: 8 }}
                />
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      const next = [...(formData.enCurriculumDetails || [])]
                      next.splice(idx, 1)
                      setFormData({ ...formData, enCurriculumDetails: next })
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setFormData({
                    ...formData,
                    enCurriculumDetails: [...(formData.enCurriculumDetails || []), { title: '', description: '' }],
                  })
                }
              >
                + Add module (EN)
              </button>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Audience (Arabic) — one per line</label>
          <textarea value={(formData.audience || []).join('\n')} onChange={(e) => setFormData({ ...formData, audience: splitLines(e.target.value) })} rows={3} />
        </div>
        <div className="form-group">
          <label>Audience (English) — one per line</label>
          <textarea value={(formData.enAudience || []).join('\n')} onChange={(e) => setFormData({ ...formData, enAudience: splitLines(e.target.value) })} rows={3} />
        </div>

        <div className="form-group">
          <label>Certificate text (Arabic) (per-course)</label>
          <textarea value={formData.certificateText} onChange={(e) => setFormData({ ...formData, certificateText: e.target.value })} rows={3} />
        </div>
        <div className="form-group">
          <label>Certificate text (English) (per-course)</label>
          <textarea value={formData.enCertificateText} onChange={(e) => setFormData({ ...formData, enCertificateText: e.target.value })} rows={3} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/courses')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

