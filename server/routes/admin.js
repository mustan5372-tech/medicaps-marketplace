const router = require('express').Router()
const Listing = require('../models/Listing')
const User = require('../models/User')
const Report = require('../models/Report')
const Conversation = require('../models/Conversation')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalListings, totalReports, activeChats] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Report.countDocuments({ resolved: false }),
      Conversation.countDocuments(),
    ])
    res.json({ totalUsers, totalListings, totalReports, activeChats })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find().populate('seller', 'name email').sort({ createdAt: -1 }).limit(100)
    res.json({ listings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/listings/:id', async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({ users })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { banned: true }, { new: true })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({ resolved: false }).populate('listing', 'title').populate('reporter', 'name').sort({ createdAt: -1 })
    res.json({ reports })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/reports/:id/resolve', async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { resolved: true })
    res.json({ message: 'Resolved' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
