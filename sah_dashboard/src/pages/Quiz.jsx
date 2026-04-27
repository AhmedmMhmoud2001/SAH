import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../api'
import './pages.css'

export default function Quiz() {
  const { id: courseId, quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  async function loadQuiz() {
    try {
      const res = await api.getQuiz(quizId, 'ar')
      setQuiz(res)
    } catch (err) {
      console.error('Failed to load quiz:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const answerArray = quiz.questions.map((_, i) => answers[i])
      const res = await api.submitQuiz(quizId, answerArray)
      setResult(res)
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit:', err)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!quiz) return <div className="error">Quiz not found</div>

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1>SAH Academy</h1>
            <nav className="header-nav">
              <Link to="/app">Home</Link>
              <Link to={`/course/${courseId}/learn`}>Back to Course</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="quiz-main">
        <div className="quiz-container">
          <h2>{quiz.title}</h2>
          
          {submitted && result && (
            <div className="quiz-result">
              <p>Your Score: {result.score} / {result.total}</p>
              <p>{result.passed ? '✓ Passed!' : '✗ Try again'}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {quiz.questions.map((question, i) => (
              <div key={question.id} className="quiz-question">
                <h4>{i + 1}. {question.text}</h4>
                <div className="quiz-options">
                  {question.options.map((option, oi) => (
                    <label key={oi}>
                      <input
                        type="radio"
                        name={`q_${i}`}
                        value={oi}
                        checked={answers[i] === oi}
                        onChange={() => setAnswers({ ...answers, [i]: oi })}
                        disabled={submitted}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            {!submitted && (
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}