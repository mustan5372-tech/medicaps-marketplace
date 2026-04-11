const router = require('express').Router()
const https  = require('https')
const Ebook  = require('../models/Ebook')
const { protect } = require('../middleware/auth')

router.get('/', protect, async (req, res) => {
  const ebooks = await Ebook.find().select('-fileUrl').sort({ isImportant: -1, createdAt: -1 }).limit(20)
  res.json({ ebooks })
})

// Proxy — never exposes Cloudinary URL
router.get('/:id/view', protect, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id)
    if (!ebook) return res.status(404).json({ message: 'Not found' })
    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'no-store')
    https.get(ebook.fileUrl, stream => stream.pipe(res))
      .on('error', () => res.status(502).json({ message: 'Could not fetch PDF' }))
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
