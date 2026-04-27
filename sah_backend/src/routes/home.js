import { Router } from 'express'
import prisma from '../lib/db.js'

export const router = Router()

function parseJson(str) {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

function formatHome(home, lang) {
  const isEn = lang === 'en'
  return {
    id: home.id,
    heroTitle: isEn ? home.heroTitleEn : home.heroTitleAr,
    heroBrand: home.heroBrand,
    heroSubtitle: isEn ? home.heroSubtitleEn : home.heroSubtitleAr,
    heroCtaLabel: isEn ? home.heroCtaLabelEn : home.heroCtaLabelAr,
    heroCtaHref: home.heroCtaHref,
    introVideoUrl: home.introVideoUrl,
    heroImageUrl: home.heroImageUrl,
    features: parseJson(isEn ? home.featuresEn : home.featuresAr) || [],
    testimonials: parseJson(isEn ? home.testimonialsEn : home.testimonialsAr) || [],
    steps: parseJson(isEn ? home.stepsEn : home.stepsAr) || [],
    ctaTitle: isEn ? home.ctaTitleEn : home.ctaTitleAr,
    ctaSub: isEn ? home.ctaSubEn : home.ctaSubAr,
    ctaBtn: isEn ? home.ctaBtnEn : home.ctaBtnAr,
    ctaHref: home.ctaHref,
    updatedAt: home.updatedAt,
  }
}

router.get('/', async (req, res) => {
  const lang = req.query.lang === 'en' ? 'en' : 'ar'
  try {
    const home = await prisma.homePage.findFirst({ orderBy: { updatedAt: 'desc' } })
    if (!home) {
      return res.json({
        heroTitle: null,
        heroBrand: null,
        heroSubtitle: null,
        heroCtaLabel: null,
        heroCtaHref: '#courses',
        introVideoUrl: null,
        heroImageUrl: null,
        features: [],
        testimonials: [],
        steps: [],
        ctaTitle: null,
        ctaSub: null,
        ctaBtn: null,
        ctaHref: '#courses',
      })
    }
    return res.json(formatHome(home, lang))
  } catch (error) {
    console.error('[Home] Error:', error)
    res.status(500).json({ error: 'Failed to fetch home content', details: error.message })
  }
})

