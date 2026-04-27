import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { getAdminCourses, createAdminLesson, uploadLessonThumbnail } from '../../api'

export default function VideoNew() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [saving, setSaving] = useState(false)
  const [thumbFile, setThumbFile] = useState(null)
  const [thumbPreview, setThumbPreview] = useState('')
  const [form, setForm] = useState({
    title: '',
    enTitle: '',
    courseId: '',
    duration: '',
    videoUrl: '',
    thumbnailUrl: '',
    sortOrder: 1,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getAdminCourses({ limit: 200 })
        if (!mounted) return
        const list = res.courses || []
        setCourses(list)
        setForm((p) => ({ ...p, courseId: p.courseId || list[0]?.id || '' }))
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      let thumbnailUrl = form.thumbnailUrl
      if (thumbFile) {
        const up = await uploadLessonThumbnail(thumbFile)
        thumbnailUrl = up?.url || thumbnailUrl
      }
      await createAdminLesson({ ...form, thumbnailUrl })
      navigate('/admin/videos')
    } catch (e) {
      console.error(e)
      alert(t('msg.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('videos.addTitle')}</h1>
        <button className="btn" type="button" onClick={() => navigate('/admin/videos')}>
          {t('actions.cancel')}
        </button>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <div className="form-group">
          <label>{t('videos.titleAr')}</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>{t('videos.titleEn')}</label>
          <input value={form.enTitle} onChange={(e) => setForm({ ...form, enTitle: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>{t('videos.course')}</label>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
            <option value="">{t('videos.selectCourse')}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{t('videos.duration')}</label>
          <input
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder={t('videos.durationPlaceholder')}
          />
        </div>
        <div className="form-group">
          <label>{t('videos.videoUrl')}</label>
          <input type="url" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
        </div>
        <div className="form-group">
          <label>{t('videos.thumb')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null
              setThumbFile(f)
              setThumbPreview(f ? URL.createObjectURL(f) : '')
            }}
          />
          {thumbPreview ? (
            <div style={{ marginTop: 12 }}>
              <img
                src={thumbPreview}
                alt=""
                style={{ width: 220, height: 130, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }}
              />
            </div>
          ) : null}
        </div>
        <div className="form-group">
          <label>{t('videos.sortOrder')}</label>
          <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {t('actions.save')}
          </button>
        </div>
      </form>
    </div>
  )
}

