import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import { router as authRoutes } from './routes/auth.js'
import { router as courseRoutes } from './routes/courses.js'
import { router as progressRoutes } from './routes/progress.js'
import { router as quizRoutes } from './routes/quiz.js'
import { router as enrollmentRoutes } from './routes/enrollments.js'
import { router as checkoutRoutes } from './routes/checkout.js'
import { router as adminRoutes } from './routes/admin.js'
import { router as aboutRoutes } from './routes/about.js'
import { router as contactRoutes } from './routes/contact.js'
import { router as homeRoutes } from './routes/home.js'
import { router as uploadRoutes } from './routes/uploads.js'
import { router as certificateRoutes } from './routes/certificates.js'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
  origin: '*',
  credentials: true
}))
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

console.log('Mounting routes...')
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/checkout', checkoutRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/certificates', certificateRoutes)

// Public routes
app.use('/api/home', homeRoutes)
app.use('/api/about', aboutRoutes)
app.use('/api/contact', contactRoutes)


console.log('Routes mounted successfully')

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res, next) => {
  console.log(`[404] ${req.method} ${req.url}`)
  res.status(404).json({ error: 'Route not found', path: req.url })
})

app.use((err, req, res, next) => {
  // Handle invalid JSON bodies (e.g., malformed request payload)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON body',
      message: err.message,
    })
  }
  console.error('[500] Error at:', req.method, req.url)
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

app.listen(PORT, () => {
  console.log(`🚀 SAH Backend running on port ${PORT}`)
})