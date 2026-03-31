const router = require('express').Router()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email')
const { protect } = require('../middleware/auth')

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const setCookie = (res, token) => res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' })

    const allowed = ['@medicaps.ac.in', '@mcu.ac.in']
    const isProd = process.env.NODE_ENV === 'production'
    if (isProd && !allowed.some(d => email.endsWith(d))) return res.status(400).json({ message: 'Use your MediCaps college email' })

    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' })

    const verifyToken = crypto.randomBytes(32).toString('hex')
    // In dev without email config, auto-verify
    const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your@gmail.com'
    const user = await User.create({
      name, email, password, verifyToken,
      verifyTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
      isVerified: !isEmailConfigured, // auto-verify if email not configured
    })

    if (isEmailConfigured) {
      await sendVerificationEmail(email, verifyToken)
      res.status(201).json({ message: 'Account created. Check your email to verify.' })
    } else {
      res.status(201).json({ message: 'Account created. You can now login.' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' })
    const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your@gmail.com'
    if (isEmailConfigured && !user.isVerified) return res.status(401).json({ message: 'Please verify your email first' })
    if (user.banned) return res.status(403).json({ message: 'Account banned' })

    const token = signToken(user._id)
    setCookie(res, token)
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Me
router.get('/me', protect, (req, res) => res.json({ user: req.user }))

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verifyToken: req.params.token, verifyTokenExpiry: { $gt: Date.now() } })
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' })
    user.isVerified = true
    user.verifyToken = undefined
    user.verifyTokenExpiry = undefined
    await user.save()
    res.json({ message: 'Email verified' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(404).json({ message: 'No account with that email' })
    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = token
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000
    await user.save()
    await sendPasswordResetEmail(user.email, token)
    res.json({ message: 'Reset link sent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({ resetToken: req.params.token, resetTokenExpiry: { $gt: Date.now() } })
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' })
    user.password = req.body.password
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()
    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
