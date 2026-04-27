import { Router } from 'express'
import prisma from '../lib/db.js'
import { authenticate } from './auth.js'
import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ejs from 'ejs'

export const router = Router()

router.use(authenticate)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getPlatformLogoDataUrl() {
  // Prefer the new SAH PNG logo (dashboard asset).
  const absPng = path.join(__dirname, '..', '..', '..', 'sah_dashboard', 'src', 'assets', 'Frame 4 (1).png')
  try {
    const buf = fs.readFileSync(absPng)
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    // Fallback to frontend svg logo.
    const absSvg = path.join(__dirname, '..', '..', '..', 'sah_frontend', 'public', 'assets', 'img_home', 'logo.svg')
    try {
      const svg = fs.readFileSync(absSvg, 'utf8')
      const encoded = encodeURIComponent(svg).replace(/%0A/g, '').replace(/%20/g, ' ')
      return `data:image/svg+xml;charset=utf-8,${encoded}`
    } catch {
      return ''
    }
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(d, locale = 'ar-SA') {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return ''
  }
}

function guessChromeExecutablePath() {
  // Prefer env override for reliability in deployments
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  // Common Windows locations
  const candidates = [
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
    'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
  ]
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p
    } catch {
      // ignore
    }
  }
  return null
}

async function renderCertificateHtml({ lang, studentName, trackName, sessionsCount, issuedAt, serialNumber }) {
  const isAr = lang !== 'en'
  const dir = isAr ? 'rtl' : 'ltr'
  const locale = isAr ? 'ar-SA' : 'en-US'
  const logoDataUrl = getPlatformLogoDataUrl()

  const date = formatDate(issuedAt, locale)

  const locals = {
    lang: isAr ? 'ar' : 'en',
    dir,
    logoDataUrl,
    studentName,
    trackName,
    sessionsCount,
    date,
    serialNumber,

    certificateTitle: isAr ? 'CERTIFICATE' : 'CERTIFICATE',
    officialText: isAr ? 'نفخر بتقديم هذه الشهادة الرسمية' : 'We are proud to present this official certificate',
    presentedToText: isAr ? 'للعضو المتميز والمبدع :' : 'This certificate is presented to:',
    descriptionPrefix: isAr ? 'بمناسبة إجتياز البرنامج التدريبي المكثف بعنوان' : 'For successfully completing the intensive training program titled',
    sessionsPrefix: isAr ? 'بواقع' : 'Consisting of',
    sessionsSuffix: isAr ? 'جلسة تعليمية تفاعلية تتضمن مشاريع عملية وتدريبات،' : 'interactive sessions with practical projects and exercises,',
    descriptionSuffix: isAr ? 'وقد أظهر مستوى متميزاً من المهارة والالتزام.' : 'demonstrating outstanding commitment and skill.',
    wishText: isAr ? 'نتمنى له دوام التوفيق والنجاح!' : 'We wish you continued success!',
    dateLabel: isAr ? 'التاريخ / Date' : 'Date',
    verificationLabel: isAr ? 'رقم التحقق / Verification ID' : 'Verification ID',
    supervisorLabel: isAr ? 'المشرف الأكاديمي' : 'Academic supervisor',
    supervisorValue: isAr ? 'إدارة الأكاديمية' : 'Academy administration',
    badgeTopText: isAr ? 'SAH' : 'SAH',
    badgeBottomText: isAr ? 'ACADEMY' : 'ACADEMY',
    badgeIcon: isAr ? 'S' : 'S',
  }

  const templatePath = path.join(__dirname, '..', 'templates', 'certificate.ejs')
  return await ejs.renderFile(templatePath, locals, { async: true })
}

router.get('/my', async (req, res) => {
  try {
    const { userId } = req.user
    const requests = await prisma.certificateRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        courseId: true,
        fullName: true,
        fullNameEn: true,
        startDate: true,
        endDate: true,
        status: true,
        notes: true,
        issuedAt: true,
        certificateImageArUrl: true,
        certificateImageEnUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    res.json({ requests })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate requests' })
  }
})

