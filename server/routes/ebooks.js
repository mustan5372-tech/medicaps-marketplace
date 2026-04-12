const router = require('express').Router()
const Ebook  = require('../models/Ebook')
const { protect } = require('../middleware/auth')

function toPreview(link) {
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`
  return link
}

router.get('/', protect, async (req, res) => {
  const ebooks = await Ebook.find().select('-driveLink').sort({ isImportant: -1, createdAt: -1 }).limit(50)
  res.json({ ebooks })
})

router.get('/:id/view', protect, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id)
    if (!ebook) return res.status(404).json({ message: 'Not found' })
    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})
    res.json({ previewUrl: toPreview(ebook.driveLink) })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
