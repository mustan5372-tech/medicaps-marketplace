const router = require('express').Router()
const EbookRequest = require('../models/EbookRequest')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)

// GET /api/admin/ebooks — all requests with stats
router.get('/', async (req, res) => {
  try {
    const { status } = req.query
    const query = status && status !== 'all' ? { status } : {}
    const [requests, total, pending, fulfilled] = await Promise.all([
      EbookRequest.find(query)
        .populate('requestedBy', 'name email avatar')
        .sort({ createdAt: -1 }),
      EbookRequest.countDocuments(),
      EbookRequest.countDocuments({ status: 'pending' }),
      EbookRequest.countDocuments({ status: 'fulfilled' }),
    ])
    res.json({ requests, stats: { total, pending, fulfilled } })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/admin/ebooks/:id/fulfill — fulfill with a PDF link
router.patch('/:id/fulfill', async (req, res) => {
  try {
    const { ebookUrl } = req.body
    if (!ebookUrl) return res.status(400).json({ message: 'PDF link is required' })

    const request = await EbookRequest.findByIdAndUpdate(
      req.params.id,
      { ebookUrl, status: 'fulfilled' },
      { new: true }
    ).populate('requestedBy', 'name email')

    if (!request) return res.status(404).json({ message: 'Request not found' })
    res.json({ request })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
