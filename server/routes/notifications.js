const router = require('express').Router()
const Notification = require('../models/Notification')
const { protect } = require('../middleware/auth')

// Get all notifications for user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('senderId', 'name avatar')
      .populate('listingId', 'title images')
      .sort({ createdAt: -1 })
      .limit(20)
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false })
    res.json({ notifications, unreadCount })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Mark single notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Mark all as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
