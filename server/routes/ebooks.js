const router = require('express').Router()
const https  = require('https')
const Ebook  = require('../models/Ebook')
const { protect } = require('../middleware/auth')

function toDirect(link) {
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}&confirm=t`
  return link
}

router.get('/', protect, async (req, res) => {
  const ebooks = await Ebook.find().select('-driveLink').sort({ isImportant: -1, createdAt: -1 }).limit(50)
  res.json({ ebooks })
})

// Proxy PDF from Drive — react-pdf fetches this URL with auth header
router.get('/:id/view', protect, async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id)
    if (!ebook) return res.status(404).json({ message: 'Not found' })
    Ebook.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {})

    const directUrl = toDirect(ebook.driveLink)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'no-store')

    const fetchUrl = (url, redirectCount = 0) => {
      if (redirectCount > 5) return res.status(502).json({ message: 'Too many redirects' })
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (stream) => {
        if (stream.statusCode === 302 || stream.statusCode === 301) {
          return fetchUrl(stream.headers.location, redirectCount + 1)
        }
        if (stream.statusCode !== 200) return res.status(502).json({ message: 'Drive fetch failed: ' + stream.statusCode })
        stream.pipe(res)
      }).on('error', (e) => res.status(502).json({ message: e.message }))
    }
    fetchUrl(directUrl)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
