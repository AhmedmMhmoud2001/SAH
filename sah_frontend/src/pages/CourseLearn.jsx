import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import './home.css'
import './learn.css'
import { useI18n } from '../i18n/I18nProvider.jsx'

import { getCourse, getLessons, getProgress, markLessonComplete, logout } from '../api/index.js'
import { getEnrollments } from '../api/index.js'

function useCourseIdFromUrl() {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : ''
  const parts = pathname.split('/').filter(Boolean)
  // /course/:id/learn
  if (parts[0] === 'course' && parts[1]) return parts[1]
  return 'c1'
}

function toProgressShape(api) {
  return {
    completed: api?.completedLessons ?? {},
    lastLessonId: api?.lastLessonId ?? null,
    quizScores: api?.quizScores ?? {},
  }
}

function YouTubeFrame({ url, title }) {
  return (
    <iframe
      className="learnPlayer__iframe"
      src={url}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  )
}

export default function CourseLearn() {
  const { dir, lang, t } = useI18n()
  const courseId = useCourseIdFromUrl()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [finalQuiz, setFinalQuiz] = useState(null)
  const [accessChecked, setAccessChecked] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Require enrollment with paid order (or manual enrollment without orderId).
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            window.location.assign(`/course/${courseId}`)
            return
          }
          const enr = await getEnrollments({ lang })
          const items = Array.isArray(enr?.enrollments) ? enr.enrollments : []
          const row = items.find((e) => e?.courseId === courseId || e?.course?.id === courseId)
          const ok = !!row && (!row.orderId || row.orderStatus === 'paid')
          if (!ok) {
            window.location.assign(`/checkout?courseId=${encodeURIComponent(courseId)}`)
            return
          }
        } finally {
          if (mounted) setAccessChecked(true)
        }

        const [c, l] = await Promise.all([
          getCourse(courseId, { lang }),
          getLessons(courseId, { lang }),
        ])
        if (!mounted) return
        setCourse(c)
        setLessons(l.lessons || [])
        setFinalQuiz(l.finalQuiz || null)
      } catch {
        if (!mounted) return
        setCourse(null)
        setLessons([])
        setFinalQuiz(null)
      }
    })()
    return () => {
      mounted = false
    }
  }, [courseId, lang])

  const courseTitle = lang === 'en' ? course?.enTitle ?? course?.title : course?.title

  const [progress, setProgress] = useState(() => toProgressShape(null))
  const [activeLessonId, setActiveLessonId] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const p = await getProgress(courseId)
        if (cancelled) return
        const next = toProgressShape(p)
        setProgress(next)
        setActiveLessonId(next.lastLessonId ?? null)
      } catch (e) {
        if (cancelled) return
        if (e?.status === 401) {
          logout()
          if (typeof window !== 'undefined') window.location.assign('/login')
          return
        }
        setProgress(toProgressShape(null))
        setActiveLessonId(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [courseId])

  useEffect(() => {
    if (!lessons.length) return
    setActiveLessonId((prev) => prev ?? lessons[0]?.id ?? null)
  }, [lessons])

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) ?? lessons[0],
    [lessons, activeLessonId],
  )

  async function setCompleted(lessonId, value) {
    try {
      const updated = await markLessonComplete(courseId, lessonId, value)
      const next = toProgressShape(updated)
      setProgress(next)
      setActiveLessonId(next.lastLessonId ?? lessonId)
    } catch (e) {
      console.error(e)
      if (e?.status === 401) {
        logout()
        if (typeof window !== 'undefined') window.location.assign('/login')
      }
    }
  }

  function setActive(lessonId) {
    setActiveLessonId(lessonId)
  }

  const completedCount = lessons.filter((l) => progress.completed?.[l.id]).length

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar />

      <main className="learnPage">
        {!accessChecked ? (
          <div className="container" style={{ padding: 24 }}>
            <p>{t('msg.loading')}</p>
          </div>
        ) : null}
        {!course ? (
          <div className="container" style={{ padding: 24 }}>
            <p>{t('msg.loading')}</p>
          </div>
        ) : null}
        <section className="learnHero" aria-label={t('learn.player')}>
          <div className="container learnHero__inner">
            <header className="learnHero__header">
              <h1 className="learnHero__title">{courseTitle}</h1>
              <p className="learnHero__subtitle">
                {t('learn.completed', { done: completedCount, total: lessons.length || 0 })}
              </p>
            </header>

            <div className="learnLayout">
              <section className="learnPlayer" aria-label={t('learn.videoArea')}>
                <div className="learnPlayer__frame">
                  {activeLesson?.type === 'youtube' && activeLesson?.videoUrl ? (
                    <YouTubeFrame url={activeLesson.videoUrl} title={activeLesson.title} />
                  ) : (
                    <div className="learnPlayer__empty">{t('learn.noVideo', {})}</div>
                  )}
                </div>

                <div className="learnPlayer__meta">
                  <h2 className="learnPlayer__title">
                    {lang === 'en'
                      ? activeLesson?.enTitle ?? activeLesson?.title ?? '—'
                      : activeLesson?.title ?? '—'}
                  </h2>
                  <div className="learnPlayer__actions">
                    {activeLesson?.quiz ? (
                      <a
                        className="learnBtn learnBtn--ghost"
                        href={`/course/${courseId}/quiz/${activeLesson.quiz.id}`}
                      >
                        {t('learn.quiz')}
                      </a>
                    ) : (
                      <span className="learnHint">{t('learn.noQuiz')}</span>
                    )}
                    <label className="learnCheck">
                      <input
                        type="checkbox"
                        checked={!!progress.completed?.[activeLesson?.id]}
                        onChange={(e) => setCompleted(activeLesson.id, e.target.checked)}
                      />
                      <span>{t('learn.finishVideo')}</span>
                    </label>
                  </div>
                </div>
              </section>

              <aside className="learnList" aria-label={t('learn.videosList')}>
                <div className="learnList__header">
                  <h2 className="learnList__title">{t('learn.videos')}</h2>
                  <a
                    className="learnBtn learnBtn--primary"
                    href={
                      finalQuiz?.id
                        ? `/course/${courseId}/final-quiz/${finalQuiz.id}`
                        : `/course/${courseId}/final-quiz`
                    }
                  >
                    {t('learn.finalQuiz')}
                  </a>
                </div>

                <ol className="learnItems" role="list">
                  {lessons.map((l, idx) => {
                    const done = !!progress.completed?.[l.id]
                    const active = l.id === activeLesson?.id
                    return (
                      <li
                        key={l.id}
                        className={active ? 'learnItem learnItem--active' : 'learnItem'}
                      >
                        <button
                          type="button"
                          className="learnItem__main"
                          onClick={() => setActive(l.id)}
                        >
                          <span className="learnItem__index" aria-hidden="true">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="learnItem__text">
                            <span className="learnItem__title">
                              {lang === 'en' ? l.enTitle ?? l.title : l.title}
                            </span>
                            <span className="learnItem__sub">
                              <span className="learnItem__time">{l.duration ?? '—'}</span>
                              {l.quiz ? (
                                <a
                                  className="learnItem__quiz"
                                  href={`/course/${courseId}/quiz/${l.quiz.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t('learn.quiz')}
                                </a>
                              ) : null}
                            </span>
                          </span>
                        </button>

                        <label
                          className="learnItem__check"
                          aria-label={t('learn.markCompleted')}
                        >
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={(e) => setCompleted(l.id, e.target.checked)}
                          />
                        </label>
                      </li>
                    )
                  })}
                </ol>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

