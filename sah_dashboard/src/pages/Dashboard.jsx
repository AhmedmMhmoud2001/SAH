import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import * as api from '../api'
import './pages.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { isRTL } = useI18n()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.getCourses('ar', 1),
        api.getEnrollments('ar')
      ])
      setCourses(coursesRes.courses)
      setEnrollments(enrollmentsRes.enrollments || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const inProgress = enrollments
    .filter(e => e.progress > 0 && e.progress < 100)
    .slice(0, 2)

  return (
    <div className="dashboard-content">
      <main className="dashboard-main">

        <div className="container">
          <section className="welcome-section">
            <h2>{isRTL ? `مرحباً بعودتك، ${user?.name || ''}!` : `Welcome back, ${user?.name || ''}!`}</h2>
            <p>{isRTL ? 'واصل رحلتك التعليمية' : 'Continue your learning journey'}</p>
          </section>

          {inProgress.length > 0 && (
            <section className="continue-section">
              <h3>{isRTL ? 'أكمل التعلّم' : 'Continue Learning'}</h3>
              <div className="course-grid">
                {inProgress.map(enrollment => (
                  <Link 
                    key={enrollment.enrollmentId}
                    to={`/course/${enrollment.courseId}/learn`}
                    className="course-card"
                  >
                    <div className="course-image" />
                    <div className="course-info">
                      <h4>{enrollment.course?.title}</h4>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <p>{isRTL ? `${enrollment.progress}% مكتمل` : `${enrollment.progress}% complete`}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="courses-section">
            <h3>{isRTL ? 'كل الدورات' : 'All Courses'}</h3>
            {loading ? (
              <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
            ) : (
              <div className="course-grid">
                {courses.slice(0, 6).map(course => (
                  <Link 
                    key={course.id}
                    to={`/course/${course.id}`}
                    className="course-card"
                  >
                    <div className="course-image" />
                    <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>{course.duration} • {course.level}</p>
                      <p className="price">{isRTL ? `${course.price} ر.س` : `${course.price} SAR`}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}