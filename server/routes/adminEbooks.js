const router = require('express').Router()
const EbookRequest = require('../models/EbookRequest')
const User = require('../models/User')
const { protect, adminOnly } = require('../middleware/auth')
const multer = require('multer')
const { uploadImage } = require('../middleware/upload')

router.use(protect, adminOnly)

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files allowed'), false)
  },
})

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

// POST /api/admin/ebooks/:id/upload — upload PDF and fulfill
router.post('/:id/upload', pdfUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'PDF file required' })

    let ebookUrl
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== 'your_api_key'

    if (isCloudinaryConfigured) {
      const cloudinary = require('cloudinary').v2
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      ebookUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'medicaps/ebooks', resource_type: 'raw', format: 'pdf' },
          (err, result) => err ? reject(err) : resolve(result.secure_url)
        )
        const { Readable } = require('stream')
        Readable.from(req.file.buffer).pipe(stream)
      })
    } else {
      // Fallback: base64 data URL
      ebookUrl = `data:application/pdf;base64,${req.file.buffer.toString('base64')}`
    }

    const request = await EbookRequest.findByIdAndUpdate(
      req.params.id,
      { ebookUrl, status: 'fulfilled' },
      { new: true }
    ).populate('requestedBy', 'name email')

    if (!request) return res.status(404).json({ message: 'Request not found' })
    res.json({ request })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/admin/ebooks/:id/fulfill — mark fulfilled with existing URL
router.patch('/:id/fulfill', async (req, res) => {
  try {
    const { ebookUrl } = req.body
    if (!ebookUrl) return res.status(400).json({ message: 'ebookUrl required' })
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
