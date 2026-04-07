const router = require('express').Router()
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')
const EbookRequest = require('../models/EbookRequest')
const { protect } = require('../middleware/auth')

const TOKEN_EXPIRY = 10 * 60 // 10 minutes in seconds

// POST /api/ebooks/:id/token — generate short-lived view token
router.post('/:id/token', protect, async (req, res) => {
  try {
    const request = await EbookRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ message: 'Not found' })
    if (request.status !== 'fulfilled') return res.status(403).json({ message: 'Ebook not available yet' })

    // Only the requester can view their ebook
    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const token = jwt.sign(
      { ebookId: request._id, userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    )

    res.json({ token, expiresIn: TOKEN_EXPIRY })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/ebooks/:id/view?token=xxx — stream PDF via proxy
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

    const request = await EbookRequest.findById(req.params.id)
    if (!request || !request.ebookUrl) return res.status(404).json({ message: 'Ebook not found' })

    // Convert Google Drive share link to direct download link
    let pdfUrl = request.ebookUrl
    const gdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (gdMatch) {
      pdfUrl = `https://drive.google.com/uc?export=download&id=${gdMatch[1]}`
    }

    // Proxy the PDF — never expose real URL to client
    const response = await fetch(pdfUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    })

    if (!response.ok) return res.status(502).json({ message: 'Could not fetch PDF' })

    // Security headers — inline only, no download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')

    response.body.pipe(res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
