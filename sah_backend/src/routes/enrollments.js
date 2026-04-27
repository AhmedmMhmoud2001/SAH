import { Router } from 'express'
import prisma from '../lib/db.js'
import { authenticate } from './auth.js'

export const router = Router()

router.post('/', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body
    const { userId } = req.user
    
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })
    
    if (existing) {
      return res.status(400).json({ error: 'Already enrolled' })
    }
    
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId
      }
    })
    
    await prisma.progress.create({
      data: {
        userId,
        courseId,
        completedLessons: '{}',
        quizScores: '{}'
      }
    })
    
    res.status(201).json({
      enrollmentId: enrollment.id,
      courseId,
      enrolledAt: enrollment.enrolledAt
    })
  } catch (error) {
    throw error
  }
})

router.get('/', authenticate, async (req, res) => {
  try {
    const { userId } = req.user
    
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        order: { select: { id: true, status: true } },
        course: {
          include: {
            lessons: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })
    
    const courseIds = enrollments.map(e => e.courseId)
    
    const progressList = await prisma.progress.findMany({
      where: {
        userId,
        courseId: { in: courseIds }
      }
    })
    
    const progressMap = {}
    progressList.forEach(p => {
      progressMap[p.courseId] = p
    })
    
    const lang = req.query.lang || 'ar'
    const origin = `${req.protocol}://${req.get('host')}`
    
    const result = enrollments.map(e => {
      const p = progressMap[e.courseId]
      const total = e.course.lessons?.length || 0
      const completed = p ? Object.keys(JSON.parse(p.completedLessons || '{}')).length : 0
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0
      const rawImage = e.course.imageUrl || ''
      const fullImage = rawImage
        ? (/^https?:\/\//i.test(rawImage) ? rawImage : `${origin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`)
        : ''
      
      return {
        enrollmentId: e.id,
        courseId: e.courseId,
        orderId: e.order?.id || null,
        orderStatus: e.order?.status || null,
        course: {
          id: e.course.id,
          title: lang === 'en' && e.course.enTitle ? e.course.enTitle : e.course.title,
          shortDesc: lang === 'en' ? e.course.enShortDesc : e.course.shortDesc,
          image: fullImage
        },
        progress: percent,
        completedLessons: completed,
        totalLessons: total,
        enrolledAt: e.enrolledAt
      }
    })
    
    res.json({ enrollments: result })
  } catch (error) {
    throw error
  }
})