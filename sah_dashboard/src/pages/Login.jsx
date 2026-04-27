import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import './pages.css'
import sahLogo from '../assets/Frame 4 (1).png'

export default function Login() {
  const { t, isRTL } = useI18n()
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
      setError(err.response?.data?.error || (isRTL ? 'فشل تسجيل الدخول' : 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <img className="auth-brand__logo" src={sahLogo} alt="SAH Academy" />
          <h1 className="auth-brand__title">{t('app.name')}</h1>
          <p className="auth-brand__sub">{isRTL ? 'تعلّم المحاسبة و Odoo' : 'Learn Accounting & Odoo'}</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</h2>
          
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRTL ? 'اكتب بريدك الإلكتروني' : 'Enter your email'}
              required
            />
          </div>
          
          <div className="form-group">
            <label>{isRTL ? 'كلمة المرور' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRTL ? 'اكتب كلمة المرور' : 'Enter your password'}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? (isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...') : (isRTL ? 'تسجيل الدخول' : 'Sign In')}
          </button>
          
          {/* Dashboard does not allow self-signup */}
        </form>
      </div>
    </div>
  )
}