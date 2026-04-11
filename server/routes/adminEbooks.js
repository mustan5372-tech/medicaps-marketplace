const router = require('express').Router()
const multer = require('multer')
const Ebook = require('../models/Ebook')
const { protect, adminOnly } = require('../middleware/auth')
const { uploadImage } = require('../middleware/upload')

router.use(protect, adminOnly)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cover image limit
})

// GET /api/admin/ebooks — all ebooks with fileUrl (admin only)
router.get('/', async (req, res) => {
  try {
    const ebooks = await Ebook.find().sort({ createdAt: -1 })
    res.json({ ebooks })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/admin/ebooks — upload new ebook
router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const { title, subject, branch, fileUrl, isImportant } = req.body
    if (!title || !subject || !branch || !fileUrl) {
      return res.status(400).json({ message: 'title, subject, branch and fileUrl are required' })
    }

    let coverUrl = ''
    if (req.file) {
      coverUrl = await uploadImage(req.file.buffer, req.file.mimetype, 'ebooks')
    }

    const ebook = await Ebook.create({
      title,
      subject,
      branch,
      fileUrl,
      coverUrl,
      isImportant: isImportant === 'true' || isImportant === true,
      uploadedBy: req.user._id,
    })

    res.status(201).json({ ebook })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/admin/ebooks/:id — update ebook
router.patch('/:id', upload.single('cover'), async (req, res) => {
  try {
    const updates = {}
    const fields = ['title', 'subject', 'branch', 'fileUrl', 'isImportant']
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })
    if (updates.isImportant !== undefined) updates.isImportant = updates.isImportant === 'true' || updates.isImportant === true

    if (req.file) {
      updates.coverUrl = await uploadImage(req.file.buffer, req.file.mimetype, 'ebooks')
    }

    const ebook = await Ebook.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!ebook) return res.status(404).json({ message: 'Not found' })
    res.json({ ebook })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// DELETE /api/admin/ebooks/:id
router.delete('/:id', async (req, res) => {
  try {
    await Ebook.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
