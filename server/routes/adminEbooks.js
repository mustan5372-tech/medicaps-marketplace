const router    = require('express').Router()
const cloudinary = require('cloudinary').v2
const Ebook     = require('../models/Ebook')
const { protect, adminOnly } = require('../middleware/auth')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

router.use(protect, adminOnly)

router.get('/', async (req, res) => {
  const ebooks = await Ebook.find().sort({ createdAt: -1 })
  res.json({ ebooks })
})

router.post('/upload', async (req, res) => {
  try {
    if (!req.files?.file) return res.status(400).json({ message: 'PDF file required' })
    const file = req.files.file
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ message: 'Only PDF allowed' })

    // Auto title from filename
    let title = (req.body.title || file.name)
      .replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')
      .replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim()

    // Upload to Cloudinary using temp file path
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: 'raw',
      folder: 'ebooks',
      use_filename: true,
      unique_filename: true,
    })

    const ebook = await Ebook.create({
      title,
      branch:      req.body.branch || '',
      subject:     req.body.subject || '',
      semester:    4,
      isImportant: req.body.isImportant === 'true',
      fileUrl:     result.secure_url,
    })

    res.status(201).json({ ebook })
  } catch (e) {
    console.error('Upload error:', e.message)
    res.status(500).json({ message: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  await Ebook.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
