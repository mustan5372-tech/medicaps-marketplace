const router = require('express').Router()
const jwt = require('jsonwebtoken')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
const Ebook = require('../models/Ebook')
const { protect } = require('../middleware/auth')

// ── GET /api/ebooks — public library listing (no fileUrl exposed) ──────────
router.get('/', protect, async (req, res) => {
  try {
    const { branch } = req.query
    const query = branch && branch !== 'All' ? { branch } : {}
    const ebooks = await Ebook.find(query)
      .select('-fileUrl')
      .sort({ createdAt: -1 })
    res.json({ ebooks })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── POST /api/ebooks/:id/token — get short-lived view token ───────────────
router.post('/:id/token', protect, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id).select('_id')
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' })

    const token = jwt.sign(
      { ebookId: ebook._id.toString(), userId: req.user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: 10 * 60 } // 10 min
    )
    res.json({ token, expiresIn: 600 })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ── GET /api/ebooks/:id/view?token=xxx — secure PDF proxy stream ──────────
router.get('/:id/view', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(401).json({ message: 'Token required' })

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    if (decoded.ebookId !== req.params.id) {
      return res.status(403).json({ message: 'Token mismatch' })
    }

    const ebook = await Ebook.findById(req.params.id).select('fileUrl')
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' })

    // Increment view count (fire-and-forget)
    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})

    // Resolve Google Drive share links → direct stream URL
    let pdfUrl = ebook.fileUrl
    const gdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (gdMatch) {
      pdfUrl = `https://drive.google.com/uc?export=download&id=${gdMatch[1]}`
    }

    const response = await fetch(pdfUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    })

    if (!response.ok) return res.status(502).json({ message: 'Could not fetch PDF' })

    // Inline only — no download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Content-Security-Policy', "default-src 'none'")

    response.body.pipe(res)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
