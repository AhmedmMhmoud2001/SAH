import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  HelpCircle,
  ClipboardList,
  BarChart3,
  CreditCard,
  Info,
  Phone,
  MessageCircle,
  Send,
  Camera,
  PlayCircle,
  Briefcase,
  ShoppingCart,
  Tag,
  Shield,
  Award
} from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { useAuth } from '../../context/AuthContext'

const adminGroups = [
  {
    title: 'main',
    items: [
      { path: '/admin', icon: LayoutDashboard, key: 'nav.dashboard' },
      { path: '/admin/users', icon: Users, key: 'nav.users' },
      { path: '/admin/courses', icon: BookOpen, key: 'nav.courses' },
      { path: '/admin/rbac', icon: Shield, key: 'nav.rbac' },
    ]
  },

  {
    title: 'content',
    items: [
      { path: '/admin/videos', icon: Video, key: 'nav.videos' },
      { path: '/admin/quizzes', icon: ClipboardList, key: 'nav.quizzes' },
      { path: '/admin/questions', icon: HelpCircle, key: 'nav.questions' },
    ]
  },
  {
    title: 'finance',
    items: [
      { path: '/admin/orders', icon: ShoppingCart, key: 'nav.orders' },
      { path: '/admin/coupons', icon: Tag, key: 'nav.coupons' },
      { path: '/admin/subscriptions', icon: CreditCard, key: 'nav.subscriptions' },
      { path: '/admin/certificates', icon: Award, key: 'nav.certificates' },
    ]
  },
  {
    title: 'analytics',
    items: [
      { path: '/admin/reports', icon: BarChart3, key: 'nav.reports' },
    ]
  },
  {
    title: 'support',
    items: [
      { path: '/admin/about', icon: Info, key: 'nav.about' },
      { path: '/admin/home', icon: LayoutDashboard, key: 'nav.home' },
      { path: '/admin/contact', icon: Phone, key: 'nav.contact' },


    ]
  }
]


const studentGroups = [
  {
    title: 'main',
    items: [
      { path: '/app', icon: LayoutDashboard, key: 'nav.home' },
      { path: '/my-courses', icon: BookOpen, key: 'nav.myCourses' },
      { path: '/courses', icon: PlayCircle, key: 'nav.allCourses' },
    ]
  },
  {
    title: 'support',
    items: [
      { path: '/about', icon: Info, key: 'nav.about' },
      { path: '/contact', icon: Phone, key: 'nav.contact' },
    ]
  }
]

export default function Sidebar({ setSidebarOpen, isCollapsed }) {
  const { user } = useAuth()
  const { t, isRTL } = useI18n()

  const menuGroups = user?.role === 'admin' ? adminGroups : studentGroups

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="sidebar-group">

            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/app'}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
                title={isCollapsed ? t(item.key) : ''}
              >

                {({ isActive }) => (
                  <>
                    <div className="sidebar-icon">
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    {!isCollapsed && <span className="sidebar-label">{t(item.key)}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}