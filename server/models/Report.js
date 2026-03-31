const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  resolved: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Report', reportSchema)
