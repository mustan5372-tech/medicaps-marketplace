const router = require('express').Router()
const https  = require('https')
const http   = require('http')
const jwt    = require('jsonwebtoken')
const Ebook  = require('../models/Ebook')
const { protect } = require('../middleware/auth')

router.get('/', protect, async (req, res) => {
  const ebooks = await Ebook.find().select('-fileUrl').sort({ isImportant: -1, createdAt: -1 }).limit(20)
  res.json({ ebooks })
})

// Issue a short-lived signed URL token
router.get('/:id/token', protect, async (req, res) => {
  const token = jwt.sign({ id: req.params.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
  res.json({ token })
})

// No auth middleware — accepts JWT directly as query param
router.get('/:id/view', async (req, res) => {
  try {
    const token = req.query.token
    if (!token) return res.status(401).json({ message: 'Token required' })
    try { jwt.verify(token, process.env.JWT_SECRET) }
    catch { return res.status(401).json({ message: 'Invalid token' }) }

    const ebook = await Ebook.findById(req.params.id)
    if (!ebook) return res.status(404).json({ message: 'Not found' })

    console.log('View ebook:', ebook.title, '| fileUrl:', ebook.fileUrl?.substring(0, 60))
    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'no-store')

    // If it's a full URL (Cloudinary), proxy it
    if (ebook.fileUrl.startsWith('http')) {
      const lib = ebook.fileUrl.startsWith('https') ? https : http
      lib.get(ebook.fileUrl, (stream) => {
        stream.pipe(res)
      }).on('error', (e) => {
        console.error('Proxy error:', e.message)
        if (!res.headersSent) res.status(502).json({ message: 'Could not fetch PDF' })
      })
    } else {
      // Legacy local file — shouldn't happen on Render but handle gracefully
      return res.status(404).json({ message: 'File not available. Please re-upload this ebook.' })
    }
  } catch (e) {
    console.error('View error:', e.message)
    res.status(500).json({ message: e.message })
  }
})

module.exports = router
