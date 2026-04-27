import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import './home.css'
import './learn.css'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { toastSuccess } from '../ui/toast.js'

import { getCourse, getFinalQuiz, getQuiz, submitQuiz, logout } from '../api/index.js'

function parseQuizRoute() {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : ''
  const parts = pathname.split('/').filter(Boolean)
  // /course/:id/quiz/:quizId
  if (parts[0] === 'course' && parts[1] && parts[2] === 'quiz' && parts[3]) {
    return { courseId: parts[1], type: 'lesson', quizId: parts[3] }
  }
  // /course/:id/final-quiz/:quizId (preferred)
  if (parts[0] === 'course' && parts[1] && parts[2] === 'final-quiz' && parts[3]) {
    return { courseId: parts[1], type: 'final', quizId: parts[3] }
  }
  // /course/:id/final-quiz (fallback; we'll resolve quizId via API)
  if (parts[0] === 'course' && parts[1] && parts[2] === 'final-quiz') {
    return { courseId: parts[1], type: 'final', quizId: null }
  }
  return { courseId: 'c1', type: 'final', quizId: null }
}

export default function Quiz() {
  const { dir, lang, t } = useI18n()
  const route = parseQuizRoute()
  const [course, setCourse] = useState(null)
  const [quizId, setQuizId] = useState(route.quizId)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitRes, setSubmitRes] = useState(null)

  useEffect(() => {
    let cancelled = false
    setQuizId(route.quizId)
    setSubmitted(false)
    setSubmitRes(null)
    setAnswers({})
    ;(async () => {
      setLoading(true)
      try {
        const c = await getCourse(route.courseId, { lang })
        if (cancelled) return
        setCourse(c)

        let qid = route.quizId
        if (!qid && route.type === 'final') {
          const fq = await getFinalQuiz(route.courseId, { lang })
          qid = fq?.id || null
        }
        if (cancelled) return
        setQuizId(qid)
        if (!qid) {
          setQuiz(null)
          return
        }
        const q = await getQuiz(qid, { lang })
        if (cancelled) return
        setQuiz(q)
      } catch (e) {
        console.error(e)
        if (e?.status === 401) {
          logout()
          if (typeof window !== 'undefined') window.location.assign('/login')
        }
        if (!cancelled) {
          setCourse(null)
          setQuiz(null)
          setQuizId(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [route.courseId, route.type, route.quizId, lang])

  const quizTitle = useMemo(() => {
    if (!quiz) return lang === 'en' ? 'Quiz' : 'اختبار'
    return quiz?.title || (lang === 'en' ? 'Quiz' : 'اختبار')
  }, [quiz, lang])

  const courseTitle = useMemo(() => {
    if (!course) return '—'
    return lang === 'en' ? course.enTitle ?? course.title : course.title
  }, [course, lang])

  async function onSubmit(e) {
    e.preventDefault()
    if (!quizId || !quiz?.questions?.length) return
    if (submitted) return
    setSubmitted(true)
    try {
      const orderedAnswers = (quiz.questions || []).map((_, idx) =>
        answers[idx] === undefined ? null : answers[idx],
      )
      const res = await submitQuiz(quizId, orderedAnswers)
      setSubmitRes(res)
      toastSuccess(t('toast.quizSaved', { score: res?.score ?? 0, total: res?.total ?? 0 }))
    } catch (e) {
      console.error(e)
      setSubmitted(false)
      if (e?.status === 401) {
        logout()
        if (typeof window !== 'undefined') window.location.assign('/login')
      } else {
        alert(lang === 'en' ? 'Failed to submit quiz' : 'فشل إرسال الاختبار')
      }
    }
  }

  const backHref =
    route.type === 'final'
      ? `/course/${route.courseId}/learn`
      : `/course/${route.courseId}/learn`

  return (
    <div className="app" dir={dir} lang={lang}>
      <Navbar />

      <main className="quizPage">
        <section className="quizShell" aria-label={quizTitle}>
          <div className="container">
            <div className="quizTop">
              <div>
                <h1 className="quizTitle">{quizTitle}</h1>
                <p className="quizSubtitle">{courseTitle}</p>
              </div>
              <a className="learnBtn learnBtn--ghost" href={backHref}>
                  {t('learn.backToCourse')}
              </a>
            </div>

            {loading ? (
              <div className="quizEmpty">{lang === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
            ) : !quiz?.questions?.length ? (
                <div className="quizEmpty">{t('learn.noQuestions')}</div>
            ) : (
              <form className="quizForm" onSubmit={onSubmit}>
                {quiz.questions.map((q, idx) => {
                  const selected = answers[idx]
                  const r = submitRes?.results?.[idx]
                  const isCorrect = submitted && r?.correct === true
                  const isWrong = submitted && r && r.correct === false
                  return (
                    <fieldset
                      key={idx}
                      className={
                        isCorrect
                          ? 'quizQ quizQ--ok'
                          : isWrong
                            ? 'quizQ quizQ--bad'
                            : 'quizQ'
                      }
                    >
                      <legend className="quizQ__title">
                        {idx + 1}. {q.text}
                      </legend>
                      <div
                        className="quizOptions"
                        role="radiogroup"
                        aria-label={q.text}
                      >
                        {(q.options || []).map((opt, oi) => (
                          <label key={oi} className="quizOpt">
                            <input
                              type="radio"
                              name={`q_${idx}`}
                              checked={selected === oi}
                              disabled={submitted}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [idx]: oi }))
                              }
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )
                })}

                <div className="quizActions">
                  <button className="learnBtn learnBtn--primary" type="submit" disabled={submitted}>
                    {t('learn.finishQuiz')}
                  </button>
                  {submitted ? (
                    <p className="quizScore">
                      {t('learn.score', { score: submitRes?.score ?? 0, total: submitRes?.total ?? quiz.questions.length })}
                    </p>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

