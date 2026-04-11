const router = require('express').Router()
const path   = require('path')
const fs     = require('fs')
const Ebook  = require('../models/Ebook')
const { protect, adminOnly } = require('../middleware/auth')

const DIR = path.resolve(__dirname, '..', 'storage', 'ebooks')
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })

router.use(protect, adminOnly)

router.get('/', async (req, res) => {
  const ebooks = await Ebook.find().sort({ createdAt: -1 })
  res.json({ ebooks })
})

router.post('/upload', async (req, res) => {
  try {
    const file = req.files?.file
    if (!file || file.mimetype !== 'application/pdf')
      return res.status(400).json({ message: 'PDF file required' })
    const { title, subject, branch, isImportant } = req.body
    if (!title) return res.status(400).json({ message: 'Title required' })
    const fileName = Date.now() + '-' + file.name.replace(/\s/g, '_')
    await file.mv(path.join(DIR, fileName))
    const ebook = await Ebook.create({ title, subject, branch, isImportant: isImportant === 'true', fileUrl: fileName })
    res.status(201).json({ ebook })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.delete('/:id', async (req, res) => {
  const e = await Ebook.findByIdAndDelete(req.params.id)
  if (e?.fileUrl) { const p = path.join(DIR, e.fileUrl); if (fs.existsSync(p)) fs.unlinkSync(p) }
  res.json({ message: 'Deleted' })
})

module.exports = router
