import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import {
  getAdminCourses,
  getAdminLesson,
  getAdminQuizzes,
  createAdminQuiz,
  updateAdminLesson,
  uploadLessonThumbnail,
} from '../../api'

export default function VideoEdit() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lessonQuiz, setLessonQuiz] = useState(null)
  const [quizBusy, setQuizBusy] = useState(false)
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
      setLoading(true)
      try {
        const [courseRes, lesson, quizzesRes] = await Promise.all([
          getAdminCourses({ limit: 200 }),
          getAdminLesson(id),
          getAdminQuizzes({ type: 'lesson', lessonId: id }),
        ])
        if (!mounted) return
        setCourses(courseRes.courses || [])
        setForm({
          title: lesson.title || '',
          enTitle: lesson.enTitle || '',
          courseId: lesson.courseId || '',
          duration: lesson.duration || '',
          videoUrl: lesson.videoUrl || '',
          thumbnailUrl: lesson.thumbnailUrl || '',
          sortOrder: lesson.sortOrder || 1,
        })
        setThumbPreview(lesson.thumbnailUrl || '')
        setLessonQuiz((quizzesRes?.quizzes || [])[0] || null)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  async function ensureLessonQuiz() {
    if (quizBusy) return
    if (!id) return
    setQuizBusy(true)
    try {
      if (lessonQuiz?.id) {
        navigate(`/admin/quizzes/${lessonQuiz.id}/edit`)
        return
      }
      const created = await createAdminQuiz({
        type: 'lesson',
        lessonId: id,
        title: `اختبار ${form.title || 'الدرس'}`,
        enTitle: `Quiz: ${form.enTitle || form.title || 'Lesson'}`,
      })
      navigate(`/admin/quizzes/${created.id}/edit`)
    } catch (e) {
      console.error(e)
      alert(t('msg.error'))
    } finally {
      setQuizBusy(false)
    }
  }

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
      await updateAdminLesson(id, { ...form, thumbnailUrl })
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
        <h1>{t('videos.editTitle')}</h1>
        <button className="btn" type="button" onClick={() => navigate('/admin/videos')}>
          {t('actions.cancel')}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t('msg.loading')}</div>
      ) : (
        <form className="card" onSubmit={onSubmit}>
          <div className="form-group">
            <label>{t('nav.quizzes')}</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {lessonQuiz?.id
                  ? t('videos.quizLinked', { title: lessonQuiz.title || lessonQuiz.id })
                  : t('videos.noQuizLinked')}
              </span>
              <button className="btn" type="button" onClick={ensureLessonQuiz} disabled={quizBusy}>
                {lessonQuiz?.id ? t('videos.editQuiz') : t('videos.addQuiz')} {t('nav.quizzes')}
              </button>
            </div>
          </div>
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
                setThumbPreview(f ? URL.createObjectURL(f) : (form.thumbnailUrl || ''))
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
      )}
    </div>
  )
}

