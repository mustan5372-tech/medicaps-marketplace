const router = require('express').Router()
const EbookRequest = require('../models/EbookRequest')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const FREE_LIMIT = 3

// GET /api/ebooks — all requests feed
router.get('/', protect, async (req, res) => {
  try {
    const requests = await EbookRequest.find()
      .populate('requestedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ requests })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/ebooks/user — current user's requests + count
router.get('/user', protect, async (req, res) => {
  try {
    const requests = await EbookRequest.find({ requestedBy: req.user._id }).sort({ createdAt: -1 })
    const user = await User.findById(req.user._id).select('ebookRequestCount')
    const count = user.ebookRequestCount || 0
    res.json({ requests, requestCount: count, freeLeft: Math.max(0, FREE_LIMIT - count) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/ebooks/request — submit a request (free only for now)
router.post('/request', protect, async (req, res) => {
  try {
    const { bookName, subject, author } = req.body
    if (!bookName || !subject) return res.status(400).json({ message: 'Book name and subject are required' })

    const user = await User.findById(req.user._id).select('ebookRequestCount')
    const count = user.ebookRequestCount || 0

    if (count >= FREE_LIMIT) {
      return res.status(403).json({ message: 'Free requests exhausted. Paid requests coming soon.' })
    }

    const request = await EbookRequest.create({
      bookName,
      subject,
      author: author || '',
      requestedBy: req.user._id,
      isFree: true,
    })

    await User.findByIdAndUpdate(req.user._id, { $inc: { ebookRequestCount: 1 } })
    res.status(201).json({ request })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
