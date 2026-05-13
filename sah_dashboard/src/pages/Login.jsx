import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import './pages.css'
import sahLogo from '../assets/Frame 4 (1).png'

export default function Login() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const data = await login(email, password)
      if (data?.user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/app')
      }
    } catch (err) {
      setError(err.response?.data?.error || t('auth.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <img className="auth-brand__logo" src={sahLogo} alt={t('app.name')} />
          <h1 className="auth-brand__title">{t('app.name')}</h1>
          <p className="auth-brand__sub">{t('auth.tagline')}</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{t('auth.signIn')}</h2>
          
          {error && <div className="error">{error}</div>}
          
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
              placeholder={t('auth.passwordPlaceholder')}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
          
          {/* Dashboard does not allow self-signup */}
        </form>
      </div>
    </div>
  )
}