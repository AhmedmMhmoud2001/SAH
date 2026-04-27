import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authenticate, requireAdmin } from './auth.js'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif']

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
    limits: { fileSize: 5 * 1024 * 1024 },
  })
}

const uploadCourseImage = makeUploader({ subdir: 'courses', prefix: 'course' })
const uploadAboutImage = makeUploader({ subdir: 'about', prefix: 'about' })
const uploadLessonThumb = makeUploader({ subdir: 'lessons', prefix: 'lesson' })
const uploadHomeHeroImage = makeUploader({ subdir: 'home', prefix: 'home_hero' })
const uploadHomeFeatureIcon = makeUploader({ subdir: 'home', prefix: 'home_feature' })
const uploadHomeTestimonialAvatar = makeUploader({ subdir: 'home', prefix: 'home_testimonial' })

// Admin-only upload endpoint
router.use(authenticate)
router.use(requireAdmin)

router.post('/course-image', uploadCourseImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const urlPath = `/uploads/courses/${req.file.filename}`
  res.status(201).json({ url: urlPath })
})

router.post('/about-image', uploadAboutImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const urlPath = `/uploads/about/${req.file.filename}`
  res.status(201).json({ url: urlPath })
})

router.post('/lesson-thumbnail', uploadLessonThumb.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const urlPath = `/uploads/lessons/${req.file.filename}`
  res.status(201).json({ url: urlPath })
})

router.post('/home-hero-image', uploadHomeHeroImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const urlPath = `/uploads/home/${req.file.filename}`
  res.status(201).json({ url: urlPath })
})

router.post('/home-feature-icon', uploadHomeFeatureIcon.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const urlPath = `/uploads/home/${req.file.filename}`
  res.status(201).json({ url: urlPath })
})

router.post('/home-testimonial-avatar', uploadHomeTestimonialAvatar.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const urlPath = `/uploads/home/${req.file.filename}`
  res.status(201).json({ url: urlPath })
})

export { router }

