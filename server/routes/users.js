const router = require('express').Router()
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -verifyToken -resetToken -blockedUsers')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Block a user
router.post('/:id/block', protect, async (req, res) => {
  try {
    const targetId = req.params.id
    if (targetId === req.user._id.toString()) return res.status(400).json({ message: "Can't block yourself" })
    const user = await User.findById(req.user._id)
    const isBlocked = user.blockedUsers.includes(targetId)
    if (isBlocked) {
      user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetId)
    } else {
      user.blockedUsers.push(targetId)
    }
    await user.save()
    res.json({ blocked: !isBlocked })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Check if user is blocked
router.get('/:id/blocked', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ blocked: user.blockedUsers.includes(req.params.id) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
