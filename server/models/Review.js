const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true })

// One review per buyer per listing
reviewSchema.index({ reviewer: 1, listing: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)
