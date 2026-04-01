const router = require('express').Router()
const Review = require('../models/Review')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// Get reviews for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('reviewer', 'name avatar')
      .populate('listing', 'title')
      .sort({ createdAt: -1 })
    res.json({ reviews })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Post a review
router.post('/', protect, async (req, res) => {
  try {
    const { sellerId, listingId, rating, comment } = req.body
    if (req.user._id.toString() === sellerId) return res.status(400).json({ message: "Can't review yourself" })

    const existing = await Review.findOne({ reviewer: req.user._id, listing: listingId })
    if (existing) return res.status(400).json({ message: 'Already reviewed this listing' })

    const review = await Review.create({ reviewer: req.user._id, seller: sellerId, listing: listingId, rating, comment })
    await review.populate('reviewer', 'name avatar')

    // Update seller's average rating
    const allReviews = await Review.find({ seller: sellerId })
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    await User.findByIdAndUpdate(sellerId, { rating: Math.round(avg * 10) / 10, ratingCount: allReviews.length })

    res.status(201).json({ review })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
