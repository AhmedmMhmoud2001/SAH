import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { getAdminCourses, getAdminLessons, getAdminQuiz, updateAdminQuiz } from '../../api'

export default function QuizEdit() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: 'lesson', courseId: '', lessonId: '', title: '', enTitle: '' })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const [courseRes, quiz] = await Promise.all([getAdminCourses({ limit: 200 }), getAdminQuiz(id)])
        if (!mounted) return
        setCourses(courseRes.courses || [])
        setForm({
          type: quiz.type || 'lesson',
          courseId: quiz.courseId || quiz.course?.id || '',
          lessonId: quiz.lessonId || quiz.lesson?.id || '',
          title: quiz.title || '',
          enTitle: quiz.enTitle || '',
        })
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

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getAdminLessons({ courseId: form.courseId })
        if (!mounted) return
        setLessons(res.lessons || [])
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [form.courseId])

  const canSave = useMemo(() => {
    if (form.type === 'lesson') return !!form.lessonId
    if (form.type === 'final') return !!form.courseId
    return false
  }, [form])

  async function onSubmit(e) {
    e.preventDefault()
    if (saving) return
    if (!canSave) return
    setSaving(true)
    try {
      await updateAdminQuiz(id, {
        type: form.type,
        courseId: form.type === 'final' ? form.courseId : null,
        lessonId: form.type === 'lesson' ? form.lessonId : null,
        title: form.title,
        enTitle: form.enTitle,
      })
      navigate('/admin/quizzes')
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
        <h1>{t('actions.edit')} Quiz</h1>
        <button className="btn" type="button" onClick={() => navigate('/admin/quizzes')}>
          {t('actions.cancel')}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t('msg.loading')}</div>
      ) : (
        <form className="card" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
              <option value="lesson">lesson</option>
              <option value="final">final</option>
            </select>
          </div>
          <div className="form-group">
            <label>Course</label>
            <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          {form.type === 'lesson' ? (
            <div className="form-group">
              <label>Lesson</label>
              <select value={form.lessonId} onChange={(e) => setForm({ ...form, lessonId: e.target.value })} required>
                <option value="">Select lesson</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="form-group">
            <label>Title (AR)</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Title (EN)</label>
            <input value={form.enTitle} onChange={(e) => setForm({ ...form, enTitle: e.target.value })} />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={!canSave || saving}>
              {t('actions.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

