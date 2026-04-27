import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../api'
import './pages.css'

export default function CourseDetails() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCourse()
  }, [id])

  async function loadCourse() {
    try {
      const res = await api.getCourse(id, 'ar')
      setCourse(res)
    } catch (err) {
      setError('Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  async function handleEnroll() {
    setEnrolling(true)
    try {
      await api.enroll(id)
      window.location.href = `/course/${id}/learn`
    } catch (err) {
      setError(err.response?.data?.error || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!course) return <div className="error">Course not found</div>

  return (
    <div className="dashboard-content">
      <main className="dashboard-main">

        <div className="container">
          <div className="course-details">
            {error && <div className="error">{error}</div>}
            
            <div className="course-hero">
              <div className="course-meta">
                <span>{course.duration}</span>
                <span>{course.level}</span>
                <span>{course.students} students</span>
              </div>
              
              <h2>{course.title}</h2>
              <p>{course.longDesc}</p>
              
              <div className="course-price">
                <span className="price-amount">{course.price}</span>
                <span className="price-currency">SAR</span>
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>

            {course.curriculum && (
              <div className="course-curriculum">
                <h3>Course Content</h3>
                <ul>
                  {course.curriculum.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {course.audience && (
              <div className="course-audience">
                <h3>Who is this course for?</h3>
                <ul>
                  {course.audience.map((item, i) => (
                    <li key={i}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}