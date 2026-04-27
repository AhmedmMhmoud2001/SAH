import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminCourse } from '../../api'
import CourseForm from './CourseForm'

function ensureStringArray(input) {
  if (Array.isArray(input)) return input.filter(Boolean).map(v => String(v))
  return []
}

export default function CourseEdit() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const c = await getAdminCourse(id)
        if (!mounted) return
        setCourse({
          ...c,
          curriculum: c.curriculumParsed ?? ensureStringArray(c.curriculum),
          enCurriculum: c.enCurriculumParsed ?? ensureStringArray(c.enCurriculum),
          curriculumDetails: Array.isArray(c.curriculumDetailsParsed) ? c.curriculumDetailsParsed : [],
          enCurriculumDetails: Array.isArray(c.enCurriculumDetailsParsed) ? c.enCurriculumDetailsParsed : [],
          audience: c.audienceParsed ?? ensureStringArray(c.audience),
          enAudience: c.enAudienceParsed ?? ensureStringArray(c.enAudience),
        })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return <p>Loading...</p>
  if (!course) return <p>Not found</p>

  return <CourseForm mode="edit" initialData={course} />
}

