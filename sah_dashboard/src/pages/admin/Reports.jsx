import { useMemo, useState, useEffect } from 'react'
import { useI18n } from '../../context/I18nContext'
import {
  getAdminCourses,
  getAdminReportsContent,
  getAdminReportsFinance,
  getAdminReportsFunnel,
  getAdminReportsLearning,
  getAdminReportsOverview,
} from '../../api'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  DollarSign,
  Filter,
  GraduationCap,
  Layers,
  PieChart as PieIcon,
  Download,
} from 'lucide-react'

export default function Reports() {
  const { t, lang } = useI18n()
  const [activeTab, setActiveTab] = useState('overview')
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [preset, setPreset] = useState('30d') // 7d | 30d | 90d | custom
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const [overview, setOverview] = useState(null)
  const [finance, setFinance] = useState(null)
  const [funnel, setFunnel] = useState(null)
  const [learning, setLearning] = useState(null)
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getAdminCourses({ limit: 500 })
        setCourses(res?.courses || [])
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  const rangeParams = useMemo(() => {
    const now = new Date()
    let f = null
    let tt = null
    if (preset === 'custom' && from && to) {
      f = new Date(from)
      tt = new Date(to)
    } else {
      const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30
      f = new Date(now.getTime() - days * 86400000)
      tt = now
    }
    const params = {
      ...(courseId ? { courseId } : {}),
      from: f.toISOString(),
      to: tt.toISOString(),
    }
    return params
  }, [preset, from, to, courseId])

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, rangeParams])

  async function loadReports() {
    setLoading(true)
    try {
      if (activeTab === 'overview') setOverview(await getAdminReportsOverview(rangeParams))
      if (activeTab === 'finance') setFinance(await getAdminReportsFinance({ ...rangeParams, granularity: 'day' }))
      if (activeTab === 'funnel') setFunnel(await getAdminReportsFunnel(rangeParams))
      if (activeTab === 'learning') setLearning(await getAdminReportsLearning(rangeParams))
      if (activeTab === 'content') setContent(await getAdminReportsContent({ ...(courseId ? { courseId } : {}) }))
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

  const rangeLabel = useMemo(() => {
    if (preset === 'custom' && from && to) return `${from} → ${to}`
    return preset === '7d'
      ? t('reports.last7d')
      : preset === '90d'
        ? t('reports.last90d')
        : t('reports.last30d')
  }, [preset, from, to, lang])

  function exportCsv(filename, rows) {
    try {
      const escape = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
      const csv = rows.map((r) => r.map(escape).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="admin-page loading">{t('msg.loading')}</div>

  return (
    <div className="admin-page">
      <div className="page-header reportsHeader">
        <div className="reportsHeader__meta">
          <h1 className="page-title">{t('nav.reports')}</h1>
          <p>
            {lang === 'en'
              ? 'A unified reporting workspace: finance, funnel, learning, and content quality.'
              : 'مساحة تقارير موحدة: مالية، قمع المبيعات، التعلم، وجودة المحتوى.'}
          </p>
        </div>
        <span className="reportsPill">
          <Filter size={14} />
          {courseId ? (courses.find((c) => c.id === courseId)?.title || '') : t('reports.allCourses')}
          <span style={{ opacity: 0.6 }}>•</span>
          {rangeLabel}
        </span>
      </div>

      <div className="reportsFilters">
        <div className="reportsFilters__left">
          <select className="reportsSelect" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">{t('reports.allCourses')}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select className="reportsSelect reportsSelect--range" value={preset} onChange={(e) => setPreset(e.target.value)}>
            <option value="7d">{t('reports.last7d')}</option>
            <option value="30d">{t('reports.last30d')}</option>
            <option value="90d">{t('reports.last90d')}</option>
            <option value="custom">{t('reports.customRange')}</option>
          </select>

          {preset === 'custom' ? (
            <>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </>
          ) : null}
        </div>
        <div className="reportsFilters__right">
          <button className="btn" type="button" onClick={() => loadReports()}>
            {t('reports.refresh')}
          </button>
        </div>
      </div>

      <div className="reportsTabs">
        <button
          className={activeTab === 'overview' ? 'reportsTab reportsTab--active' : 'reportsTab'}
          onClick={() => setActiveTab('overview')}
          type="button"
        >
          <PieIcon size={16} />
          {lang === 'en' ? 'Overview' : 'ملخص'}
        </button>
        <button
          className={activeTab === 'finance' ? 'reportsTab reportsTab--active' : 'reportsTab'}
          onClick={() => setActiveTab('finance')}
          type="button"
        >
          <DollarSign size={16} />
          {lang === 'en' ? 'Finance' : 'مالية'}
        </button>
        <button
          className={activeTab === 'funnel' ? 'reportsTab reportsTab--active' : 'reportsTab'}
          onClick={() => setActiveTab('funnel')}
          type="button"
        >
          <BarChart3 size={16} />
          {lang === 'en' ? 'Funnel' : 'قمع المبيعات'}
        </button>
        <button
          className={activeTab === 'learning' ? 'reportsTab reportsTab--active' : 'reportsTab'}
          onClick={() => setActiveTab('learning')}
          type="button"
        >
          <GraduationCap size={16} />
          {lang === 'en' ? 'Learning' : 'التعلم'}
        </button>
        <button
          className={activeTab === 'content' ? 'reportsTab reportsTab--active' : 'reportsTab'}
          onClick={() => setActiveTab('content')}
          type="button"
        >
          <CheckCircle2 size={16} />
          {lang === 'en' ? 'Content QA' : 'جودة المحتوى'}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && overview ? (
          <>
            <div className="reportsGrid">
              <div className="reportsCol_6">
                <div className="reportsKpi">
                  <div>
                    <div className="reportsKpi__label">{lang === 'en' ? 'Paid revenue' : 'إيراد (مدفوع)'}</div>
                    <div className="reportsKpi__value">{Number(overview.cards?.revenuePaid || 0).toFixed(2)} SAR</div>
                    <div className="reportsKpi__hint">{lang === 'en' ? 'Paid orders only' : 'طلبات مدفوعة فقط'}</div>
                  </div>
                  <DollarSign size={26} />
                </div>
              </div>
              <div className="reportsCol_6">
                <div className="reportsKpi">
                  <div>
                    <div className="reportsKpi__label">{lang === 'en' ? 'Average order value' : 'متوسط قيمة الطلب'}</div>
                    <div className="reportsKpi__value">{Number(overview.cards?.aov || 0).toFixed(2)} SAR</div>
                    <div className="reportsKpi__hint">{lang === 'en' ? 'Across paid orders' : 'على الطلبات المدفوعة'}</div>
                  </div>
                  <Layers size={26} />
                </div>
              </div>
              <div className="reportsCol_6">
                <div className="reportsKpi">
                  <div>
                    <div className="reportsKpi__label">{lang === 'en' ? 'New users' : 'مستخدمون جدد'}</div>
                    <div className="reportsKpi__value">{overview.cards?.newUsers || 0}</div>
                    <div className="reportsKpi__hint">{lang === 'en' ? 'Students created' : 'طلاب تم تسجيلهم'}</div>
                  </div>
                  <BookOpen size={26} />
                </div>
              </div>
              <div className="reportsCol_6">
                <div className="reportsKpi">
                  <div>
                    <div className="reportsKpi__label">{lang === 'en' ? 'Enrollments' : 'اشتراكات'}</div>
                    <div className="reportsKpi__value">{overview.cards?.enrollments || 0}</div>
                    <div className="reportsKpi__hint">
                      {lang === 'en'
                        ? `Avg approval: ${overview.cards?.avgApprovalMinutes || 0} min`
                        : `متوسط وقت الموافقة: ${overview.cards?.avgApprovalMinutes || 0} دقيقة`}
                    </div>
                  </div>
                  <GraduationCap size={26} />
                </div>
              </div>

              <div className="reportsCol_6">
                <div className="reportsCard">
                  <div className="reportsCard__header">
                    <h3 className="reportsCard__title">
                      <PieIcon size={18} />
                      {lang === 'en' ? 'Orders by status' : 'الطلبات حسب الحالة'}
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        dataKey="value"
                        data={Object.entries(overview.cards?.ordersByStatus || {}).map(([name, value]) => ({ name, value }))}
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                      >
                        {Object.entries(overview.cards?.ordersByStatus || {}).map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: 12 }} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="reportsCol_6">
                <div className="reportsCard">
                  <div className="reportsCard__header">
                    <h3 className="reportsCard__title">
                      <BarChart3 size={18} />
                      {lang === 'en' ? 'Quick status' : 'حالة سريعة'}
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div className="reportsPill">
                      {lang === 'en' ? 'Pending orders' : 'طلبات pending'}: <strong>{overview.cards?.ordersByStatus?.pending || 0}</strong>
                    </div>
                    <div className="reportsPill">
                      {lang === 'en' ? 'Paid orders' : 'طلبات مدفوعة'}: <strong>{overview.cards?.ordersByStatus?.paid || 0}</strong>
                    </div>
                    <div className="reportsPill">
                      {lang === 'en' ? 'Refunded' : 'مُرتجعات'}: <strong>{overview.cards?.ordersByStatus?.refunded || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'finance' && finance ? (
          <>
            <div className="reportsGrid">
              <div className="reportsCol_12">
                <div className="reportsCard">
                  <div className="reportsCard__header">
                    <h3 className="reportsCard__title">
                      <DollarSign size={18} />
                      {lang === 'en' ? 'Paid revenue trend' : 'اتجاه الإيراد (مدفوع)'}
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={finance.revenueSeries || []}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: 12 }} />
                      <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#rev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="reportsCol_12">
                <div className="reportsCard">
                  <div className="reportsCard__header">
                    <h3 className="reportsCard__title">
                      <Layers size={18} />
                      {lang === 'en' ? 'Orders (latest)' : 'الطلبات (الأحدث)'}
                    </h3>
                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        exportCsv(
                          'orders.csv',
                          [
                            ['id', 'status', 'amount', 'currency', 'createdAt', 'userEmail', 'courses'],
                            ...(finance.orders || []).map((o) => [
                              o.id,
                              o.status,
                              o.totalAmount,
                              o.currency,
                              o.createdAt,
                              o.user?.email || '',
                              (o.courses || []).join(' | '),
                            ]),
                          ],
                        )
                      }
                    >
                      <Download size={16} style={{ marginInlineEnd: 8 }} />
                      {lang === 'en' ? 'Export CSV' : 'تصدير CSV'}
                    </button>
                  </div>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>{lang === 'en' ? 'Status' : 'الحالة'}</th>
                        <th>{lang === 'en' ? 'Amount' : 'المبلغ'}</th>
                        <th>{lang === 'en' ? 'Customer' : 'العميل'}</th>
                        <th>{lang === 'en' ? 'Courses' : 'الدورات'}</th>
                        <th>{lang === 'en' ? 'Date' : 'التاريخ'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(finance.orders || []).slice(0, 40).map((o) => (
                        <tr key={o.id}>
                          <td><span className="text-mono" style={{ fontSize: 12 }}>{o.id.slice(0, 8)}...</span></td>
                          <td><span className={`badge ${o.status === 'paid' ? 'badge-success' : o.status === 'pending' ? 'badge-warning' : 'badge'}`}>{o.status}</span></td>
                          <td>{o.totalAmount} {o.currency}</td>
                          <td>{o.user?.email || '-'}</td>
                          <td style={{ maxWidth: 380 }}>{(o.courses || []).join(', ') || '-'}</td>
                          <td>{new Date(o.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'funnel' && funnel ? (
          <>
            <div className="reportsGrid">
              <div className="reportsCol_6">
                <div className="reportsKpi">
                  <div>
                    <div className="reportsKpi__label">{lang === 'en' ? 'Pending → Paid conversion' : 'تحويل pending إلى paid'}</div>
                    <div className="reportsKpi__value">{funnel.metrics?.conversionPendingToPaid || 0}%</div>
                    <div className="reportsKpi__hint">{lang === 'en' ? 'Paid / (Paid + Pending)' : 'مدفوع / (مدفوع + pending)'}</div>
                  </div>
                  <BarChart3 size={26} />
                </div>
              </div>
              <div className="reportsCol_6">
                <div className="reportsKpi">
                  <div>
                    <div className="reportsKpi__label">{lang === 'en' ? 'Avg approval time' : 'متوسط وقت الموافقة'}</div>
                    <div className="reportsKpi__value">{funnel.metrics?.avgApprovalMinutes || 0} {lang === 'en' ? 'min' : 'دقيقة'}</div>
                    <div className="reportsKpi__hint">{lang === 'en' ? 'Time from created→paid' : 'من إنشاء الطلب حتى الدفع'}</div>
                  </div>
                  <Layers size={26} />
                </div>
              </div>

              <div className="reportsCol_12">
                <div className="reportsCard">
                  <div className="reportsCard__header">
                    <h3 className="reportsCard__title">
                      <BarChart3 size={18} />
                      {lang === 'en' ? 'Orders pipeline' : 'مسار الطلبات'}
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={funnel.steps || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: 12 }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={56} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'learning' && learning ? (
          <>
            <div className="reportsGrid">
              <div className="reportsCol_12">
                <div className="reportsCard">
                  <div className="reportsCard__header">
                    <h3 className="reportsCard__title">
                      <GraduationCap size={18} />
                      {lang === 'en' ? 'Course completion (avg %)' : 'إكمال الدورات (متوسط %)'}
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={learning.completion || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="title" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} hide />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: 12 }} />
                      <Bar dataKey="completionPctAvg" fill="#10b981" radius={[8, 8, 0, 0]} barSize={56} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="reportsCol_12">
                <div className="reportsCard">
                  <div className="reportsCard__header">
                    <h3 className="reportsCard__title">
                      <BookOpen size={18} />
                      {lang === 'en' ? 'Top quizzes (attempts)' : 'أكثر الاختبارات محاولة'}
                    </h3>
                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        exportCsv(
                          'quizzes.csv',
                          [
                            ['quizId', 'title', 'type', 'attempts', 'avgPct', 'passRate'],
                            ...(learning.quizzes || []).map((q) => [q.quizId, q.title, q.type, q.attempts, q.avgPct, q.passRate]),
                          ],
                        )
                      }
                    >
                      <Download size={16} style={{ marginInlineEnd: 8 }} />
                      {lang === 'en' ? 'Export CSV' : 'تصدير CSV'}
                    </button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{lang === 'en' ? 'Quiz' : 'الاختبار'}</th>
                        <th>{lang === 'en' ? 'Attempts' : 'محاولات'}</th>
                        <th>{lang === 'en' ? 'Avg score' : 'متوسط النتيجة'}</th>
                        <th>{lang === 'en' ? 'Pass rate' : 'نسبة النجاح'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(learning.quizzes || []).map((q) => (
                        <tr key={q.quizId}>
                          <td>{q.title}</td>
                          <td>{q.attempts}</td>
                          <td>{q.avgPct}%</td>
                          <td>{q.passRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'content' && content ? (
          <>
            <div className="reportsGrid">
              <div className="reportsCol_6">
                <div className="reportsKpi">
                  <div>
                    <div className="reportsKpi__label">{lang === 'en' ? 'Lessons missing video' : 'دروس بدون فيديو'}</div>
                    <div className="reportsKpi__value">{content.checklist?.lessonsMissingVideo || 0}</div>
                    <div className="reportsKpi__hint">{lang === 'en' ? 'Video URL is empty' : 'لا يوجد رابط فيديو'}</div>
                  </div>
                  <CheckCircle2 size={26} />
                </div>
              </div>
              <div className="reportsCol_6">
                <div className="reportsKpi">
                  <div>
                    <div className="reportsKpi__label">{lang === 'en' ? 'Lessons missing quiz' : 'دروس بدون اختبار'}</div>
                    <div className="reportsKpi__value">{content.checklist?.lessonsMissingQuiz || 0}</div>
                    <div className="reportsKpi__hint">{lang === 'en' ? 'No lesson quiz linked' : 'لا يوجد اختبار مربوط'}</div>
                  </div>
                  <BookOpen size={26} />
                </div>
              </div>
              <div className="reportsCol_12">
                <div className="reportsCard">
                  <div className="reportsCard__header">
                    <h3 className="reportsCard__title">
                      <CheckCircle2 size={18} />
                      {lang === 'en' ? 'Quality actions' : 'إجراءات جودة'}
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div className="reportsPill">
                      {lang === 'en' ? 'Quizzes missing questions' : 'اختبارات بدون أسئلة'}:{' '}
                      <strong>{content.checklist?.quizzesMissingQuestions || 0}</strong>
                    </div>
                    <div className="card" style={{ padding: 16 }}>
                      <h3 style={{ marginTop: 0 }}>{lang === 'en' ? 'Next steps' : 'الخطوات التالية'}</h3>
                      <ul style={{ margin: 0, paddingInlineStart: 18, color: 'var(--text-secondary)' }}>
                        <li>{lang === 'en' ? 'Add video URLs for missing lessons.' : 'أضف روابط الفيديو للدروس الناقصة.'}</li>
                        <li>{lang === 'en' ? 'Bulk-create missing lesson quizzes from Quizzes page.' : 'استخدم Bulk Create في صفحة الاختبارات لإنشاء اختبارات الدروس الناقصة.'}</li>
                        <li>{lang === 'en' ? 'Ensure each quiz has at least 5 questions.' : 'تأكد أن كل اختبار فيه على الأقل 5 أسئلة.'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}