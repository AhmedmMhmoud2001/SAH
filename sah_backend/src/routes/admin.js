import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authenticate, requireAdmin } from './auth.js'
import prisma from '../lib/db.js'

export const router = Router()

console.log('[Admin Routes] Module loaded')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif']
const profileStorePath = path.join(__dirname, '..', '..', 'data', 'user-profiles.json')
fs.mkdirSync(path.dirname(profileStorePath), { recursive: true })

function makeUploader({ subdir, prefix }) {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', subdir)
  fs.mkdirSync(uploadDir, { recursive: true })

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
      const safeExt = allowedExts.includes(ext) ? ext : '.bin'
      const name = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`
      cb(null, name)
    },
  })

  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
  })
}

const uploadCertImages = makeUploader({ subdir: 'certificates', prefix: 'cert' })
const uploadUserAvatar = makeUploader({ subdir: 'avatars', prefix: 'avatar' })

function readProfileStore() {
  try {
    if (!fs.existsSync(profileStorePath)) return {}
    const raw = fs.readFileSync(profileStorePath, 'utf8')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeProfileStore(data) {
  fs.writeFileSync(profileStorePath, JSON.stringify(data, null, 2), 'utf8')
}

function getAvatarUrl(userId) {
  const store = readProfileStore()
  return store?.[userId]?.avatarUrl || null
}

function setAvatarUrl(userId, avatarUrl) {
  const store = readProfileStore()
  store[userId] = { ...(store[userId] || {}), avatarUrl }
  writeProfileStore(store)
}

function parseJson(str) {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

function normalizeStringArray(input) {
  if (input === undefined) return undefined
  if (input === null) return null
  if (Array.isArray(input)) {
    return input.map(v => String(v).trim()).filter(Boolean)
  }
  if (typeof input === 'string') {
    const parsed = parseJson(input)
    if (Array.isArray(parsed)) return parsed.map(v => String(v).trim()).filter(Boolean)
    // Allow newline-separated values as a fallback
    return input.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  }
  return undefined
}

function normalizeCurriculumDetails(input) {
  if (input === undefined) return undefined
  if (input === null) return null
  const value = typeof input === 'string' ? parseJson(input) : input
  if (!Array.isArray(value)) return undefined
  const normalized = value
    .map((m) => ({
      title: m?.title ? String(m.title).trim() : '',
      description: m?.description ? String(m.description).trim() : '',
    }))
    .filter((m) => m.title || m.description)
  return normalized
}

function titlesFromDetails(details) {
  if (!Array.isArray(details)) return null
  const titles = details.map((m) => String(m?.title || '').trim()).filter(Boolean)
  return titles.length ? titles : null
}

function normalizeJsonArray(input) {
  if (input === undefined) return undefined
  if (input === null) return null
  const value = typeof input === 'string' ? parseJson(input) : input
  if (!Array.isArray(value)) return undefined
  return value
}

function defaultHomeData() {
  const featuresAr = [
    { title: 'تعلم بالذكاء الاصطناعي', desc: 'مساعدة ذكية لتسريع التعلم والإجابة عن أسئلتك.', iconUrl: null },
    { title: 'تدريب متخصص في Odoo', desc: 'محتوى عملي يركز على تطبيقات Odoo في الأعمال.', iconUrl: null },
    { title: 'مدربون متخصصون', desc: 'تعلم مع مدربين بخبرة عملية طويلة في المجال.', iconUrl: null },
    { title: 'شهادة إتمام معتمدة', desc: 'احصل على شهادة بعد إكمال الدورة واجتياز التقييم.', iconUrl: null },
  ]
  const featuresEn = [
    { title: 'AI-powered learning', desc: 'Smart help to accelerate learning and answer your questions.', iconUrl: null },
    { title: 'Specialized Odoo training', desc: 'Practical content focused on real Odoo business applications.', iconUrl: null },
    { title: 'Expert instructors', desc: 'Learn with instructors who have deep hands-on experience.', iconUrl: null },
    { title: 'Certified completion', desc: 'Get a certificate after completing the course and passing the evaluation.', iconUrl: null },
  ]

  const testimonialsAr = [
    { name: 'عبدالله محمود', role: 'مدير جديد', text: 'أفضل منصة تعليمية في مجال المحاسبة، المحتوى عملي والشهادة أضافت قيمة كبيرة لمسيرتي الذاتية.', rating: 5, avatarUrl: null },
    { name: 'سارة علي', role: 'محاسبة', text: 'شرح واضح وأمثلة عملية. قدرت أطبق اللي اتعلمته مباشرة في شغلي.', rating: 5, avatarUrl: null },
    { name: 'محمد حسن', role: 'محلل مالي', text: 'تنظيم ممتاز ودعم سريع. المحتوى محدث وسهل المتابعة خطوة بخطوة.', rating: 5, avatarUrl: null },
    { name: 'ريم الحربي', role: 'صاحبة مشروع', text: 'الدورات ساعدتني أفهم التقارير المالية وأحسّن قراراتي في إدارة المشروع.', rating: 5, avatarUrl: null },
    { name: 'أحمد سالم', role: 'مدقق مبتدئ', text: 'محتوى قوي وتمارين مفيدة، فرق معايا جدًا في فهم القيود والتسويات.', rating: 5, avatarUrl: null },
  ]
  const testimonialsEn = [
    { name: 'Abdullah Mahmoud', role: 'New manager', text: 'The best platform for accounting. Practical content and the certificate added real value to my profile.', rating: 5, avatarUrl: null },
    { name: 'Sara Ali', role: 'Accountant', text: 'Clear explanations and great examples. I was able to apply what I learned right away.', rating: 5, avatarUrl: null },
    { name: 'Mohammed Hassan', role: 'Finance analyst', text: 'Excellent structure and support. The course materials are updated and easy to follow.', rating: 5, avatarUrl: null },
    { name: 'Reem Alharbi', role: 'Business owner', text: 'The courses helped me understand financial reports and improve decision-making for my business.', rating: 5, avatarUrl: null },
    { name: 'Ahmed Salem', role: 'Junior auditor', text: 'Strong content with useful practice. It really improved my understanding of entries and adjustments.', rating: 5, avatarUrl: null },
  ]

  const stepsAr = [
    { number: '01', title: 'اختر الدورة', desc: 'اختر الدورة المناسبة لمستواك وهدفك المهني.' },
    { number: '02', title: 'ابدأ التعلم', desc: 'تابع الدروس وطبّق عملياً مع تمارين ومهام.' },
    { number: '03', title: 'احصل على الشهادة', desc: 'أكمل التقييم لتحصل على شهادة إتمام معتمدة.' },
  ]
  const stepsEn = [
    { number: '01', title: 'Choose a course', desc: 'Pick the right course for your level and goal.' },
    { number: '02', title: 'Start learning', desc: 'Watch lessons and practice with tasks.' },
    { number: '03', title: 'Get certified', desc: 'Complete the evaluation to earn a certificate.' },
  ]

  return {
    heroTitleAr: 'مستقبل تعليم المحاسبة و {brand}',
    heroTitleEn: 'The future of Accounting & {brand} learning',
    heroBrand: 'Odoo',
    heroSubtitleAr: 'تعلم المحاسبة وإدارة الأعمال من مدربين متخصصين بخبرة تزيد عن 15 عاماً',
    heroSubtitleEn: 'Learn accounting and business from expert instructors with 15+ years of experience.',
    heroCtaLabelAr: 'ابدأ رحلتك للتعلم',
    heroCtaLabelEn: 'Start learning',
    heroCtaHref: '#courses',
    introVideoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    heroImageUrl: null,
    featuresAr: JSON.stringify(featuresAr),
    featuresEn: JSON.stringify(featuresEn),
    testimonialsAr: JSON.stringify(testimonialsAr),
    testimonialsEn: JSON.stringify(testimonialsEn),
    stepsAr: JSON.stringify(stepsAr),
    stepsEn: JSON.stringify(stepsEn),
    ctaTitleAr: 'جاهز لتبدأ رحلتك التعليمية اليوم؟',
    ctaTitleEn: 'Ready to start learning today?',
    ctaSubAr: 'انضم إلى مئات الطلاب الذين طوروا مهاراتهم في المحاسبة وأنظمة Odoo',
    ctaSubEn: 'Join hundreds of students improving in accounting and Odoo.',
    ctaBtnAr: 'استكشف الدورات الآن',
    ctaBtnEn: 'Explore courses',
    ctaHref: '#courses',
  }
}

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(requireAdmin)

console.log('[Admin Routes] Middleware applied')

router.get('/health', (req, res) => {
  res.json({ status: 'admin ok', user: req.user })
})


// Dashboard Statistics
router.get('/stats', async (req, res) => {
  console.log('[Admin] Fetching dashboard stats...')
  try {
    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count()
    ])

    let revenue = 0
    let pendingOrdersCount = 0

    try {
      const paidOrders = await prisma.order.findMany({
        where: { status: 'paid' },
        select: { totalAmount: true }
      })
      revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      pendingOrdersCount = await prisma.order.count({ where: { status: 'pending' } })
    } catch (err) {
      console.warn('[Admin Stats] Order table might be missing, returning 0 revenue:', err.message)
    }

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      revenue,
      pendingOrders: pendingOrdersCount,
      recentUsers
    })

  } catch (error) {
    console.error('[Admin] Stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message })
  }
})

// Advanced Analytics for Dashboard Charts
router.get('/analytics', async (req, res) => {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    // 1. Monthly Revenue & Student Enrollment
    let orders = []
    try {
      orders = await prisma.order.findMany({
        where: { status: 'paid', createdAt: { gte: sixMonthsAgo } },
        select: { totalAmount: true, createdAt: true }
      })
    } catch (err) {
      // In some environments the orders table may not exist yet.
      console.warn('[Admin Analytics] Order query failed, returning 0 revenue:', err.message)
      orders = []
    }

    const students = await prisma.user.findMany({
      where: { role: 'student', createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    })

    const months = []
    for (let i = 0; i < 6; i++) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.unshift(d.toLocaleString('default', { month: 'short' }))
    }

    const revenueData = months.map(m => ({ name: m, value: 0 }))
    const studentData = months.map(m => ({ name: m, value: 0 }))

    orders.forEach(o => {
      const m = o.createdAt.toLocaleString('default', { month: 'short' })
      const idx = months.indexOf(m)
      if (idx !== -1) revenueData[idx].value += o.totalAmount
    })

    students.forEach(s => {
      const m = s.createdAt.toLocaleString('default', { month: 'short' })
      const idx = months.indexOf(m)
      if (idx !== -1) studentData[idx].value += 1
    })

    // 2. Top Selling Courses
    let enrollments = []
    try {
      enrollments = await prisma.enrollment.groupBy({
        by: ['courseId'],
        _count: { courseId: true },
        orderBy: { _count: { courseId: 'desc' } },
        take: 5
      })
    } catch (err) {
      console.warn('[Admin Analytics] Enrollment groupBy failed, falling back:', err.message)
      const rows = await prisma.enrollment.findMany({ select: { courseId: true } })
      const counts = new Map()
      rows.forEach((r) => {
        const k = r.courseId
        counts.set(k, (counts.get(k) || 0) + 1)
      })
      enrollments = Array.from(counts.entries())
        .map(([courseId, n]) => ({ courseId, _count: { courseId: n } }))
        .sort((a, b) => b._count.courseId - a._count.courseId)
        .slice(0, 5)
    }

    const topCourses = await Promise.all(enrollments.map(async (e) => {
      const course = await prisma.course.findUnique({
        where: { id: e.courseId },
        select: { title: true, enTitle: true }
      })
      return {
        name: course?.enTitle || course?.title || 'Unknown',
        value: e?._count?.courseId || 0
      }
    }))

    res.json({ revenueData, studentData, topCourses })
  } catch (error) {
    console.error('[Admin] Analytics error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics', details: error?.message })
  }
})



// Detailed Student Progress
router.get('/users/:id/progress', async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.params.id },
      include: {
        course: {
          select: { title: true, enTitle: true, id: true }
        }
      }
    })

    const progress = await Promise.all(enrollments.map(async (e) => {
      const p = await prisma.progress.findFirst({
        where: { userId: e.userId, courseId: e.courseId },
        select: { completedLessons: true }
      })
      const completedMap = (() => {
        try {
          return JSON.parse(p?.completedLessons || '{}')
        } catch {
          return {}
        }
      })()
      const completedLessons = Object.keys(completedMap || {}).length
      const totalLessons = await prisma.lesson.count({ where: { courseId: e.courseId } })
      return {
        courseId: e.courseId,
        courseName: e.course.enTitle || e.course.title,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        completed: completedLessons,
        total: totalLessons
      }
    }))

    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student progress' })
  }
})

// Manual Enrollment by Admin
router.post('/enroll', async (req, res) => {
  try {
    const { userId, courseId } = req.body
    
    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })

    if (existing) return res.status(400).json({ error: 'User already enrolled in this course' })

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId }
    })

    res.json({ message: 'User enrolled successfully', enrollment })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Manual enrollment failed' })
  }
})


// Users Management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ])

    res.json({
      users: users.map((user) => ({ ...user, avatarUrl: getAvatarUrl(user.id) })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        deviceId: true,
        deviceInfo: true,
        deviceBoundAt: true,
      }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ ...user, avatarUrl: getAvatarUrl(user.id) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' })
  }
})

router.get('/users/:id/devices', async (req, res) => {
  try {
    const { id: userId } = req.params
    const devices = await prisma.userDevice.findMany({
      where: { userId: String(userId), revokedAt: null },
      orderBy: { boundAt: 'desc' },
      take: 10,
      select: {
        deviceId: true,
        deviceInfo: true,
        boundAt: true,
      },
    })
    res.json({ devices })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' })
  }
})

router.get('/users/:id/device-change-requests', async (req, res) => {
  try {
    const { id: userId } = req.params
    const status = req.query?.status ? String(req.query.status).trim().toLowerCase() : null
    const where = {
      userId: String(userId),
      ...(status ? { status } : {}),
    }
    const requests = await prisma.deviceChangeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        userId: true,
        newDeviceId: true,
        newDeviceInfo: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        reviewedByAdminId: true,
      },
    })
    res.json({ requests })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device change requests' })
  }
})

router.get('/device-change-requests', async (req, res) => {
  try {
    const status = req.query?.status ? String(req.query.status).trim().toLowerCase() : 'pending'
    const requests = await prisma.deviceChangeRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        userId: true,
        newDeviceId: true,
        newDeviceInfo: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        reviewedByAdminId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    res.json({ requests })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device change requests' })
  }
})

router.post('/device-change-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    const current = await prisma.deviceChangeRequest.findUnique({
      where: { id: String(id) },
      select: { id: true, status: true, userId: true, newDeviceId: true, newDeviceInfo: true },
    })
    if (!current) return res.status(404).json({ error: 'Request not found' })
    if (current.status !== 'pending') return res.status(409).json({ error: 'Request already reviewed' })

    const reviewedByAdminId = req.user?.userId ? String(req.user.userId) : null

    const activeCount = await prisma.userDevice.count({
      where: { userId: current.userId, revokedAt: null },
    })
    if (activeCount >= 2) {
      return res.status(409).json({ error: 'Device limit reached (2)', code: 'DEVICE_LIMIT_REACHED' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.userDevice.upsert({
        where: { userId_deviceId: { userId: current.userId, deviceId: current.newDeviceId } },
        create: {
          userId: current.userId,
          deviceId: current.newDeviceId,
          deviceInfo: current.newDeviceInfo,
          boundAt: new Date(),
        },
        update: {
          revokedAt: null,
          deviceInfo: current.newDeviceInfo,
          boundAt: new Date(),
        },
      })

      // Keep legacy fields for display/backward-compat (only if empty)
      const u = await tx.user.findUnique({
        where: { id: current.userId },
        select: { deviceId: true },
      })
      if (!u?.deviceId) {
        await tx.user.update({
          where: { id: current.userId },
          data: { deviceId: current.newDeviceId, deviceInfo: current.newDeviceInfo, deviceBoundAt: new Date() },
        })
      }

      return await tx.deviceChangeRequest.update({
        where: { id: current.id },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedByAdminId: reviewedByAdminId || undefined,
        },
        select: { id: true, status: true, reviewedAt: true, reviewedByAdminId: true },
      })
    })

    res.json({ request: updated })
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve request' })
  }
})

router.post('/device-change-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const current = await prisma.deviceChangeRequest.findUnique({
      where: { id: String(id) },
      select: { id: true, status: true },
    })
    if (!current) return res.status(404).json({ error: 'Request not found' })
    if (current.status !== 'pending') return res.status(409).json({ error: 'Request already reviewed' })

    const reviewedByAdminId = req.user?.userId ? String(req.user.userId) : null
    const updated = await prisma.deviceChangeRequest.update({
      where: { id: String(id) },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedByAdminId: reviewedByAdminId || undefined,
      },
      select: { id: true, status: true, reviewedAt: true, reviewedByAdminId: true },
    })

    res.json({ request: updated })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request' })
  }
})

router.post('/users/:id/clear-device', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.userDevice.updateMany({
      where: { userId: String(id), revokedAt: null },
      data: { revokedAt: new Date() },
    })
    const user = await prisma.user.update({
      where: { id: String(id) },
      data: { deviceId: null, deviceInfo: null, deviceBoundAt: null },
      select: { id: true, deviceId: true, deviceInfo: true, deviceBoundAt: true },
    })
    res.json({ user, cleared: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear device' })
  }
})

router.post('/users/:id/revoke-device', async (req, res) => {
  try {
    const { id } = req.params
    const deviceId = String(req.body?.deviceId || '').trim()
    if (!deviceId) return res.status(400).json({ error: 'deviceId is required' })

    const updated = await prisma.userDevice.updateMany({
      where: { userId: String(id), deviceId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    res.json({ success: true, updated: updated.count })
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke device' })
  }
})

router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, role = 'student', password } = req.body
    
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.default.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, phone, role, passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    })

    res.status(201).json({ ...user, avatarUrl: getAvatarUrl(user.id) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' })
  }
})

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, role } = req.body

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: id } },
        select: { id: true }
      })
      if (existing) {
        return res.status(400).json({ error: 'Email already exists' })
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, phone, role },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true
      }
    })

    res.json({ ...user, avatarUrl: getAvatarUrl(user.id) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

router.post('/users/:id/avatar', uploadUserAvatar.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    setAvatarUrl(id, avatarUrl)
    res.status(201).json({ avatarUrl })
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar' })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.user.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Courses Management
router.get('/courses', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = search ? {
      OR: [
        { title: { contains: search } },
        { code: { contains: search } }
      ]
    } : {}

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { lessons: true, enrollments: true }
          }
        }
      }),
      prisma.course.count({ where })
    ])

    res.json({
      courses: courses.map(c => ({
        ...c,
        curriculumParsed: parseJson(c.curriculum),
        enCurriculumParsed: parseJson(c.enCurriculum),
        curriculumDetailsParsed: parseJson(c.curriculumDetails),
        enCurriculumDetailsParsed: parseJson(c.enCurriculumDetails),
        audienceParsed: parseJson(c.audience),
        enAudienceParsed: parseJson(c.enAudience),
        lessonsCount: c._count.lessons,
        enrollmentsCount: c._count.enrollments
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

router.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: { select: { lessons: true, enrollments: true } }
      }
    })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    res.json({
      ...course,
      curriculumParsed: parseJson(course.curriculum),
      enCurriculumParsed: parseJson(course.enCurriculum),
      curriculumDetailsParsed: parseJson(course.curriculumDetails),
      enCurriculumDetailsParsed: parseJson(course.enCurriculumDetails),
      audienceParsed: parseJson(course.audience),
      enAudienceParsed: parseJson(course.enAudience),
      lessonsCount: course._count.lessons,
      enrollmentsCount: course._count.enrollments
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' })
  }
})

router.post('/courses', async (req, res) => {
  try {
    const {
      title,
      enTitle,
      shortDesc,
      enShortDesc,
      longDesc,
      enLongDesc,
      duration,
      level,
      price,
      code,
      imageUrl,
      isFeatured,
      curriculum,
      enCurriculum,
      curriculumDetails,
      enCurriculumDetails,
      audience,
      enAudience,
      certificateText,
      enCertificateText
    } = req.body

    const curriculumArr = normalizeStringArray(curriculum)
    const enCurriculumArr = normalizeStringArray(enCurriculum)
    const curriculumDetailsArr = normalizeCurriculumDetails(curriculumDetails)
    const enCurriculumDetailsArr = normalizeCurriculumDetails(enCurriculumDetails)
    const audienceArr = normalizeStringArray(audience)
    const enAudienceArr = normalizeStringArray(enAudience)

    const derivedCurriculum = titlesFromDetails(curriculumDetailsArr) ?? (Array.isArray(curriculumArr) ? curriculumArr : null)
    const derivedEnCurriculum = titlesFromDetails(enCurriculumDetailsArr) ?? (Array.isArray(enCurriculumArr) ? enCurriculumArr : null)

    const course = await prisma.course.create({
      data: {
        title,
        enTitle,
        shortDesc,
        enShortDesc,
        longDesc,
        enLongDesc,
        duration,
        level,
        price: parseFloat(price),
        code,
        imageUrl: imageUrl ?? null,
        isFeatured: isFeatured === undefined ? false : !!isFeatured,
        curriculum: derivedCurriculum ? JSON.stringify(derivedCurriculum) : null,
        enCurriculum: derivedEnCurriculum ? JSON.stringify(derivedEnCurriculum) : null,
        curriculumDetails: Array.isArray(curriculumDetailsArr) ? JSON.stringify(curriculumDetailsArr) : null,
        enCurriculumDetails: Array.isArray(enCurriculumDetailsArr) ? JSON.stringify(enCurriculumDetailsArr) : null,
        audience: Array.isArray(audienceArr) ? JSON.stringify(audienceArr) : null,
        enAudience: Array.isArray(enAudienceArr) ? JSON.stringify(enAudienceArr) : null,
        certificateText: certificateText ?? null,
        enCertificateText: enCertificateText ?? null,
        students: '0'
      }
    })

    res.status(201).json(course)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' })
  }
})

router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      enTitle,
      shortDesc,
      enShortDesc,
      longDesc,
      enLongDesc,
      duration,
      level,
      price,
      imageUrl,
      isFeatured,
      curriculum,
      enCurriculum,
      curriculumDetails,
      enCurriculumDetails,
      audience,
      enAudience,
      certificateText,
      enCertificateText
    } = req.body

    const curriculumArr = normalizeStringArray(curriculum)
    const enCurriculumArr = normalizeStringArray(enCurriculum)
    const curriculumDetailsArr = normalizeCurriculumDetails(curriculumDetails)
    const enCurriculumDetailsArr = normalizeCurriculumDetails(enCurriculumDetails)
    const audienceArr = normalizeStringArray(audience)
    const enAudienceArr = normalizeStringArray(enAudience)

    const derivedCurriculum =
      curriculumDetailsArr === undefined
        ? undefined
        : (titlesFromDetails(curriculumDetailsArr) ?? null)
    const derivedEnCurriculum =
      enCurriculumDetailsArr === undefined
        ? undefined
        : (titlesFromDetails(enCurriculumDetailsArr) ?? null)

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        enTitle,
        shortDesc,
        enShortDesc,
        longDesc,
        enLongDesc,
        duration,
        level,
        price: price === undefined ? undefined : parseFloat(price),
        imageUrl: imageUrl === undefined ? undefined : (imageUrl ?? null),
        isFeatured: isFeatured === undefined ? undefined : !!isFeatured,
        curriculum:
          derivedCurriculum !== undefined
            ? (derivedCurriculum ? JSON.stringify(derivedCurriculum) : null)
            : (curriculumArr === undefined ? undefined : (Array.isArray(curriculumArr) ? JSON.stringify(curriculumArr) : null)),
        enCurriculum:
          derivedEnCurriculum !== undefined
            ? (derivedEnCurriculum ? JSON.stringify(derivedEnCurriculum) : null)
            : (enCurriculumArr === undefined ? undefined : (Array.isArray(enCurriculumArr) ? JSON.stringify(enCurriculumArr) : null)),
        curriculumDetails: curriculumDetailsArr === undefined ? undefined : (Array.isArray(curriculumDetailsArr) ? JSON.stringify(curriculumDetailsArr) : null),
        enCurriculumDetails: enCurriculumDetailsArr === undefined ? undefined : (Array.isArray(enCurriculumDetailsArr) ? JSON.stringify(enCurriculumDetailsArr) : null),
        audience: audienceArr === undefined ? undefined : (Array.isArray(audienceArr) ? JSON.stringify(audienceArr) : null),
        enAudience: enAudienceArr === undefined ? undefined : (Array.isArray(enAudienceArr) ? JSON.stringify(enAudienceArr) : null),
        certificateText: certificateText === undefined ? undefined : (certificateText ?? null),
        enCertificateText: enCertificateText === undefined ? undefined : (enCertificateText ?? null),
      }
    })

    res.json(course)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' })
  }
})

router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.course.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' })
  }
})

// Lessons/Videos Management
router.get('/lessons', async (req, res) => {
  try {
    const { courseId } = req.query
    
    const where = courseId ? { courseId } : {}

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        course: { select: { title: true } }
      }
    })

    res.json({ lessons })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' })
  }
})

router.get('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: { select: { id: true, title: true } } },
    })
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
    res.json(lesson)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' })
  }
})

router.post('/lessons', async (req, res) => {
  try {
    const { courseId, title, enTitle, duration, videoUrl, thumbnailUrl, sortOrder } = req.body

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        enTitle,
        duration,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        sortOrder: parseInt(sortOrder) || 1
      }
    })

    res.status(201).json(lesson)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lesson' })
  }
})

router.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, enTitle, duration, videoUrl, thumbnailUrl, sortOrder } = req.body

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        enTitle,
        duration,
        videoUrl,
        thumbnailUrl: thumbnailUrl === undefined ? undefined : (thumbnailUrl || null),
        sortOrder: parseInt(sortOrder)
      }
    })

    res.json(lesson)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson' })
  }
})

router.delete('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.lesson.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lesson' })
  }
})

// Quizzes Management
router.get('/quizzes', async (req, res) => {
  try {
    const { courseId, lessonId, type } = req.query
    const where = {
      ...(courseId ? { courseId: String(courseId) } : {}),
      ...(lessonId ? { lessonId: String(lessonId) } : {}),
      ...(type ? { type: String(type) } : {}),
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true, courseId: true } },
        _count: { select: { questions: true } },
      },
    })

    res.json({ quizzes })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' })
  }
})

router.get('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true, courseId: true } },
        _count: { select: { questions: true } },
      },
    })
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
    res.json(quiz)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' })
  }
})

router.post('/quizzes', async (req, res) => {
  try {
    const { courseId, lessonId, type, title, enTitle } = req.body

    const quizType = String(type || '').trim()
    if (quizType !== 'lesson' && quizType !== 'final') {
      return res.status(400).json({ error: 'Invalid quiz type' })
    }
    if (quizType === 'lesson' && !lessonId) {
      return res.status(400).json({ error: 'lessonId is required for lesson quizzes' })
    }
    if (quizType === 'final' && !courseId) {
      return res.status(400).json({ error: 'courseId is required for final quizzes' })
    }

    // For lesson quizzes, always link the quiz to the lesson's parent course as well.
    // This makes course queries and `/courses/:id/lessons` able to include the quiz via relations.
    let resolvedCourseId = courseId || null
    if (quizType === 'lesson') {
      const lesson = await prisma.lesson.findUnique({
        where: { id: String(lessonId) },
        select: { id: true, courseId: true },
      })
      if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
      resolvedCourseId = lesson.courseId
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId: resolvedCourseId,
        lessonId: lessonId || null,
        type: quizType,
        title: title || null,
        enTitle: enTitle || null,
      },
    })

    res.status(201).json(quiz)
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Quiz already exists for this lesson' })
    }
    res.status(500).json({ error: 'Failed to create quiz' })
  }
})

router.put('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { courseId, lessonId, type, title, enTitle } = req.body

    const quizType = type !== undefined ? String(type || '').trim() : undefined
    if (quizType !== undefined && quizType !== 'lesson' && quizType !== 'final') {
      return res.status(400).json({ error: 'Invalid quiz type' })
    }
    if (quizType === 'lesson' && lessonId === null) {
      return res.status(400).json({ error: 'lessonId is required for lesson quizzes' })
    }
    if (quizType === 'final' && courseId === null) {
      return res.status(400).json({ error: 'courseId is required for final quizzes' })
    }

    // If a lessonId is provided and courseId is not explicitly set, sync courseId from the lesson.
    let resolvedCourseId =
      courseId === undefined ? undefined : (courseId || null)
    if (lessonId !== undefined && lessonId !== null && courseId === undefined) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: String(lessonId) },
        select: { id: true, courseId: true },
      })
      if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
      resolvedCourseId = lesson.courseId
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        courseId: resolvedCourseId,
        lessonId: lessonId === undefined ? undefined : (lessonId || null),
        type: quizType === undefined ? undefined : quizType,
        title: title === undefined ? undefined : (title || null),
        enTitle: enTitle === undefined ? undefined : (enTitle || null),
      },
    })

    res.json(quiz)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quiz' })
  }
})

router.delete('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.quiz.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz' })
  }
})

router.post('/quizzes/bulk-create-missing', async (req, res) => {
  try {
    const { courseId } = req.body
    if (!courseId) return res.status(400).json({ error: 'courseId is required' })

    const lessons = await prisma.lesson.findMany({
      where: { courseId: String(courseId) },
      select: { id: true, title: true, enTitle: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' }
    })

    const existing = await prisma.quiz.findMany({
      where: { type: 'lesson', lessonId: { in: lessons.map(l => l.id) } },
      select: { lessonId: true }
    })
    const existingSet = new Set(existing.map(q => q.lessonId).filter(Boolean))

    const created = []
    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i]
      if (existingSet.has(l.id)) continue
      const quiz = await prisma.quiz.create({
        data: {
          lessonId: l.id,
          courseId: String(courseId),
          type: 'lesson',
          title: `اختبار الدرس ${l.sortOrder || i + 1}`,
          enTitle: `Lesson ${l.sortOrder || i + 1} Quiz`
        }
      })
      created.push(quiz)
    }

    res.json({ courseId, lessons: lessons.length, created: created.length })
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk create quizzes' })
  }
})

// Questions Management
router.get('/questions', async (req, res) => {
  try {
    const { quizId } = req.query
    
    const where = quizId ? { quizId } : {}

    const questions = await prisma.question.findMany({
      where,
      include: {
        quiz: {
          include: {
            course: { select: { title: true } }
          }
        }
      }
    })

    res.json({ questions })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' })
  }
})

router.get('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            course: { select: { id: true, title: true } },
            lesson: { select: { id: true, title: true, courseId: true } },
          },
        },
      },
    })
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(question)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question' })
  }
})

router.post('/questions', async (req, res) => {
  try {
    const { quizId, text, textEn, options, optionsEn, correctIndex } = req.body

    const question = await prisma.question.create({
      data: {
        quizId,
        text,
        textEn,
        options: JSON.stringify(options),
        optionsEn: JSON.stringify(optionsEn),
        correctIndex: parseInt(correctIndex)
      }
    })

    res.status(201).json(question)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' })
  }
})

router.put('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { quizId, text, textEn, options, optionsEn, correctIndex } = req.body
    const question = await prisma.question.update({
      where: { id },
      data: {
        quizId: quizId === undefined ? undefined : quizId,
        text: text === undefined ? undefined : text,
        textEn: textEn === undefined ? undefined : textEn,
        options: options === undefined ? undefined : JSON.stringify(options),
        optionsEn: optionsEn === undefined ? undefined : JSON.stringify(optionsEn),
        correctIndex: correctIndex === undefined ? undefined : parseInt(correctIndex),
      },
    })
    res.json(question)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' })
  }
})

router.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.question.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' })
  }
})

// Subscriptions Management
router.get('/subscriptions', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const enrollments = await prisma.enrollment.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, price: true } }
      }
    })

    const total = await prisma.enrollment.count()

    const subscriptions = await Promise.all(enrollments.map(async (e) => {
      const [p, totalLessons] = await Promise.all([
        prisma.progress.findFirst({
          where: { userId: e.userId, courseId: e.courseId },
          select: { completedLessons: true },
        }),
        prisma.lesson.count({ where: { courseId: e.courseId } }),
      ])
      const completedMap = (() => {
        try {
          return JSON.parse(p?.completedLessons || '{}')
        } catch {
          return {}
        }
      })()
      const completedCount = Object.keys(completedMap || {}).length
      const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      return {
        id: e.id,
        user: e.user,
        course: e.course,
        enrolledAt: e.enrolledAt,
        progress: progressPercent,
        status: progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'active' : 'pending'
      }
    }))

    const statusFilter = String(status || '').trim().toLowerCase()
    const filtered =
      statusFilter && (statusFilter === 'completed' || statusFilter === 'active' || statusFilter === 'pending')
        ? subscriptions.filter((s) => s.status === statusFilter)
        : subscriptions

    res.json({
      subscriptions: filtered,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Subscriptions error:', error)
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
})

// Reports
function parseDateRange(query) {
  const now = new Date()
  const rawFrom = query?.from ? new Date(String(query.from)) : null
  const rawTo = query?.to ? new Date(String(query.to)) : null
  const from = rawFrom && !Number.isNaN(rawFrom.getTime()) ? rawFrom : new Date(now.getTime() - 30 * 86400000)
  const to = rawTo && !Number.isNaN(rawTo.getTime()) ? rawTo : now
  to.setHours(23, 59, 59, 999)
  return { from, to }
}

function parseCourseId(query) {
  const v = String(query?.courseId || '').trim()
  return v ? v : null
}

function safeJson(str, fallback) {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

router.get('/reports/overview', async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query)
    const courseId = parseCourseId(req.query)

    const whereOrders = {
      createdAt: { gte: from, lte: to },
      ...(courseId ? { enrollments: { some: { courseId } } } : {}),
    }
    const wherePaid = { ...whereOrders, status: 'paid' }

    let orders = []
    let paidOrders = []
    try {
      ;[orders, paidOrders] = await Promise.all([
        prisma.order.findMany({ where: whereOrders, select: { id: true, status: true, totalAmount: true, createdAt: true, updatedAt: true } }),
        prisma.order.findMany({ where: wherePaid, select: { totalAmount: true } }),
      ])
    } catch (err) {
      // If orders table isn't ready, return zeros
      console.warn('[Reports Overview] Order query failed:', err.message)
      orders = []
      paidOrders = []
    }

    const revenuePaid = paidOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
    const ordersByStatus = orders.reduce((acc, o) => {
      const k = String(o.status || 'unknown')
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})
    const aov = (paidOrders.length ? revenuePaid / paidOrders.length : 0)

    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: from, lte: to }, role: 'student' },
    })

    const enrollWhere = {
      enrolledAt: { gte: from, lte: to },
      ...(courseId ? { courseId } : {}),
    }
    const enrollments = await prisma.enrollment.count({ where: enrollWhere })

    // Approval time (pending -> paid) using updatedAt
    const approvals = orders
      .filter((o) => o.status === 'paid' && o.updatedAt && o.createdAt)
      .map((o) => new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime())
      .filter((ms) => Number.isFinite(ms) && ms >= 0)
    const avgApprovalMinutes = approvals.length ? Math.round((approvals.reduce((s, ms) => s + ms, 0) / approvals.length) / 60000) : 0

    res.json({
      range: { from: from.toISOString(), to: to.toISOString() },
      courseId,
      cards: {
        revenuePaid,
        aov,
        ordersByStatus,
        newUsers,
        enrollments,
        avgApprovalMinutes,
      },
    })
  } catch (error) {
    console.error('[Reports Overview] error:', error)
    res.status(500).json({ error: 'Failed to fetch overview', details: error.message })
  }
})

router.get('/reports/finance', async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query)
    const courseId = parseCourseId(req.query)
    const granularity = String(req.query?.granularity || 'day').toLowerCase() // day | month

    let orders = []
    try {
      orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: from, lte: to },
          ...(courseId ? { enrollments: { some: { courseId } } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, enrollments: { include: { course: true } } },
        take: 200,
      })
    } catch (err) {
      console.warn('[Reports Finance] Order query failed:', err.message)
      orders = []
    }

    const paid = orders.filter((o) => o.status === 'paid')
    const revenueSeriesMap = new Map()
    const fmtKey = (d) => {
      const dt = new Date(d)
      if (granularity === 'month') return dt.toISOString().slice(0, 7)
      return dt.toISOString().slice(0, 10)
    }
    paid.forEach((o) => {
      const k = fmtKey(o.createdAt)
      revenueSeriesMap.set(k, (revenueSeriesMap.get(k) || 0) + Number(o.totalAmount || 0))
    })
    const revenueSeries = Array.from(revenueSeriesMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }))

    const byStatus = orders.reduce((acc, o) => {
      const k = String(o.status || 'unknown')
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})

    res.json({
      range: { from: from.toISOString(), to: to.toISOString() },
      courseId,
      revenueSeries,
      ordersByStatus: byStatus,
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        totalAmount: o.totalAmount,
        currency: o.currency,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        user: o.user,
        courses: (o.enrollments || []).map((e) => e.course?.title).filter(Boolean),
      })),
    })
  } catch (error) {
    console.error('[Reports Finance] error:', error)
    res.status(500).json({ error: 'Failed to fetch finance report', details: error.message })
  }
})

router.get('/reports/funnel', async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query)
    const courseId = parseCourseId(req.query)

    let orders = []
    try {
      orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: from, lte: to },
          ...(courseId ? { enrollments: { some: { courseId } } } : {}),
        },
        select: { id: true, status: true, createdAt: true, updatedAt: true },
      })
    } catch (err) {
      console.warn('[Reports Funnel] Order query failed:', err.message)
      orders = []
    }

    const pending = orders.filter((o) => o.status === 'pending').length
    const paid = orders.filter((o) => o.status === 'paid').length
    const cancelled = orders.filter((o) => o.status === 'cancelled').length
    const refunded = orders.filter((o) => o.status === 'refunded').length

    const approvalMs = orders
      .filter((o) => o.status === 'paid')
      .map((o) => new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime())
      .filter((ms) => Number.isFinite(ms) && ms >= 0)
    const avgApprovalMinutes = approvalMs.length ? Math.round((approvalMs.reduce((s, v) => s + v, 0) / approvalMs.length) / 60000) : 0

    const conversionPendingToPaid = pending + paid > 0 ? Math.round((paid / (pending + paid)) * 100) : 0

    res.json({
      range: { from: from.toISOString(), to: to.toISOString() },
      courseId,
      steps: [
        { name: 'pending', value: pending },
        { name: 'paid', value: paid },
        { name: 'cancelled', value: cancelled },
        { name: 'refunded', value: refunded },
      ],
      metrics: { avgApprovalMinutes, conversionPendingToPaid },
    })
  } catch (error) {
    console.error('[Reports Funnel] error:', error)
    res.status(500).json({ error: 'Failed to fetch funnel report', details: error.message })
  }
})

router.get('/reports/learning', async (req, res) => {
  try {
    const { from, to } = parseDateRange(req.query)
    const courseId = parseCourseId(req.query)

    const courses = await prisma.course.findMany({
      where: courseId ? { id: courseId } : undefined,
      select: { id: true, title: true, enTitle: true, lessons: { select: { id: true } } },
    })
    const lessonCounts = new Map(courses.map((c) => [c.id, c.lessons?.length || 0]))

    const progresses = await prisma.progress.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        updatedAt: { gte: from, lte: to },
      },
      select: { courseId: true, completedLessons: true, quizScores: true },
      take: 2000,
    })

    const byCourse = new Map()
    courses.forEach((c) => byCourse.set(c.id, { courseId: c.id, title: c.title, totalLessons: lessonCounts.get(c.id) || 0, completionPctAvg: 0, learners: 0 }))

    progresses.forEach((p) => {
      const total = lessonCounts.get(p.courseId) || 0
      const completedMap = safeJson(p.completedLessons, {})
      const completed = Object.keys(completedMap || {}).length
      const pct = total > 0 ? (completed / total) * 100 : 0
      const row = byCourse.get(p.courseId) || { courseId: p.courseId, title: p.courseId, totalLessons: total, completionPctAvg: 0, learners: 0 }
      row.completionPctAvg += pct
      row.learners += 1
      byCourse.set(p.courseId, row)
    })

    const completion = Array.from(byCourse.values())
      .map((r) => ({
        courseId: r.courseId,
        title: r.title,
        totalLessons: r.totalLessons,
        learners: r.learners,
        completionPctAvg: r.learners ? Math.round(r.completionPctAvg / r.learners) : 0,
      }))
      .sort((a, b) => (b.learners - a.learners) || (b.completionPctAvg - a.completionPctAvg))
      .slice(0, 20)

    const quizResults = await prisma.quizResult.findMany({
      where: { submittedAt: { gte: from, lte: to } },
      select: { quizId: true, score: true, total: true },
      take: 5000,
    })
    const quizAgg = new Map()
    quizResults.forEach((r) => {
      const a = quizAgg.get(r.quizId) || { attempts: 0, scoreSum: 0, totalSum: 0, passed: 0 }
      a.attempts += 1
      a.scoreSum += Number(r.score || 0)
      a.totalSum += Number(r.total || 0)
      const pct = r.total ? (r.score / r.total) : 0
      if (pct >= 0.7) a.passed += 1
      quizAgg.set(r.quizId, a)
    })
    const quizIds = Array.from(quizAgg.keys())
    const quizMeta = quizIds.length
      ? await prisma.quiz.findMany({
          where: { id: { in: quizIds } },
          select: { id: true, type: true, title: true, lesson: { select: { title: true, courseId: true } } },
        })
      : []
    const quizMetaMap = new Map(quizMeta.map((q) => [q.id, q]))

    const quizzes = quizIds
      .map((id) => {
        const a = quizAgg.get(id)
        const q = quizMetaMap.get(id)
        const avgPct = a.totalSum ? Math.round((a.scoreSum / a.totalSum) * 100) : 0
        const passRate = a.attempts ? Math.round((a.passed / a.attempts) * 100) : 0
        return {
          quizId: id,
          title: q?.title || q?.lesson?.title || 'Quiz',
          type: q?.type || 'lesson',
          attempts: a.attempts,
          avgPct,
          passRate,
        }
      })
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 20)

    res.json({
      range: { from: from.toISOString(), to: to.toISOString() },
      courseId,
      completion,
      quizzes,
    })
  } catch (error) {
    console.error('[Reports Learning] error:', error)
    res.status(500).json({ error: 'Failed to fetch learning report', details: error.message })
  }
})

router.get('/reports/content', async (req, res) => {
  try {
    const courseId = parseCourseId(req.query)

    const whereLesson = courseId ? { courseId } : {}
    const lessonsMissingVideo = await prisma.lesson.count({
      where: { ...whereLesson, OR: [{ videoUrl: null }, { videoUrl: '' }] },
    })

    const lessons = await prisma.lesson.findMany({
      where: whereLesson,
      select: { id: true },
      take: 5000,
    })
    const lessonIds = lessons.map((l) => l.id)

    const lessonQuizzes = lessonIds.length
      ? await prisma.quiz.findMany({
          where: { type: 'lesson', lessonId: { in: lessonIds } },
          select: { id: true, lessonId: true },
        })
      : []
    const quizLessonSet = new Set(lessonQuizzes.map((q) => q.lessonId).filter(Boolean))
    const lessonsMissingQuiz = lessonIds.length ? lessonIds.filter((id) => !quizLessonSet.has(id)).length : 0

    const quizIds = lessonQuizzes.map((q) => q.id)
    const questionsByQuiz = quizIds.length
      ? await prisma.question.groupBy({
          by: ['quizId'],
          _count: { _all: true },
          where: { quizId: { in: quizIds } },
        }).catch(async (err) => {
          console.warn('[Reports Content] Question groupBy failed, falling back:', err.message)
          const qs = await prisma.question.findMany({ where: { quizId: { in: quizIds } }, select: { quizId: true } })
          const m = new Map()
          qs.forEach((r) => m.set(r.quizId, (m.get(r.quizId) || 0) + 1))
          return Array.from(m.entries()).map(([quizId, n]) => ({ quizId, _count: { _all: n } }))
        })
      : []
    const questionCountMap = new Map(questionsByQuiz.map((r) => [r.quizId, r._count._all]))
    const quizzesMissingQuestions = quizIds.filter((id) => (questionCountMap.get(id) || 0) === 0).length

    res.json({
      courseId,
      checklist: {
        lessonsMissingVideo,
        lessonsMissingQuiz,
        quizzesMissingQuestions,
      },
    })
  } catch (error) {
    console.error('[Reports Content] error:', error)
    res.status(500).json({ error: 'Failed to fetch content report', details: error.message })
  }
})

router.get('/reports/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    const byMonth = {}
    users.forEach(u => {
      const month = u.createdAt.toISOString().substring(0, 7)
      byMonth[month] = (byMonth[month] || 0) + 1
    })

    res.json({ users, byMonth, total: users.length })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user report' })
  }
})

router.get('/reports/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    })

    const report = courses.map(c => ({
      id: c.id,
      title: c.title,
      enrollments: c._count.enrollments,
      revenue: c._count.enrollments * Number(c.price)
    }))

    res.json({ courses: report, totalRevenue: report.reduce((s, r) => s + r.revenue, 0) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course report' })
  }
})

router.get('/reports/subscriptions', async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, price: true } }
      }
    })

    const report = enrollments.map(e => ({
      user: e.user.name,
      email: e.user.email,
      course: e.course.title,
      price: e.course.price,
      date: e.enrolledAt
    }))

    res.json({ subscriptions: report, total: enrollments.length })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription report' })
  }
})

// Certificate Requests
router.get('/certificate-requests', async (req, res) => {
  try {
    const { status } = req.query
    const where = status ? { status: String(status) } : {}
    const requests = await prisma.certificateRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      take: 200,
    })
    res.json({ requests })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate requests' })
  }
})

router.post(
  '/certificate-requests/:id/upload',
  uploadCertImages.fields([
    { name: 'imageAr', maxCount: 1 },
    { name: 'imageEn', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params
      const files = req.files || {}
      const fAr = Array.isArray(files.imageAr) ? files.imageAr[0] : null
      const fEn = Array.isArray(files.imageEn) ? files.imageEn[0] : null
      if (!fAr && !fEn) return res.status(400).json({ error: 'No files uploaded' })

      const updated = await prisma.certificateRequest.update({
        where: { id: String(id) },
        data: {
          certificateImageArUrl: fAr ? `/uploads/certificates/${fAr.filename}` : undefined,
          certificateImageEnUrl: fEn ? `/uploads/certificates/${fEn.filename}` : undefined,
        },
        select: {
          id: true,
          certificateImageArUrl: true,
          certificateImageEnUrl: true,
          status: true,
        },
      })
      res.status(201).json({ request: updated })
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload certificate images' })
    }
  },
)

router.put('/certificate-requests/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes, startDate, endDate } = req.body || {}
    const nextStatus = String(status || '').trim()
    if (nextStatus !== 'approved' && nextStatus !== 'rejected' && nextStatus !== 'pending') {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const parseDate = (v) => {
      if (!v) return null
      const d = new Date(String(v))
      return Number.isNaN(d.getTime()) ? null : d
    }

    // If admin approves, auto-fill start/end dates if missing
    const current = await prisma.certificateRequest.findUnique({
      where: { id: String(id) },
      select: { id: true, userId: true, courseId: true, startDate: true, endDate: true, completionAt: true },
    })
    if (!current) return res.status(404).json({ error: 'Certificate request not found' })

    let autoStart = undefined
    let autoEnd = undefined
    if (nextStatus === 'approved') {
      if (!current.startDate) {
        const enr = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: current.userId, courseId: current.courseId } },
          select: { enrolledAt: true },
        })
        autoStart = enr?.enrolledAt ? new Date(enr.enrolledAt) : undefined
      }
      if (!current.endDate) {
        autoEnd = current.completionAt ? new Date(current.completionAt) : new Date()
      }
    }

    const updated = await prisma.certificateRequest.update({
      where: { id: String(id) },
      data: {
        status: nextStatus,
        notes: notes === undefined ? undefined : (notes || null),
        startDate:
          startDate === undefined
            ? autoStart
            : parseDate(startDate),
        endDate:
          endDate === undefined
            ? autoEnd
            : parseDate(endDate),
        issuedAt: nextStatus === 'approved' ? new Date() : null,
      },
    })
    res.json({ request: updated })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certificate request' })
  }
})

// Orders Management
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = status ? { status } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          enrollments: { include: { course: true } },
          transactions: true
        }
      }),
      prisma.order.count({ where })
    ])

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        enrollments: { include: { course: true } },
        transactions: true,
        refunds: true
      }
    })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const nextStatus = String(status || '').trim()
    const order = await prisma.order.update({
      where: { id },
      data: { status: nextStatus }
    })

    if (nextStatus === 'paid') {
      // Mark mock transaction as success (if present)
      await prisma.transaction.updateMany({
        where: { orderId: order.id, status: 'pending' },
        data: { status: 'success' },
      })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// Transactions
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: { user: { select: { name: true, email: true } } }
          }
        }
      }),
      prisma.transaction.count()
    ])

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// Coupons Management
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { course: { select: { id: true, title: true, enTitle: true } } },
    })
    res.json({ coupons })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' })
  }
})

router.post('/coupons', async (req, res) => {
  try {
    const { code, courseId, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, startDate, expiryDate, isActive } = req.body
    if (!courseId) return res.status(400).json({ error: 'courseId is required' })
    const coupon = await prisma.coupon.create({
      data: {
        code,
        courseId: String(courseId),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: startDate ? new Date(startDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    })
    res.status(201).json(coupon)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon' })
  }
})

router.put('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    if (data.courseId === undefined || data.courseId === null || String(data.courseId).trim() === '') {
      return res.status(400).json({ error: 'courseId is required' })
    }
    data.courseId = String(data.courseId)
    if (data.discountValue) data.discountValue = parseFloat(data.discountValue)
    if (data.minOrderAmount) data.minOrderAmount = parseFloat(data.minOrderAmount)
    if (data.maxDiscount) data.maxDiscount = parseFloat(data.maxDiscount)
    if (data.usageLimit) data.usageLimit = parseInt(data.usageLimit)
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate)

    const coupon = await prisma.coupon.update({
      where: { id },
      data
    })
    res.json(coupon)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coupon' })
  }
})

router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.coupon.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' })
  }
})

// Refunds
router.get('/refunds', async (req, res) => {
  try {
    const refunds = await prisma.refund.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    })
    res.json({ refunds })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch refunds' })
  }
})

router.post('/refunds', async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body
    
    // Create refund and update order status
    const [refund] = await prisma.$transaction([
      prisma.refund.create({
        data: { orderId, amount: parseFloat(amount), reason, status: 'completed' }
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'refunded' }
      })
    ])
    
    res.status(201).json(refund)
  } catch (error) {
    res.status(500).json({ error: 'Failed to process refund' })
  }
})

// RBAC Management
router.get('/rbac/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } }
      }
    })
    res.json({ roles })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' })
  }
})

router.post('/rbac/roles', async (req, res) => {
  try {
    const { name, description, permissions } = req.body
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions.map(id => ({ permissionId: id }))
        }
      }
    })
    res.status(201).json(role)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' })
  }
})

router.put('/rbac/roles/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, permissions } = req.body
    
    // Update role and sync permissions
    await prisma.role.update({
        where: { id },
        data: { name, description }
    })
    
    await prisma.rolePermission.deleteMany({ where: { roleId: id } })
    
    if (permissions && permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map(pId => ({ roleId: id, permissionId: pId }))
      })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Role update error:', error)
    res.status(500).json({ error: 'Failed to update role' })
  }
})

router.delete('/rbac/roles/:id', async (req, res) => {
  try {
    const { id } = req.params
    const usersCount = await prisma.user.count({ where: { roleId: id } })
    if (usersCount > 0) {
      return res.status(409).json({
        error: `Cannot delete role: assigned to ${usersCount} user(s). Reassign users first.`,
      })
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } })
      await tx.role.delete({ where: { id } })
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Role delete error:', error)
    res.status(500).json({ error: 'Failed to delete role' })
  }
})

router.get('/rbac/permissions', async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany()
    res.json({ permissions })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' })
  }
})

// About Page Management
router.get('/about', async (req, res) => {
  try {
    let about = await prisma.about.findFirst()
    if (!about) {
      about = await prisma.about.create({
        data: {
          titleAr: 'عن الأكاديمية',
          titleEn: 'About Academy',
          contentAr: 'المحتوى هنا...',
          contentEn: 'Content here...',
        }
      })
    }
    res.json(about)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch about content' })
  }
})

router.put('/about', async (req, res) => {
  try {
    const { titleAr, titleEn, contentAr, contentEn, videoUrl, imageUrl } = req.body
    const existing = await prisma.about.findFirst()
    
    let about;
    if (existing) {
      about = await prisma.about.update({
        where: { id: existing.id },
        data: { titleAr, titleEn, contentAr, contentEn, videoUrl, imageUrl }
      })
    } else {
      about = await prisma.about.create({
        data: { titleAr, titleEn, contentAr, contentEn, videoUrl, imageUrl }
      })
    }
    res.json(about)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update about content' })
  }
})

// Home Page Management (CMS)
router.get('/home', async (req, res) => {
  try {
    let home = await prisma.homePage.findFirst()
    if (!home) {
      home = await prisma.homePage.create({ data: defaultHomeData() })
    }
    res.json({
      ...home,
      featuresArParsed: parseJson(home.featuresAr),
      featuresEnParsed: parseJson(home.featuresEn),
      testimonialsArParsed: parseJson(home.testimonialsAr),
      testimonialsEnParsed: parseJson(home.testimonialsEn),
      stepsArParsed: parseJson(home.stepsAr),
      stepsEnParsed: parseJson(home.stepsEn),
    })
  } catch (error) {
    console.error('[Admin] Home get error:', error)
    res.status(500).json({ error: 'Failed to fetch home content' })
  }
})

router.put('/home', async (req, res) => {
  try {
    const existing = await prisma.homePage.findFirst()

    const data = { ...req.body }
    const featuresArArr = normalizeJsonArray(data.featuresAr)
    const featuresEnArr = normalizeJsonArray(data.featuresEn)
    const testimonialsArArr = normalizeJsonArray(data.testimonialsAr)
    const testimonialsEnArr = normalizeJsonArray(data.testimonialsEn)
    const stepsArArr = normalizeJsonArray(data.stepsAr)
    const stepsEnArr = normalizeJsonArray(data.stepsEn)

    if (featuresArArr !== undefined) data.featuresAr = Array.isArray(featuresArArr) ? JSON.stringify(featuresArArr) : null
    if (featuresEnArr !== undefined) data.featuresEn = Array.isArray(featuresEnArr) ? JSON.stringify(featuresEnArr) : null
    if (testimonialsArArr !== undefined) data.testimonialsAr = Array.isArray(testimonialsArArr) ? JSON.stringify(testimonialsArArr) : null
    if (testimonialsEnArr !== undefined) data.testimonialsEn = Array.isArray(testimonialsEnArr) ? JSON.stringify(testimonialsEnArr) : null
    if (stepsArArr !== undefined) data.stepsAr = Array.isArray(stepsArArr) ? JSON.stringify(stepsArArr) : null
    if (stepsEnArr !== undefined) data.stepsEn = Array.isArray(stepsEnArr) ? JSON.stringify(stepsEnArr) : null

    // allow clearing fields by sending null
    if (data.featuresAr === null) data.featuresAr = null
    if (data.featuresEn === null) data.featuresEn = null
    if (data.testimonialsAr === null) data.testimonialsAr = null
    if (data.testimonialsEn === null) data.testimonialsEn = null
    if (data.stepsAr === null) data.stepsAr = null
    if (data.stepsEn === null) data.stepsEn = null

    let home
    if (existing) {
      home = await prisma.homePage.update({
        where: { id: existing.id },
        data,
      })
    } else {
      home = await prisma.homePage.create({ data })
    }

    res.json(home)
  } catch (error) {
    console.error('[Admin] Home update error:', error)
    res.status(500).json({ error: 'Failed to update home content' })
  }
})

// Contact Management
router.get('/contact/messages', async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json({ messages })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

router.put('/contact/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' })
  }
})

router.delete('/contact/messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.contactMessage.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

router.get('/contact/info', async (req, res) => {
  try {
    let info = await prisma.contactInfo.findFirst()
    if (!info) {
      info = await prisma.contactInfo.create({ data: {} })
    }
    res.json(info)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact info' })
  }
})

router.put('/contact/info', async (req, res) => {
  try {
    const data = req.body
    const existing = await prisma.contactInfo.findFirst()
    let info;
    if (existing) {
      info = await prisma.contactInfo.update({
        where: { id: existing.id },
        data
      })
    } else {
      info = await prisma.contactInfo.create({ data })
    }
    res.json(info)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact info' })
  }
})