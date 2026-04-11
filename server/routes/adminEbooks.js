const router    = require('express').Router()
const cloudinary = require('cloudinary').v2
const Ebook     = require('../models/Ebook')
const { protect, checkRole } = require('../middleware/auth')

router.use(protect, checkRole(['admin', 'super_admin', 'ebook_uploader']))

router.get('/', async (req, res) => {
  const ebooks = await Ebook.find().sort({ createdAt: -1 })
  res.json({ ebooks })
})

router.post('/upload', async (req, res) => {
  try {
    console.log('FILES:', JSON.stringify(Object.keys(req.files || {})))
    console.log('BODY:', JSON.stringify(req.body))
    console.log('CLOUDINARY CONFIG:', {
      cloud: process.env.CLOUDINARY_CLOUD_NAME,
      key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
      secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
    })

    if (!req.files?.file) return res.status(400).json({ message: 'No file received. req.files was empty.' })
    const file = req.files.file
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ message: 'Only PDF allowed' })

    let title = (req.body.title || file.name)
      .replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')
      .replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim()

    console.log('Uploading to Cloudinary, tempFilePath:', file.tempFilePath, 'size:', file.size)

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: 'raw',
      folder: 'ebooks',
      use_filename: true,
      unique_filename: true,
    })

    console.log('Cloudinary upload success:', result.secure_url)

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
    console.error('UPLOAD ERROR:', e.message, e.stack)
    res.status(500).json({ message: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  await Ebook.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
