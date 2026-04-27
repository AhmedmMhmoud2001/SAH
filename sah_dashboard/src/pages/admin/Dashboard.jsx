import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, CreditCard, DollarSign, TrendingUp, BarChart3, PieChart } from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts'
import { useI18n } from '../../context/I18nContext'
import { getAdminStats, getAdminAnalytics } from '../../api'

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function Dashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [statsData, analyticsData] = await Promise.all([
        getAdminStats(),
        getAdminAnalytics()
      ])
      setStats(statsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      if (error.response?.status === 403) navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="page-loader"><p>{t('msg.loading')}</p></div>

  const statCards = [
    { title: t('stats.totalUsers'), value: stats?.totalUsers || 0, icon: Users, color: '#6366f1' },
    { title: t('stats.totalCourses'), value: stats?.totalCourses || 0, icon: BookOpen, color: '#8b5cf6' },
    { title: t('stats.totalEnrollments'), value: stats?.totalEnrollments || 0, icon: CreditCard, color: '#10b981' },
    { title: t('stats.revenue'), value: `${stats?.revenue || 0} SAR`, icon: DollarSign, color: '#f59e0b' },
  ]

  return (
    <div className="admin-dashboard animate-fade-in">
      <div className="dashboard-header">
        <h1 className="page-title">{t('nav.dashboard')}</h1>
        <p className="subtitle">
          {t('admin.dashboard.subtitle')}
        </p>
      </div>
      
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-info">
              <p className="stat-card-title">{card.title}</p>
              <p className="stat-card-value">{card.value}</p>
            </div>
            <div className="stat-card-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        {/* Revenue Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <TrendingUp size={18} />
            <h3>{t('admin.dashboard.revenueTrend')}</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.revenueData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Growth */}
        <div className="chart-card">
          <div className="chart-header">
            <BarChart3 size={18} />
            <h3>{t('admin.dashboard.enrollmentTrend')}</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.studentData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.4 }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Top Courses */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <PieChart size={18} />
            <h3>{t('admin.dashboard.topCourses')}</h3>
          </div>
          <div className="chart-body top-courses-body">
            <div className="pie-container">
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={analytics?.topCourses}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics?.topCourses?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="top-courses-list">
              {analytics?.topCourses?.map((course, idx) => (
                <div key={idx} className="top-course-item">
                  <div className="course-color" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="course-name">{course.name}</span>
                  <span className="course-value">{t('admin.dashboard.sales', { n: course.value })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <Users size={18} />
          <h2 className="section-title">{t('stats.recentUsers')}</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('users.name')}</th>
              <th>{t('users.email')}</th>
              <th>{t('users.created')}</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentUsers?.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info-cell">
                    <div className="user-mini-avatar">{user.name.charAt(0)}</div>
                    {user.name}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}