import { useEffect, useMemo, useState } from 'react'
import { Trash2, Edit } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { useNavigate } from 'react-router-dom'
import {
  getAdminCourses,
  getAdminLessons,
  getAdminQuizzes,
  bulkCreateMissingLessonQuizzes,
  deleteAdminQuiz,
} from '../../api'

export default function Quizzes() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [courseId, setCourseId] = useState('')
  const [type, setType] = useState('lesson') // lesson | final
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, type])

  async function load() {
    setLoading(true)
    try {
      const coursesRes = await getAdminCourses({ limit: 200 })
      setCourses(coursesRes.courses || [])
      const lessonsRes = await getAdminLessons({ courseId })
      setLessons(lessonsRes.lessons || [])
      const quizzesRes = await getAdminQuizzes({
        ...(courseId ? { courseId } : {}),
        ...(type ? { type } : {}),
      })
      setQuizzes(quizzesRes.quizzes || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function onDelete(id) {
    if (!window.confirm(t('msg.confirmDelete'))) return
    try {
      await deleteAdminQuiz(id)
      await load()
    } catch (e) {
      console.error(e)
      alert(t('msg.error'))
    }
  }

  async function onBulkCreateMissing() {
    if (!courseId) {
      alert(t('quizzes.selectCourseFirst'))
      return
    }
    try {
      const res = await bulkCreateMissingLessonQuizzes(courseId)
      alert(t('quizzes.createdCount', { n: res?.created ?? 0 }))
      await load()
    } catch (e) {
      console.error(e)
      alert(t('msg.error'))
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('nav.quizzes')}</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {type === 'lesson' ? (
            <button className="btn" onClick={onBulkCreateMissing} disabled={!courseId}>
              {t('quizzes.addMissingLessonQuizzes')}
            </button>
          ) : null}
          <button className="btn btn-primary" onClick={() => navigate('/admin/quizzes/new')}>
            + {t('actions.add')}
          </button>
        </div>
      </div>

      <div className="filtersBar">
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">{t('actions.allCourses') || 'All Courses'}</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="lesson">{t('quizzes.lessonQuizzes')}</option>
          <option value="final">{t('quizzes.finalQuizzes')}</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">{t('msg.loading')}</div>
      ) : quizzes.length === 0 ? (
        <div className="no-data">{t('msg.noData')}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th width="60">#</th>
              <th>{t('quizzes.type')}</th>
              <th>{t('quizzes.title')}</th>
              <th>{t('quizzes.course')}</th>
              <th>{t('quizzes.lesson')}</th>
              <th width="120">{t('quizzes.questions')}</th>
              <th width="120">{t('actions.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q, idx) => (
              <tr key={q.id}>
                <td>{idx + 1}</td>
                <td>{q.type}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{q.title || '-'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.enTitle || ''}</div>
                </td>
                <td>{q.course?.title || '-'}</td>
                <td>{q.lesson?.title || '-'}</td>
                <td>{q?._count?.questions ?? 0}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="action-btn" onClick={() => navigate(`/admin/quizzes/${q.id}/edit`)} title={t('actions.edit')}>
                      <Edit size={18} />
                    </button>
                    <button className="action-btn delete" onClick={() => onDelete(q.id)} title={t('actions.delete')}>
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

