require('dotenv').config()
// Force Google DNS to bypass ISP DNS blocking
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth')
const listingRoutes = require('./routes/listings')
const chatRoutes = require('./routes/chat')
const userRoutes = require('./routes/users')
const adminRoutes = require('./routes/admin')
const notificationRoutes = require('./routes/notifications')
const reviewRoutes = require('./routes/reviews')
const leaderboardRoutes = require('./routes/leaderboard')
const ebookRoutes = require('./routes/ebooks')
const adminEbookRoutes = require('./routes/adminEbooks')
const { initSocket } = require('./socket')

const app = express()
const server = http.createServer(app)

// Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => cb(null, true),
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
})
initSocket(io)
app.set('io', io) // make io accessible in routes

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }))
// CORS - allow all vercel deployments + local
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://medicapsmart.vercel.app',
  'https://client-seven-orpin-32.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '20mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many requests' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/ebooks', ebookRoutes)
app.use('/api/admin/ebooks', adminEbookRoutes)

// TEMP: Force set mustan5372 as admin — remove after use
app.get('/api/fix-admin', async (req, res) => {
  try {
    const User = require('./models/User')
    const user = await User.findOneAndUpdate(
      { email: 'mustan5372@gmail.com' },
      { role: 'admin' },
      { new: true }
    ).select('email role')
    if (!user) return res.json({ message: 'User not found' })
    res.json({ message: 'Fixed', user })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')))
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// Public announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const Announcement = require('./models/Announcement')
    const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(3)
    res.json({ announcements })
  } catch { res.json({ announcements: [] }) }
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// DB + Start
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected')

    // Auto-ensure mustan5372 is admin
    const User = require('./models/User')
    const bcrypt = require('bcryptjs')
    const existing = await User.findOne({ email: 'mustan5372@gmail.com' })
    if (!existing) {
      const hashed = await bcrypt.hash('Mustan@525', 10)
      await User.create({ name: 'Mustansir', email: 'mustan5372@gmail.com', password: hashed, role: 'admin', isVerified: true })
      console.log('Admin created')
    } else if (!['admin'].includes(existing.role)) {
      await User.findByIdAndUpdate(existing._id, { role: 'admin' })
      console.log('Admin role updated')
    }

    const PORT = process.env.PORT || 5000
    server.timeout = 120000
    server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => { console.error('DB connection failed:', err); process.exit(1) })
