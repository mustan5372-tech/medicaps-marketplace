const router = require('express').Router()
const path   = require('path')
const Ebook  = require('../models/Ebook')
const { protect } = require('../middleware/auth')

const DIR = path.resolve(__dirname, '..', 'storage', 'ebooks')

router.get('/', protect, async (req, res) => {
  const ebooks = await Ebook.find().select('-fileUrl').sort({ isImportant: -1, createdAt: -1 }).limit(20)
  res.json({ ebooks })
})

router.get('/:id/view', protect, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id)
    if (!ebook) return res.status(404).json({ message: 'Not found' })
    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.sendFile(path.join(DIR, ebook.fileUrl))
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
