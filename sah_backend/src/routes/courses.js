import { Router } from 'express'
import prisma from '../lib/db.js'

export const router = Router()

router.get('/', async (req, res) => {
  try {
    const { lang = 'ar', page = 1, limit = 8, featured } = req.query
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const where = featured === 'true' ? { isFeatured: true } : {}
    
    const [courses, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.course.count({ where })
    ])
    
    const formatted = courses.map(c => formatCourse(c, lang))
    
    res.json({
      courses: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    throw error
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { lang = 'ar' } = req.query
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    res.json(formatCourse(course, lang, true))
  } catch (error) {
    throw error
  }
})

router.get('/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' }
        },
        quizzes: true
      }
    })
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    const lang = req.query.lang || 'ar'
    const lessonQuizMap = {}
    let finalQuiz = null
    course.quizzes.forEach((q) => {
      if (q.lessonId) lessonQuizMap[q.lessonId] = q
      if (q.type === 'final') finalQuiz = q
    })
    
    const lessons = course.lessons.map(l => ({
      id: l.id,
      title: lang === 'en' && l.enTitle ? l.enTitle : l.title,
      enTitle: l.enTitle,
      duration: l.duration,
      videoUrl: l.videoUrl,
      thumbnailUrl: l.thumbnailUrl,
      type: l.type,
      sortOrder: l.sortOrder,
      quiz: lessonQuizMap[l.id]
        ? {
            id: lessonQuizMap[l.id].id,
            title:
              lang === 'en' && lessonQuizMap[l.id].enTitle
                ? lessonQuizMap[l.id].enTitle
                : lessonQuizMap[l.id].title,
            type: lessonQuizMap[l.id].type
          }
        : null
    }))
    
    res.json({
      lessons,
      finalQuiz: finalQuiz
        ? {
            id: finalQuiz.id,
            title: lang === 'en' && finalQuiz.enTitle ? finalQuiz.enTitle : finalQuiz.title,
            type: finalQuiz.type
          }
        : null
    })
  } catch (error) {
    throw error
  }
})

router.get('/:id/quizzes/final', async (req, res) => {
  try {
    const { id } = req.params
    const { lang = 'ar' } = req.query

    const quiz = await prisma.quiz.findFirst({
      where: { courseId: id, type: 'final' }
    })

    if (!quiz) return res.status(404).json({ error: 'Final quiz not found' })

    res.json({
      id: quiz.id,
      type: quiz.type,
      title: lang === 'en' && quiz.enTitle ? quiz.enTitle : quiz.title
    })
  } catch (error) {
    throw error
  }
})

function formatCourse(course, lang, includeLessons = false) {
  const base = {
    id: course.id,
    code: course.code,
    title: lang === 'en' && course.enTitle ? course.enTitle : course.title,
    enTitle: course.enTitle,
    shortDesc: lang === 'en' ? course.enShortDesc : course.shortDesc,
    longDesc: lang === 'en' ? course.enLongDesc : course.longDesc,
    duration: course.duration,
    students: course.students,
    level: course.level,
    price: course.price,
    image: course.imageUrl,
    isFeatured: course.isFeatured,
    curriculum: parseJson(lang === 'en' ? course.enCurriculum : course.curriculum),
    enCurriculum: parseJson(course.enCurriculum),
    curriculumDetails: parseJson(lang === 'en' ? course.enCurriculumDetails : course.curriculumDetails),
    enCurriculumDetails: parseJson(course.enCurriculumDetails),
    audience: parseJson(lang === 'en' ? course.enAudience : course.audience),
    enAudience: parseJson(course.enAudience),
    certificateText: lang === 'en' ? course.enCertificateText : course.certificateText,
    enCertificateText: course.enCertificateText
  }
  
  if (includeLessons) {
    return {
      ...base,
      lessons: course.lessons.map(l => ({
        id: l.id,
        title: lang === 'en' && l.enTitle ? l.enTitle : l.title,
        enTitle: l.enTitle,
        duration: l.duration,
        videoUrl: l.videoUrl,
        type: l.type,
        sortOrder: l.sortOrder
      }))
    }
  }
  
  return base
}

function parseJson(str) {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}