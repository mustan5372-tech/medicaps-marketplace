const router = require('express').Router()
const User = require('../models/User')

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -verifyToken -resetToken')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
