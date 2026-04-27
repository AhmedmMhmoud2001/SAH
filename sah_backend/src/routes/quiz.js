import { Router } from 'express'
import prisma from '../lib/db.js'
import { authenticate } from './auth.js'

export const router = Router()

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { lang = 'ar' } = req.query
    
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true
      }
    })
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    
    const formatted = {
      id: quiz.id,
      type: quiz.type,
      title: lang === 'en' && quiz.enTitle ? quiz.enTitle : quiz.title,
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: lang === 'en' && q.textEn ? q.textEn : q.text,
        options: parseJson(q.options),
        optionsEn: parseJson(q.optionsEn)
      }))
    }
    
    res.json(formatted)
  } catch (error) {
    throw error
  }
})

router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.user
    const { answers } = req.body
    
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: { select: { id: true, courseId: true } },
        questions: {
          orderBy: { id: 'asc' }
        }
      }
    })
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const courseId = quiz.courseId || quiz.lesson?.courseId
    if (!courseId) {
      return res.status(400).json({ error: 'Quiz is not linked to a course' })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })
    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' })
    }
    
    let score = 0
    const results = quiz.questions.map((q, idx) => {
      const userAnswer = answers[idx]
      const correct = userAnswer === q.correctIndex
      if (correct) score++
      return {
        questionId: q.id,
        userAnswer,
        correct
      }
    })
    
    await prisma.quizResult.create({
      data: {
        userId,
        quizId: id,
        score,
        total: quiz.questions.length
      }
    })

    const progress = await prisma.progress.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })

    const parsed = (() => {
      try {
        return JSON.parse(progress?.quizScores || '{}')
      } catch {
        return {}
      }
    })()
    parsed[id] = { score, total: quiz.questions.length, at: new Date().toISOString() }

    if (progress) {
      await prisma.progress.update({
        where: { id: progress.id },
        data: { quizScores: JSON.stringify(parsed) }
      })
    } else {
      await prisma.progress.create({
        data: {
          userId,
          courseId,
          completedLessons: '{}',
          quizScores: JSON.stringify(parsed)
        }
      })
    }
    
    res.json({
      score,
      total: quiz.questions.length,
      passed: score >= quiz.questions.length * 0.7,
      results
    })
  } catch (error) {
    throw error
  }
})

function parseJson(str) {
  if (!str) return []
  try {
    return JSON.parse(str)
  } catch {
    return []
  }
}