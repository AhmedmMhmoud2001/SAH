import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import './pages.css'

export default function Register() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('auth.err.passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.err.passwordShort'))
      return
    }

    setLoading(true)

    try {
      await register(name, email, password)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.error || t('auth.err.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>{t('app.name')}</h1>
          <p>{t('auth.tagline')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{t('auth.registerTitle')}</h2>

          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label>{t('auth.fullName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.createPasswordPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? t('auth.creatingAccount') : t('auth.signUp')}
          </button>

          <p className="auth-link">
            {t('auth.haveAccount')}{' '}
            <Link to="/login">{t('auth.signInLink')}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
