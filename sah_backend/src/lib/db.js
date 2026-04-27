import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Ensure env is loaded before PrismaClient initialization (ESM import order)
dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error('[DB] DATABASE_URL is missing')
} else {
  console.log('[DB] DATABASE_URL loaded:', process.env.DATABASE_URL)
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
})

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('📦 Database connected')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

export default prisma