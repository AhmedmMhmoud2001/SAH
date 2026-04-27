import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../api'
import './pages.css'

export default function CourseLearn() {
  const { id: courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [courseId])

  async function loadData() {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        api.getCourse(courseId, 'ar'),
        api.getLessons(courseId, 'ar')
      ])
      setCourse(courseRes)
      setLessons(lessonsRes.lessons || [])
      
      if (lessonsRes.lessons?.length > 0) {
        setActiveLesson(lessonsRes.lessons[0])
      }
      
      try {
        const progressRes = await api.getProgress(courseId)
        setProgress(progressRes)
      } catch {}
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkComplete(lessonId, completed) {
    try {
      const res = await api.markLessonComplete(courseId, lessonId, completed)
      setProgress(res)
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  function isCompleted(lessonId) {
    return progress?.completedLessons?.[lessonId]
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!course) return <div className="error">Course not found</div>

  const completedCount = lessons.filter(l => isCompleted(l.id)).length

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1>SAH Academy</h1>
            <nav className="header-nav">
              <Link to="/app">Home</Link>
              <Link to="/my-courses">My Courses</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="learn-main">
        <div className="learn-layout">
          <section className="video-section">
            {activeLesson?.videoUrl && (
              <div className="video-player">
                <iframe
                  src={activeLesson.videoUrl}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            <div className="video-info">
              <h3>{activeLesson?.title}</h3>
              <p>{completedCount}/{lessons.length} lessons completed</p>
              
              {activeLesson?.quiz && (
                <Link 
                  to={`/course/${courseId}/quiz/${activeLesson.quiz.id}`}
                  className="btn"
                >
                  Take Quiz
                </Link>
              )}
              
              <button 
                className={`btn ${isCompleted(activeLesson?.id) ? 'completed' : ''}`}
                onClick={() => handleMarkComplete(activeLesson?.id, !isCompleted(activeLesson?.id))}
              >
                {isCompleted(activeLesson?.id) ? '✓ Completed' : 'Mark Complete'}
              </button>
            </div>
          </section>

          <aside className="lessons-sidebar">
            <h3>Course Content</h3>
            <ul className="lessons-list">
              {lessons.map((lesson, i) => (
                <li 
                  key={lesson.id}
                  className={activeLesson?.id === lesson.id ? 'active' : ''}
                  onClick={() => setActiveLesson(lesson)}
                >
                  <span className="lesson-number">{i + 1}</span>
                  <div className="lesson-info">
                    <h4>{lesson.title}</h4>
                    <p>{lesson.duration}</p>
                  </div>
                  {isCompleted(lesson.id) && <span className="check">✓</span>}
                </li>
              ))}
            </ul>
            
            <Link to={`/course/${courseId}`} className="btn">
              Back to Course
            </Link>
          </aside>
        </div>
      </main>
    </div>
  )
}