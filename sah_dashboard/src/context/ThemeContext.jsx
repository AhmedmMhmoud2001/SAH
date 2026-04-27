import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const themes = {
  light: {
    '--bg-primary': '#f8fafc',
    '--bg-primary-rgb': '248, 250, 252',
    '--bg-secondary': '#ffffff',
    '--bg-tertiary': '#f1f5f9',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--text-muted': '#94a3b8',
    '--border': '#e2e8f0',
    '--primary': '#1a2b4b', /* Navy Blue for everything in light mode */
    '--primary-hover': '#111d33',
    '--secondary': '#1a2b4b', /* Also Navy */
    '--accent': '#1a2b4b', /* Also Navy */
    '--danger': '#ef4444',
    '--warning': '#f59e0b',
    '--success': '#10b981',
    '--sidebar-bg': '#ffffff',
    '--sidebar-text': '#475569',
    '--sidebar-active-bg': '#f1f5f9',
    '--sidebar-active-text': '#1a2b4b',
    '--header-bg': '#ffffff',
    '--card-bg': '#ffffff',
  },
  dark: {
    '--bg-primary': '#0a0f1a',
    '--bg-primary-rgb': '10, 15, 26',
    '--bg-secondary': '#161e2e',
    '--bg-tertiary': '#242f42',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#94a3b8',
    '--text-muted': '#64748b',
    '--border': '#1e293b',
    '--primary': '#c5a059', /* Gold for buttons in dark mode */
    '--primary-hover': '#d4af37',
    '--secondary': '#c5a059',
    '--accent': '#c5a059',
    '--danger': '#f87171',
    '--warning': '#fbbf24',
    '--success': '#4ade80',
    '--sidebar-bg': '#0f172a',
    '--sidebar-text': '#94a3b8',
    '--sidebar-active-bg': '#1e293b',
    '--sidebar-active-text': '#c5a059',
    '--header-bg': '#0f172a',
    '--card-bg': '#1e293b',
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    const colors = themes[theme]
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    
    localStorage.setItem('theme', theme)
    document.body.className = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themes: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}