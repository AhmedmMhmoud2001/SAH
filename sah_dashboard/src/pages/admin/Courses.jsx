import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, Eye } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { getAdminCourses, deleteAdminCourse } from '../../api'
import './AdminPages.css'

function apiOrigin() {
  const api = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  return api.replace(/\/api\/?$/, '')
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl
  return `${apiOrigin()}${imageUrl}`
}

function ensureStringArray(input) {
  if (Array.isArray(input)) return input.filter(Boolean).map(v => String(v))
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(v => String(v))
    } catch {
      // ignore
    }
  }
  return []
}

export default function Courses() {

  const { t, isRTL } = useI18n()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  function displayLevel(raw) {
    const v = String(raw || '').trim()
    if (!v) return '—'
    const key = v.toLowerCase()
    if (key === 'advanced') return isRTL ? t('level.advanced') : 'Advanced'
    if (key === 'intermediate') return isRTL ? t('level.intermediate') : 'Intermediate'
    if (key === 'beginner') return isRTL ? t('level.beginner') : 'Beginner'
    return v
  }

  useEffect(() => { loadCourses() }, [])

  async function loadCourses() {
    try {
      const data = await getAdminCourses()
      setCourses(data.courses || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm(t('msg.confirmDelete'))) return
    try {
      await deleteAdminCourse(id)
      loadCourses()
    } catch (error) {
      alert(t('msg.error'))
    }
  }

  function openAdd() {
    navigate('/admin/courses/new')
  }

  function openEdit(course) {
    navigate(`/admin/courses/${course.id}/edit`)
  }

  function openView(course) {
    navigate(`/admin/courses/${course.id}`)
  }

  if (loading) return <p>{t('msg.loading')}</p>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">{t('courses.title')}</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ {t('courses.add')}</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>{t('courses.title')}</th>
            <th>{t('courses.price')}</th>
            <th>{t('courses.duration')}</th>
            <th>{isRTL ? 'الطلاب' : 'Students'}</th>
            <th>{t('courses.level')}</th>
            <th>{t('actions.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>
                <div className="course-title-cell">
                  <div className="course-thumb">
                    {course.imageUrl ? (
                      <img
                        src={resolveImageUrl(course.imageUrl) || ''}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="course-title-text">{course.title}</div>
                </div>
              </td>
              <td>{isRTL ? `${course.price} ر.س` : `${course.price} SAR`}</td>
              <td>{course.duration}</td>
              <td>
                <span className="enrollment-badge">
                  <span className="enrollment-icon">👥</span>
                  {course.enrollmentsCount || 0}
                </span>
              </td>
              <td><span className="badge">{displayLevel(course.level)}</span></td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn" onClick={() => openEdit(course)} title={t('actions.edit')}>
                    <Edit size={18} />
                  </button>
                  <button className="action-btn" onClick={() => openView(course)} title={t('actions.view')}>
                    <Eye size={18} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(course.id)} title={t('actions.delete')}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}