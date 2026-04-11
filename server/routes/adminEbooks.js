const router = require('express').Router()
const Ebook = require('../models/Ebook')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)

router.get('/', async (req, res) => {
  const ebooks = await Ebook.find().select('-pdfData').sort({ createdAt: -1 })
  res.json({ ebooks })
})

router.post('/upload', async (req, res) => {
  try {
    const { title, subject, branch, isImportant, file } = req.body
    if (!title || !file) return res.status(400).json({ message: 'title and file required' })
    const base64 = file.includes(',') ? file.split(',')[1] : file
    const ebook = await Ebook.create({ title, subject, branch, isImportant: !!isImportant, pdfData: base64 })
    res.status(201).json({ ebook: { _id: ebook._id, title: ebook.title, subject: ebook.subject, branch: ebook.branch, isImportant: ebook.isImportant, createdAt: ebook.createdAt } })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.delete('/:id', async (req, res) => {
  await Ebook.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
