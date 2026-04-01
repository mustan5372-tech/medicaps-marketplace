const router = require('express').Router()
const Listing = require('../models/Listing')
const Report = require('../models/Report')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
// upload imported inline per route

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, condition, minPrice, maxPrice, sort, page = 1, limit = 12, seller } = req.query
    const query = { isActive: true }

    if (search) query.$text = { $search: search }
    if (category) query.category = category
    if (condition) query.condition = condition
    if (seller) query.seller = seller
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    const sortMap = { latest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 } }
    const sortObj = sortMap[sort] || { createdAt: -1 }

    const [listings, total] = await Promise.all([
      Listing.find(query).sort(sortObj).skip((page - 1) * limit).limit(Number(limit)).populate('seller', 'name email'),
      Listing.countDocuments(query),
    ])
    res.json({ listings, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get saved listings
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'savedListings', populate: { path: 'seller', select: 'name' } })
    res.json({ listings: user.savedListings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('seller', 'name email')
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    res.json({ listing })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create listing
router.post('/', protect, (req, res, next) => {
  const { listingUpload } = require('../middleware/upload')
  listingUpload.array('images', 5)(req, res, next)
}, async (req, res) => {
  try {
    const { title, description, price, category, condition, location } = req.body
    const images = req.files?.map(f => f.secure_url || f.path) || []
    const listing = await Listing.create({ title, description, price: Number(price), category, condition, location, images, seller: req.user._id })
    await listing.populate('seller', 'name email')
    res.status(201).json({ listing })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update listing
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Not found' })
    if (listing.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' })
    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('seller', 'name email')
    res.json({ listing: updated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete listing
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Not found' })
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' })
    await listing.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Save/unsave listing
router.post('/:id/save', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const idx = user.savedListings.indexOf(req.params.id)
    if (idx > -1) {
      user.savedListings.splice(idx, 1)
      await Listing.findByIdAndUpdate(req.params.id, { $pull: { savedBy: req.user._id } })
    } else {
      user.savedListings.push(req.params.id)
      await Listing.findByIdAndUpdate(req.params.id, { $addToSet: { savedBy: req.user._id } })
    }
    await user.save()
    res.json({ saved: idx === -1 })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Report listing
router.post('/:id/report', protect, async (req, res) => {
  try {
    await Report.create({ listing: req.params.id, reporter: req.user._id, reason: req.body.reason })
    res.json({ message: 'Reported' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
