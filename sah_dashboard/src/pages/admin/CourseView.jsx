import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAdminCourse } from '../../api'
import { useI18n } from '../../context/I18nContext'

function asArray(v) {
  return Array.isArray(v) ? v : []
}

function apiOrigin() {
  const api = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  return api.replace(/\/api\/?$/, '')
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl
  return `${apiOrigin()}${imageUrl}`
}

export default function CourseView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, isRTL } = useI18n()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)

  function displayLevel(raw) {
    const v = String(raw || '').trim()
    if (!v) return '—'
    const key = v.toLowerCase()
    if (key === 'advanced') return isRTL ? t('level.advanced') : 'Advanced'
    if (key === 'intermediate') return isRTL ? t('level.intermediate') : 'Intermediate'
    if (key === 'beginner') return isRTL ? t('level.beginner') : 'Beginner'
    return v
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const c = await getAdminCourse(id)
        if (!mounted) return
        setCourse(c)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  const curriculum = useMemo(() => asArray(course?.curriculumParsed), [course])
  const enCurriculum = useMemo(() => asArray(course?.enCurriculumParsed), [course])
  const audience = useMemo(() => asArray(course?.audienceParsed), [course])
  const enAudience = useMemo(() => asArray(course?.enAudienceParsed), [course])

  if (loading) return <p>{t('msg.loading')}</p>
  if (!course) return <p>{t('msg.noData')}</p>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">{t('courses.details') || (isRTL ? 'تفاصيل الدورة' : 'Course Details')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/courses')}>
            {t('actions.back') || (isRTL ? 'رجوع' : 'Back')}
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>
            {t('actions.edit')}
          </button>
        </div>
      </div>

      <div className="modal" style={{ maxWidth: 900 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{t('courses.titleAr') || 'Title (AR)'}</div>
            <div style={{ fontWeight: 600 }}>{course.title}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{t('courses.titleEn') || 'Title (EN)'}</div>
            <div style={{ fontWeight: 600 }}>{course.enTitle || '—'}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{t('courses.code') || 'Code'}</div>
            <div style={{ fontWeight: 600 }}>{course.code}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{t('courses.price') || 'Price'}</div>
            <div style={{ fontWeight: 600 }}>{course.price} SAR</div>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{t('courses.duration') || 'Duration'}</div>
            <div style={{ fontWeight: 600 }}>{course.duration || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{t('courses.level') || 'Level'}</div>
            <div style={{ fontWeight: 600 }}>{displayLevel(course.level)}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Lessons</div>
            <div style={{ fontWeight: 600 }}>{course.lessonsCount ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Enrollments</div>
            <div style={{ fontWeight: 600 }}>{course.enrollmentsCount ?? 0}</div>
          </div>
        </div>

        {course.imageUrl ? (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Image</div>
            <img
              src={resolveImageUrl(course.imageUrl) || ''}
              alt=""
              style={{ marginTop: 8, width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 12 }}
            />
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>{course.imageUrl}</div>
          </div>
        ) : null}

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Short Desc (AR)</div>
            <div>{course.shortDesc || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Short Desc (EN)</div>
            <div>{course.enShortDesc || '—'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Long Desc (AR)</div>
            <div>{course.longDesc || '—'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Long Desc (EN)</div>
            <div>{course.enLongDesc || '—'}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>Curriculum (AR)</div>
          <ol style={{ marginTop: 6 }}>
            {curriculum.length ? curriculum.map((x, i) => <li key={`${x}-${i}`}>{x}</li>) : <li>—</li>}
          </ol>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, marginTop: 12 }}>Curriculum (EN)</div>
          <ol style={{ marginTop: 6 }}>
            {enCurriculum.length ? enCurriculum.map((x, i) => <li key={`${x}-${i}`}>{x}</li>) : <li>—</li>}
          </ol>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>Audience (AR)</div>
          <ul style={{ marginTop: 6 }}>
            {audience.length ? audience.map((x, i) => <li key={`${x}-${i}`}>{x}</li>) : <li>—</li>}
          </ul>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, marginTop: 12 }}>Audience (EN)</div>
          <ul style={{ marginTop: 6 }}>
            {enAudience.length ? enAudience.map((x, i) => <li key={`${x}-${i}`}>{x}</li>) : <li>—</li>}
          </ul>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>Certificate text (AR)</div>
          <div style={{ marginTop: 6 }}>{course.certificateText || '—'}</div>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, marginTop: 12 }}>Certificate text (EN)</div>
          <div style={{ marginTop: 6 }}>{course.enCertificateText || '—'}</div>
        </div>
      </div>
    </div>
  )
}

