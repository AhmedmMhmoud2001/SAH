import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import prisma from '../lib/db.js'
import { registerSchema, loginSchema } from '../validators/auth.js'

export const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'avatars')
const profileStorePath = path.join(__dirname, '..', '..', 'data', 'user-profiles.json')
fs.mkdirSync(uploadsDir, { recursive: true })
fs.mkdirSync(path.dirname(profileStorePath), { recursive: true })

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
      cb(null, `avatar_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
})

function readProfileStore() {
  try {
    if (!fs.existsSync(profileStorePath)) return {}
    const raw = fs.readFileSync(profileStorePath, 'utf8')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeProfileStore(data) {
  fs.writeFileSync(profileStorePath, JSON.stringify(data, null, 2), 'utf8')
}

function getAvatarUrl(userId) {
  const store = readProfileStore()
  return store?.[userId]?.avatarUrl || null
}

function setAvatarUrl(userId, avatarUrl) {
  const store = readProfileStore()
  store[userId] = { ...(store[userId] || {}), avatarUrl }
  writeProfileStore(store)
}

function clearProfileMeta(userId) {
  const store = readProfileStore()
  delete store[userId]
  writeProfileStore(store)
}

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)
    
    const exists = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    
    const passwordHash = await bcrypt.hash(data.password, 10)
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    })
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    
    res.status(201).json({ user: { ...user, avatarUrl: getAvatarUrl(user.id) }, token })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    throw error
  }
})

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body)
    
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const valid = await bcrypt.compare(data.password, user.passwordHash)
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: getAvatarUrl(user.id),
      },
      token
    })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    throw error
  }
})

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({ user: { ...user, avatarUrl: getAvatarUrl(user.id) } })
  } catch (error) {
    throw error
  }
})

router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body || {}
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(typeof name === 'string' ? { name: name.trim() } : {}),
        ...(typeof phone === 'string' ? { phone: phone.trim() } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    })
    res.json({ user: { ...user, avatarUrl: getAvatarUrl(user.id) } })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' })
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' })
  }
})

router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    setAvatarUrl(req.user.userId, avatarUrl)
    res.status(201).json({ avatarUrl })
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar' })
  }
})

router.delete('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId
    await prisma.$transaction(async (tx) => {
      await tx.quizResult.deleteMany({ where: { userId } })
      await tx.progress.deleteMany({ where: { userId } })
      await tx.certificateRequest.deleteMany({ where: { userId } })
      await tx.enrollment.deleteMany({ where: { userId } })
      const orders = await tx.order.findMany({ where: { userId }, select: { id: true } })
      const orderIds = orders.map((o) => o.id)
      if (orderIds.length) {
        await tx.transaction.deleteMany({ where: { orderId: { in: orderIds } } })
        await tx.refund.deleteMany({ where: { orderId: { in: orderIds } } })
      }
      await tx.order.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    })
    clearProfileMeta(userId)
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

export async function authenticate(req, res, next) {
  const auth = req.headers.authorization
  
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const token = auth.slice(7)
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Load user with role and permissions, but handle potential missing tables
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          roleRef: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      })
    } catch (err) {
      console.warn('[Auth] RBAC tables might be missing, falling back to legacy role:', err.message)
      user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })
    }

    if (!user) return res.status(401).json({ error: 'User not found' })

    // Extract permissions safely
    const permissions = user.roleRef?.permissions?.map(rp => rp.permission?.name).filter(Boolean) || []
    
    req.user = {
      ...decoded,
      role: user.role, // Legacy role string
      roleId: user.roleId,
      roleName: user.roleRef?.name,
      permissions
    }
    
    next()
  } catch (error) {
    console.error('[Auth] Authentication failed:', error.message)
    return res.status(401).json({ error: 'Invalid token' })
  }
}


export function authorize(permission) {
  return (req, res, next) => {
    // Admin role always has all permissions
    if (req.user.role === 'admin' || req.user.roleName === 'admin') {
      return next()
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

export async function requireAdmin(req, res, next) {
  if (req.user.role === 'admin' || req.user.roleName === 'admin') {
    return next()
  }
  return res.status(403).json({ error: 'Admin access required' })
}