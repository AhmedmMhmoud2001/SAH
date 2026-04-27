import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sun, 
  Moon, 
  Languages, 
  ChevronDown, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  LayoutDashboard,
  Info,
  Mail,
  Menu,
  PanelLeft
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useI18n } from '../../context/I18nContext'
import { useAuth } from '../../context/AuthContext'
import sahLogo from '../../assets/sah-logo.svg'

export default function Header({ toggleSidebar, toggleCollapse, isCollapsed }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, t, isRTL } = useI18n()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
  }

  return (
    <header className="admin-header">
      <div className="header-right">
        <div className="logo" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/app')}>
          <img className="logo-image" src={sahLogo} alt="SAH" />
          <span className="logo-text">{t('app.name')}</span>
        </div>
        
        <button 
          className="header-btn desktop-only" 
          onClick={toggleCollapse}
          title={isCollapsed ? t('ui.expandSidebar') : t('ui.collapseSidebar')}
        >
          <PanelLeft size={20} />
        </button>

        <button className="header-btn mobile-only" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
      </div>

      <div className="header-left">
        <button 
          className="header-btn lang-toggle" 
          onClick={toggleLanguage}
          title={lang === 'ar' ? t('ui.switchToEnglish') : t('ui.switchToArabic')}
        >
          <Languages size={20} />
          <span style={{ marginLeft: isRTL ? '0' : '4px', marginRight: isRTL ? '4px' : '0', fontSize: '12px', fontWeight: 600 }}>
            {lang === 'ar' ? 'EN' : 'AR'}
          </span>
        </button>

        <button 
          className="header-btn theme-toggle" 
          onClick={toggleTheme}
          title={theme === 'light' ? t('theme.dark') : t('theme.light')}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="user-menu" ref={menuRef}>
          <button 
            className="user-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user?.name || t('ui.user')}</span>
            <ChevronDown size={14} className="dropdown-icon" />
          </button>

          {menuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <p className="dropdown-name">{user?.name}</p>
                <p className="dropdown-email">{user?.email}</p>
                <span className="dropdown-role">
                  {user?.role === 'admin' ? t('nav.admin') || 'ADMIN' : t('nav.user') || 'USER'}
                </span>
              </div>
              <div className="dropdown-items">
                <button 
                  className="dropdown-item"
                  onClick={() => { navigate(user?.role === 'admin' ? '/admin' : '/app'); setMenuOpen(false) }}
                >
                  <LayoutDashboard size={18} />
                  {t('nav.dashboard')}
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => { navigate(user?.role === 'admin' ? '/admin/about' : '/about'); setMenuOpen(false) }}
                >
                  <Info size={18} />
                  {t('nav.about')}
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => { navigate(user?.role === 'admin' ? '/admin/contact' : '/contact'); setMenuOpen(false) }}
                >
                  <Mail size={18} />
                  {t('nav.contact')}
                </button>

                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}