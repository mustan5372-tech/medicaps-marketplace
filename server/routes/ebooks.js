const router = require('express').Router()
const path   = require('path')
const jwt    = require('jsonwebtoken')
const Ebook  = require('../models/Ebook')
const { protect } = require('../middleware/auth')

const DIR = path.resolve(__dirname, '..', 'storage', 'ebooks')

router.get('/', protect, async (req, res) => {
  const ebooks = await Ebook.find().select('-fileUrl').sort({ isImportant: -1, createdAt: -1 }).limit(20)
  res.json({ ebooks })
})

// View — accept token as query param OR Authorization header
router.get('/:id/view', async (req, res) => {
  try {
    const token = req.query.token || (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return res.status(401).json({ message: 'Token required' })
    jwt.verify(token, process.env.JWT_SECRET)

    const ebook = await Ebook.findById(req.params.id)
    if (!ebook) return res.status(404).json({ message: 'Not found' })

    const fs = require('fs')
    const filePath = path.join(DIR, ebook.fileUrl)
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' })

    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'no-store')
    res.sendFile(filePath)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
