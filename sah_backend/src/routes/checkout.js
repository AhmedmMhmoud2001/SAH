import { Router } from 'express'
import prisma from '../lib/db.js'
import { authenticate } from './auth.js'

export const router = Router()

router.use(authenticate)

function now() {
  return new Date()
}

function computeDiscount({ price, coupon }) {
  const originalTotal = Number(price || 0)
  if (!coupon) return { originalTotal, discountAmount: 0, finalTotal: originalTotal }

  let discountAmount = 0
  if (coupon.discountType === 'percentage') {
    discountAmount = (originalTotal * Number(coupon.discountValue || 0)) / 100
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Number(coupon.discountValue || 0)
  }

  if (coupon.maxDiscount != null) {
    discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount))
  }

  discountAmount = Math.max(0, Math.min(originalTotal, discountAmount))
  const finalTotal = Math.max(0, originalTotal - discountAmount)
  return { originalTotal, discountAmount, finalTotal }
}

async function getValidCoupon({ courseId, couponCode }) {
  const code = String(couponCode || '').trim().toUpperCase()
  if (!code) return null

  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon) throw Object.assign(new Error('Coupon not found'), { status: 404 })
  if (!coupon.isActive) throw Object.assign(new Error('Coupon is not active'), { status: 400 })
  if (coupon.startDate && now() < coupon.startDate) throw Object.assign(new Error('Coupon not started'), { status: 400 })
  if (coupon.expiryDate && now() > coupon.expiryDate) throw Object.assign(new Error('Coupon expired'), { status: 400 })
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit)
    throw Object.assign(new Error('Coupon usage limit reached'), { status: 400 })
  if (coupon.courseId && coupon.courseId !== courseId)
    throw Object.assign(new Error('Coupon not valid for this course'), { status: 400 })

  return coupon
}

router.post('/validate', async (req, res) => {
  try {
    const { courseId, couponCode } = req.body || {}
    if (!courseId) return res.status(400).json({ error: 'courseId is required' })
    if (!couponCode) return res.status(400).json({ error: 'couponCode is required' })

    const course = await prisma.course.findUnique({ where: { id: String(courseId) } })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const coupon = await getValidCoupon({ courseId: course.id, couponCode })
    const totals = computeDiscount({ price: course.price, coupon })

    res.json({
      courseId: course.id,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      ...totals,
    })
  } catch (err) {
    const status = err?.status || 500
    res.status(status).json({ error: err?.message || 'Failed to validate coupon' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { courseId, couponCode } = req.body || {}
    const { userId } = req.user
    if (!courseId) return res.status(400).json({ error: 'courseId is required' })

    const course = await prisma.course.findUnique({ where: { id: String(courseId) } })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    })
    if (existing) {
      return res.json({ alreadyEnrolled: true, enrollmentId: existing.id, courseId: course.id })
    }

    const coupon = couponCode ? await getValidCoupon({ courseId: course.id, couponCode }) : null
    const { originalTotal, discountAmount, finalTotal } = computeDiscount({ price: course.price, coupon })

    const result = await prisma.$transaction(async (tx) => {
      if (coupon) {
        await tx.coupon.update({
          where: { code: coupon.code },
          data: { usageCount: { increment: 1 } },
        })
      }

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: finalTotal,
          currency: 'SAR',
          status: 'pending',
          couponCode: coupon ? coupon.code : null,
        },
      })

      await tx.transaction.create({
        data: {
          orderId: order.id,
          paymentMethod: 'mock',
          providerId: null,
          amount: finalTotal,
          status: 'pending',
        },
      })

      const enrollment = await tx.enrollment.create({
        data: {
          userId,
          courseId: course.id,
          orderId: order.id,
        },
      })

      await tx.progress.create({
        data: {
          userId,
          courseId: course.id,
          completedLessons: '{}',
          quizScores: '{}',
        },
      })

      return { order, enrollment }
    })

    res.status(201).json({
      courseId: course.id,
      orderId: result.order.id,
      enrollmentId: result.enrollment.id,
      status: result.order.status,
      originalTotal,
      discountAmount,
      finalTotal,
    })
  } catch (err) {
    const status = err?.status || 500
    res.status(status).json({ error: err?.message || 'Checkout failed' })
  }
})

router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    const { userId } = req.user
    const order = await prisma.order.findUnique({
      where: { id: String(orderId) },
      include: { enrollments: { select: { courseId: true } } },
    })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.userId !== userId) return res.status(403).json({ error: 'Forbidden' })
    res.json({
      orderId: order.id,
      status: order.status,
      courseIds: order.enrollments?.map((e) => e.courseId) || [],
    })
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch order status' })
  }
})

