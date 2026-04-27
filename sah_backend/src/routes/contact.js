import { Router } from 'express'
import prisma from '../lib/db.js'

export const router = Router()

// Get public contact info
router.get('/info', async (req, res) => {
  try {
    const info = await prisma.contactInfo.findFirst()
    res.json(info || {})
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact info' })
  }
})

// Submit contact message
router.post('/messages', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' })
    }
    const newMessage = await prisma.contactMessage.create({
      data: { name, email, subject, message }
    })
    res.status(201).json(newMessage)
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})
