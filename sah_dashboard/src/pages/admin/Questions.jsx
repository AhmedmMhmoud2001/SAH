import { useState, useEffect } from 'react'
import { Trash2, Edit, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { getAdminCourses, getAdminLessons, getAdminQuizzes } from '../../api'
import { getAdminQuestions, deleteAdminQuestion } from '../../api'

export default function Questions() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [quizId, setQuizId] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [courseId, quizId])

  async function loadData() {
    setLoading(true)
    try {
      const coursesRes = await getAdminCourses({ limit: 100 })
      setCourses(coursesRes.courses || [])

      const quizzesRes = await getAdminQuizzes({
        ...(courseId ? { courseId } : {}),
      })
      setQuizzes(quizzesRes.quizzes || [])

      const questionsRes = await getAdminQuestions({ quizId: quizId || undefined })
      setQuestions(questionsRes.questions || [])
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm(t('msg.confirmDelete'))) return
    try {
      await deleteAdminQuestion(id)
      loadData()
    } catch (err) {
      alert(t('msg.error'))
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('nav.questions')}</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate(quizId ? `/admin/questions/new?quizId=${encodeURIComponent(quizId)}` : '/admin/questions/new')}
        >
          <Plus size={18} style={{ marginInlineEnd: 8 }} />
          {t('actions.add')}
        </button>
      </div>

      <div className="filtersBar">
        <select 
          value={courseId} 
          onChange={(e) => { setCourseId(e.target.value); setQuizId('') }}
        >
          <option value="">{t('actions.allCourses') || 'All Courses'}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>

        <select
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
        >
          <option value="">{t('questions.allQuizzes')}</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.type} — {q.title || q.enTitle || q.id.slice(0, 8)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">{t('msg.loading')}</div>
      ) : questions.length === 0 ? (
        <div className="no-data">{t('msg.noData')}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th width="60">#</th>
              <th>{t('questions.question')}</th>
              <th>{t('quizzes.course')}</th>
              <th width="100">{t('questions.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, idx) => (
              <tr key={q.id}>
                <td>{idx + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{lang === 'ar' ? q.text : q.textEn}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t('questions.options')}: {(typeof q.options === 'string' ? JSON.parse(q.options) : q.options)?.join(' | ')}
                  </div>
                </td>
                <td>{q.quiz?.course?.title || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="action-btn" onClick={() => navigate(`/admin/questions/${q.id}/edit`)} title={t('actions.edit')}>
                      <Edit size={18} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(q.id)} title={t('actions.delete')}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}