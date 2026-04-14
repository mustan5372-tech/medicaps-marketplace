const router  = require('express').Router()
const Ebook   = require('../models/Ebook')
const EbookRequest = require('../models/EbookRequest')
const { protect, adminOnly } = require('../middleware/auth')
const { sendEbookRequestEmail } = require('../utils/email')

function toPreview(link) {
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`
  return link
}

// GET /api/ebooks — filtered by branch
router.get('/', protect, async (req, res) => {
  try {
    const { branch } = req.query
    const query = branch && branch !== 'All' ? { branch } : {}
    const ebooks = await Ebook.find(query).select('-driveLink').sort({ isImportant: -1, createdAt: -1 }).limit(50)
    res.json({ ebooks })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// GET /api/ebooks/:id/view
router.get('/:id/view', protect, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id)
    if (!ebook) return res.status(404).json({ message: 'Not found' })
    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})
    res.json({ previewUrl: toPreview(ebook.driveLink), totalPages: ebook.totalPages || 0 })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// POST /api/ebooks/request
router.post('/request', protect, async (req, res) => {
  try {
    const { bookName, subject, branch } = req.body
    if (!bookName || !subject || !branch) return res.status(400).json({ message: 'All fields required' })
    const request = await EbookRequest.create({ bookName, subject, branch, requestedBy: req.user._id })
    // Send email to admin (fire and forget)
    sendEbookRequestEmail({ bookName, subject, branch, userEmail: req.user.email, userName: req.user.name }).catch(() => {})
    res.status(201).json({ message: 'Request submitted!', request })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// GET /api/ebooks/requests — admin only
router.get('/requests', protect, adminOnly, async (req, res) => {
  try {
    const requests = await EbookRequest.find().populate('requestedBy', 'name email').sort({ createdAt: -1 })
    res.json({ requests })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
