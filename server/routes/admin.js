const router = require('express').Router()
const Listing = require('../models/Listing')
const User = require('../models/User')
const Report = require('../models/Report')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const Announcement = require('../models/Announcement')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)

// Stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalListings, totalReports, flaggedListings, bannedUsers] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments({ status: { $ne: 'deleted' } }),
      Report.countDocuments({ resolved: false }),
      Listing.countDocuments({ isFlagged: true }),
      User.countDocuments({ banned: true }),
    ])
    res.json({ totalUsers, totalListings, totalReports, flaggedListings, bannedUsers })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get all listings (admin view)
router.get('/listings', async (req, res) => {
  try {
    const { flagged, page = 1, limit = 20 } = req.query
    const query = flagged === 'true' ? { isFlagged: true } : {}
    const listings = await Listing.find(query)
      .populate('seller', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    const total = await Listing.countDocuments(query)
    res.json({ listings, total })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Delete listing (admin)
router.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Not found' })
    await Message.deleteMany({ listing: req.params.id })
    await Conversation.deleteMany({ listing: req.params.id })
    await listing.deleteOne()
    res.json({ message: 'Listing deleted by admin' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Edit listing (admin)
router.put('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('seller', 'name email')
    res.json({ listing })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Flag listing as fake/spam
router.patch('/listings/:id/flag', async (req, res) => {
  try {
    const { reason = 'Flagged by admin' } = req.body
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flaggedReason: reason, isActive: false },
      { new: true }
    )
    res.json({ listing, message: 'Listing flagged' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Unflag listing
router.patch('/listings/:id/unflag', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { isFlagged: false, flaggedReason: '', isActive: true },
      { new: true }
    )
    res.json({ listing, message: 'Listing unflagged' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({ users })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Ban user
router.patch('/users/:id/ban', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: "Can't ban yourself" })
    const { reason } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { banned: true, bannedReason: reason || '' }, 
      { new: true }
    )
    res.json({ user })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Unban user
router.patch('/users/:id/unban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { banned: false, bannedReason: '' }, { new: true })
    res.json({ user })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({ resolved: false })
      .populate('listing', 'title images isFlagged')
      .populate('reporter', 'name')
      .sort({ createdAt: -1 })
    res.json({ reports })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Resolve report
router.put('/reports/:id/resolve', async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { resolved: true })
    res.json({ message: 'Resolved' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 }).limit(5)
    res.json({ announcements })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/announcements', async (req, res) => {
  try {
    const ann = await Announcement.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json({ announcement: ann })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.delete('/announcements/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { active: false })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Verify seller
router.patch('/users/:id/verify-seller', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSellerVerified: true }, { new: true })
    res.json({ user })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
