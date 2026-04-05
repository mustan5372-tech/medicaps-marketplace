const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isSellerVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  banned: { type: Boolean, default: false },
  bannedReason: { type: String, default: '' },
  savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  verifyToken: String,
  verifyTokenExpiry: Date,
  resetToken: String,
  resetTokenExpiry: Date,
  freeBoostUsed: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
}, { timestamps: true })

userSchema.index({ email: 1 })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.verifyToken
  delete obj.resetToken
  return obj
}

module.exports = mongoose.model('User', userSchema)
