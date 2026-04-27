import { useState, useEffect } from 'react'
import { Edit, Trash2, ExternalLink, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { getAdminCourses, getAdminLessons, deleteAdminLesson } from '../../api'

function apiOrigin() {
  try {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    return new URL(base).origin
  } catch {
    return 'http://localhost:3000'
  }
}

function resolveImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${apiOrigin()}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function Videos() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [courseId])

  async function loadData() {
    setLoading(true)
    try {
      const [lessonsRes, coursesRes] = await Promise.all([
        getAdminLessons({ courseId }),
        getAdminCourses({ limit: 100 })
      ])
      setLessons(lessonsRes.lessons || [])
      setCourses(coursesRes.courses || [])
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm(t('msg.confirmDelete'))) return
    try {
      await deleteAdminLesson(id)
      loadData()
    } catch (err) {
      alert(t('msg.error'))
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{t('nav.videos')}</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/videos/new')}>
          <Plus size={18} style={{ marginInlineEnd: 8 }} />
          {t('actions.add')}
        </button>
      </div>

      <div className="filtersBar">
        <select 
          value={courseId} 
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">{t('actions.allCourses')}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">{t('msg.loading')}</div>
      ) : lessons.length === 0 ? (
        <div className="no-data">{t('msg.noData')}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th width="60">#</th>
              <th>{t('courses.title')}</th>
              <th>{t('courses.duration')}</th>
              <th>{t('videos.video') || (t('nav.videos') || 'فيديو')}</th>
              <th width="100">{t('actions.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson, idx) => (
              <tr key={lesson.id}>
                <td>{idx + 1}</td>
                <td>
                  <div className="thumbCell">
                    {lesson.thumbnailUrl ? (
                      <img className="thumbCell__img" src={resolveImageUrl(lesson.thumbnailUrl)} alt="" />
                    ) : (
                      <span className="thumbCell__img" aria-hidden="true" />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{lesson.title}</div>
                      {lang === 'en' && lesson.enTitle ? (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lesson.enTitle}</div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td>{lesson.duration}</td>
                <td>
                  {lesson.videoUrl ? (
                    <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="action-btn" title={t('videos.watch') || 'مشاهدة'}>
                      <ExternalLink size={18} />
                    </a>
                  ) : '-'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => navigate(`/admin/videos/${lesson.id}/edit`)} title={t('actions.edit')}>
                      <Edit size={18} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(lesson.id)} title={t('actions.delete')}>
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