const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['Books', 'Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Sports', 'Others'] },
  condition: { type: String, required: true, enum: ['New', 'Like New', 'Used'] },
  images: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  negotiable: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'sold', 'deleted'], default: 'active' },
  isFlagged: { type: Boolean, default: false },
  flaggedReason: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  isBoosted: { type: Boolean, default: false },
  boostExpiresAt: { type: Date, default: null },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
  tags: [{ type: String, enum: ['urgent', 'best-deal'] }],
}, { timestamps: true })

listingSchema.index({ title: 'text', description: 'text' })
listingSchema.index({ category: 1, condition: 1, price: 1, status: 1 })

module.exports = mongoose.model('Listing', listingSchema)
