const router = require('express').Router()
const Ebook  = require('../models/Ebook')
const { protect, checkRole } = require('../middleware/auth')

// Routes — admin + ebook_uploader only
router.use(protect, checkRole(['admin', 'ebook_uploader']))

router.get('/', async (req, res) => {
  const ebooks = await Ebook.find().sort({ createdAt: -1 })
  res.json({ ebooks })
})

router.post('/add', async (req, res) => {
  try {
    const { title, subject, branch, semester, isImportant, driveLink, author, totalPages } = req.body
    if (!driveLink) return res.status(400).json({ message: 'Drive link required' })
    if (!title)     return res.status(400).json({ message: 'Title required' })
    const ebook = await Ebook.create({ title, subject, branch, author: author || '', semester: parseInt(semester) || 4, isImportant: !!isImportant, driveLink, totalPages: parseInt(totalPages) || 0 })
    res.status(201).json({ ebook })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.delete('/:id', async (req, res) => {
  await Ebook.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
