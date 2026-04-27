import { Router } from 'express'
import prisma from '../lib/db.js'
import { authenticate } from './auth.js'

export const router = Router()

router.get('/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params
    const { userId } = req.user
    
    const progress = await prisma.progress.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    })
    
    if (!progress) {
      return res.status(404).json({ error: 'Not enrolled in this course' })
    }
    
    res.json({
      completedLessons: JSON.parse(progress.completedLessons || '{}'),
      lastLessonId: progress.lastLessonId,
      quizScores: JSON.parse(progress.quizScores || '{}')
    })
  } catch (error) {
    throw error
  }
})

router.post('/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params
    const { userId } = req.user
    const { lessonId, completed } = req.body
    
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })
    
    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' })
    }
    
    let progress = await prisma.progress.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })
    
    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId,
          courseId,
          completedLessons: '{}',
          quizScores: '{}'
        }
      })
    }
    
    if (lessonId !== undefined) {
      const parsed = JSON.parse(progress.completedLessons || '{}')
      if (completed) {
        parsed[lessonId] = true
      } else {
        delete parsed[lessonId]
      }
      
      progress = await prisma.progress.update({
        where: { id: progress.id },
        data: {
          completedLessons: JSON.stringify(parsed),
          lastLessonId: lessonId
        }
      })
    }
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: true
      }
    })
    
    const final = JSON.parse(progress.completedLessons || '{}')
    const total = course.lessons.length
    const done = Object.keys(final).length
    const percent = total > 0 ? Math.round((done / total) * 100) : 0
    
    res.json({
      completedLessons: final,
      lastLessonId: progress.lastLessonId,
      quizScores: JSON.parse(progress.quizScores || '{}'),
      progress: percent
    })
  } catch (error) {
    throw error
  }
})

router.post('/:courseId/quiz', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params
    const { userId } = req.user
    const { quizId, score, total } = req.body
    
    const progress = await prisma.progress.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })
    
    if (!progress) {
      return res.status(403).json({ error: 'Not enrolled in this course' })
    }
    
    const parsed = JSON.parse(progress.quizScores || '{}')
    parsed[quizId] = { score, total, at: new Date().toISOString() }
    
    await prisma.progress.update({
      where: { id: progress.id },
      data: { quizScores: JSON.stringify(parsed) }
    })
    
    await prisma.quizResult.create({
      data: {
        userId,
        quizId,
        score,
        total
      }
    })
    
    res.json({ success: true, score, total })
  } catch (error) {
    throw error
  }
})