import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useI18n } from '../../context/I18nContext'
import Header from './Header'
import Sidebar from './Sidebar'
import './MainLayout.css'

export default function MainLayout() {
  const { theme } = useTheme()
  const { isRTL } = useI18n()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleCollapse = () => setCollapsed(!collapsed)

  return (
    <div className={`admin-layout ${theme} ${isRTL ? 'rtl' : 'ltr'} ${collapsed ? 'collapsed' : ''}`}>
      <Header toggleSidebar={toggleSidebar} toggleCollapse={toggleCollapse} isCollapsed={collapsed} />
      <div className="admin-body">
        <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={toggleSidebar}></div>
        <div className={`admin-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar setSidebarOpen={setSidebarOpen} isCollapsed={collapsed} />
        </div>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}