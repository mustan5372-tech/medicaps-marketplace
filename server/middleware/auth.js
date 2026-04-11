const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
  try {
    // Check Authorization header first, then cookie
    let token = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }

    if (!token) return res.status(401).json({ message: 'Not authenticated' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password -verifyToken -resetToken -verifyTokenExpiry -resetTokenExpiry').lean()
    if (!user) return res.status(401).json({ message: 'User not found' })
    if (user.banned) return res.status(403).json({ 
      message: user.bannedReason 
        ? `Your account has been banned: ${user.bannedReason}` 
        : 'Your account has been banned by the admin' 
    })

    req.user = user
    next()
  } catch (err) {
    console.error('Auth error:', err.message)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

exports.adminOnly = (req, res, next) => {
  const allowed = ['admin', 'super_admin']
  if (!allowed.includes(req.user?.role)) return res.status(403).json({ message: 'Admin access required' })
  next()
}

exports.checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: 'Access denied' })
  next()
}
