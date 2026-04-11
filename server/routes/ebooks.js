const router = require('express').Router()
const Ebook = require('../models/Ebook')
const { protect } = require('../middleware/auth')

router.get('/', protect, async (req, res) => {
  const ebooks = await Ebook.find().select('-pdfData').sort({ isImportant: -1, createdAt: -1 })
  res.json({ ebooks })
})

router.get('/:id/view', protect, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id).select('pdfData')
    if (!ebook) return res.status(404).json({ message: 'Not found' })
    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})
    const buf = Buffer.from(ebook.pdfData, 'base64')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'no-store')
    res.send(buf)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