router.get('/pdf/:courseId', async (req, res) => {
  try {
    const { userId } = req.user
    const courseId = String(req.params.courseId || '')
    const lang = String(req.query.lang || 'ar').toLowerCase() === 'en' ? 'en' : 'ar'

    if (!courseId) return res.status(400).json({ error: 'courseId is required' })

    const reqRow = await prisma.certificateRequest.findFirst({
      where: { userId, courseId },
      include: {
        course: { select: { title: true, enTitle: true } },
      },
    })
    if (!reqRow) return res.status(404).json({ error: 'Certificate request not found' })
    if (reqRow.status !== 'approved') return res.status(403).json({ error: 'Certificate is not approved yet' })

    const name = lang === 'en' ? (reqRow.fullNameEn || reqRow.fullName) : (reqRow.fullName || reqRow.fullNameEn)
    const courseTitle = lang === 'en' ? (reqRow.course?.enTitle || reqRow.course?.title || '') : (reqRow.course?.title || reqRow.course?.enTitle || '')

    const startDate = reqRow.startDate
    const endDate = reqRow.endDate
    const issuedAt = reqRow.issuedAt || new Date()

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Certificate dates are missing' })
    }

    const sessionsCount = reqRow.course?.duration || `${await prisma.lesson.count({ where: { courseId } })}`
    const serialNumber = String(reqRow.id || '').slice(0, 12).toUpperCase()
    const html = await renderCertificateHtml({
      lang,
      studentName: name || '-',
      trackName: courseTitle || '-',
      sessionsCount,
      issuedAt,
      serialNumber,
    })

    const executablePath = guessChromeExecutablePath()
    if (!executablePath) {
      return res.status(500).json({
        error: 'Chrome/Edge executable not found for PDF generation',
        hint: 'Install Google Chrome or set CHROME_PATH env var',
      })
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
      })

      const filename = `certificate_${courseId}_${lang}.pdf`
      res.setHeader('Content-Type', 'application/pdf')
      const download = String(req.query.download || '').trim() === '1'
      res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${filename}"`)
      res.setHeader('Cache-Control', 'no-store')
      return res.send(pdf)
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('[Certificates] PDF generation failed:', error)
    return res.status(500).json({ error: 'Failed to generate certificate PDF' })
  }
})

router.post('/request', async (req, res) => {
  try {
    const { userId } = req.user
    const { courseId, fullName, fullNameEn } = req.body || {}
    if (!courseId) return res.status(400).json({ error: 'courseId is required' })
    if (!String(fullName || '').trim()) return res.status(400).json({ error: 'fullName is required' })
    if (!String(fullNameEn || '').trim()) return res.status(400).json({ error: 'fullNameEn is required' })

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: String(courseId) } },
      include: { order: { select: { status: true } } },
    })
    if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this course' })
    if (enrollment.orderId && enrollment.order?.status !== 'paid') {
      return res.status(403).json({ error: 'Course access is not approved yet' })
    }

    const totalLessons = await prisma.lesson.count({ where: { courseId: String(courseId) } })
    const progress = await prisma.progress.findFirst({
      where: { userId, courseId: String(courseId) },
      select: { completedLessons: true },
    })
    const completedMap = (() => {
      try {
        return JSON.parse(progress?.completedLessons || '{}')
      } catch {
        return {}
      }
    })()
    const completedCount = Object.keys(completedMap || {}).length
    if (totalLessons > 0 && completedCount < totalLessons) {
      return res.status(400).json({ error: 'Course is not completed yet' })
    }
    const completionAt = progress?.updatedAt ? new Date(progress.updatedAt) : new Date()

    const existing = await prisma.certificateRequest.findFirst({
      where: { userId, courseId: String(courseId) },
      select: { id: true, status: true },
    })
    if (existing) return res.status(409).json({ error: 'Certificate request already exists', request: existing })

    const created = await prisma.certificateRequest.create({
      data: {
        userId,
        courseId: String(courseId),
        fullName: String(fullName).trim(),
        fullNameEn: String(fullNameEn).trim(),
        completionAt,
        status: 'pending',
      },
      select: { id: true, courseId: true, status: true, createdAt: true },
    })
    res.status(201).json({ request: created })
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Certificate request already exists' })
    }
    res.status(500).json({ error: 'Failed to create certificate request' })
  }
})

