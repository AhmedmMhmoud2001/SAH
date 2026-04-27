import { Router } from 'express'
import prisma from '../lib/db.js'

export const router = Router()

console.log('[About Routes] Module loaded')

// Public route to fetch About page content
router.get('/', async (req, res) => {
  console.log('[About] Fetching public content')

  try {
    const about = await prisma.about.findFirst()
    if (!about) {
      console.log('[About] No content found, returning defaults')
      return res.json({
        titleAr: 'عن الأكاديمية',
        titleEn: 'About Academy',
        contentAr: '<p>مرحباً بكم في SAH Academy</p>',
        contentEn: '<p>Welcome to SAH Academy</p>',
        videoUrl: '',
        imageUrl: ''
      })
    }
    res.json(about)
  } catch (error) {
    console.error('[About] Error:', error)
    res.status(500).json({ error: 'Failed to fetch about content', details: error.message })
  }
})

