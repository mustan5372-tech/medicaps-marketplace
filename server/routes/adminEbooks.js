const router  = require('express').Router()
const multer  = require('multer')
const Ebook   = require('../models/Ebook')
const { protect, adminOnly } = require('../middleware/auth')
const { uploadPdf } = require('../middleware/upload')

router.use(protect, adminOnly)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) =>
    file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('PDF only')),
})

router.get('/', async (req, res) => {
  const ebooks = await Ebook.find().sort({ createdAt: -1 })
  res.json({ ebooks })
})

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'PDF required' })
    const { title, subject, branch, isImportant } = req.body
    if (!title) return res.status(400).json({ message: 'Title required' })

    // Upload to Cloudinary — persists across Render restarts
    const fileUrl = await uploadPdf(req.file.buffer, req.file.originalname)

    const ebook = await Ebook.create({
      title, subject, branch,
      isImportant: isImportant === 'true',
      fileUrl,
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
