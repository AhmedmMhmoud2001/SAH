import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { getAdminCourses, getAdminQuizzes, createAdminQuestion } from '../../api'

export default function QuestionNew() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const presetQuizId = sp.get('quizId') || ''

  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    quizId: presetQuizId,
    text: '',
    textEn: '',
    options: ['', '', '', ''],
    optionsEn: ['', '', '', ''],
    correctIndex: 0,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getAdminCourses({ limit: 200 })
        if (!mounted) return
        const list = res.courses || []
        setCourses(list)
        setCourseId(list[0]?.id || '')
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
        const res = await getAdminQuizzes({ ...(courseId ? { courseId } : {}) })
        if (!mounted) return
        setQuizzes(res.quizzes || [])
        if (!form.quizId) {
          setForm((p) => ({ ...p, quizId: res.quizzes?.[0]?.id || '' }))
        }
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [courseId])

  function updateOption(index, value, isEn = false) {
    const key = isEn ? 'optionsEn' : 'options'
    const next = [...form[key]]
    next[index] = value
    setForm({ ...form, [key]: next })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await createAdminQuestion(form)
      navigate('/admin/questions')
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
        <h1>{t('actions.add')} Question</h1>
        <button className="btn" type="button" onClick={() => navigate('/admin/questions')}>
          {t('actions.cancel')}
        </button>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ minWidth: 240 }}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select value={form.quizId} onChange={(e) => setForm({ ...form, quizId: e.target.value })} style={{ minWidth: 280 }}>
            <option value="">Select Quiz</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.type} — {q.title || q.enTitle || q.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Question (Arabic)</label>
          <input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Question (English)</label>
          <input value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Options</label>
          {form.options.map((opt, i) => (
            <input key={i} value={opt} onChange={(e) => updateOption(i, e.target.value, false)} required />
          ))}
        </div>
        <div className="form-group">
          <label>Options (English)</label>
          {form.optionsEn.map((opt, i) => (
            <input key={i} value={opt} onChange={(e) => updateOption(i, e.target.value, true)} required />
          ))}
        </div>
        <div className="form-group">
          <label>Correct Answer Index (0-3)</label>
          <input
            type="number"
            min="0"
            max="3"
            value={form.correctIndex}
            onChange={(e) => setForm({ ...form, correctIndex: parseInt(e.target.value || '0') })}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving || !form.quizId}>
            {t('actions.save')}
          </button>
        </div>
      </form>
    </div>
  )
}

