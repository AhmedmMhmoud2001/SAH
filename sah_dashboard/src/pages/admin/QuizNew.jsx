import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { getAdminCourses, getAdminLessons, createAdminQuiz } from '../../api'

export default function QuizNew() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: 'lesson', courseId: '', lessonId: '', title: '', enTitle: '' })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getAdminCourses({ limit: 200 })
        if (!mounted) return
        const list = res.courses || []
        setCourses(list)
        const cid = list[0]?.id || ''
        setForm((p) => ({ ...p, courseId: p.courseId || cid }))
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getAdminLessons({ courseId: form.courseId })
        if (!mounted) return
        setLessons(res.lessons || [])
        setForm((p) => ({ ...p, lessonId: p.lessonId || (res.lessons?.[0]?.id || '') }))
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
      await createAdminQuiz({
        type: form.type,
        courseId: form.type === 'final' ? form.courseId : null,
        lessonId: form.type === 'lesson' ? form.lessonId : null,
        title: form.title,
        enTitle: form.enTitle,
      })
      navigate('/admin/quizzes')
    } catch (e) {
      console.error(e)
      alert(e?.response?.data?.error || t('msg.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('actions.add')} Quiz</h1>
        <button className="btn" type="button" onClick={() => navigate('/admin/quizzes')}>
          {t('actions.cancel')}
        </button>
      </div>

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
    </div>
  )
}

