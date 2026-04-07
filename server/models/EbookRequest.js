const mongoose = require('mongoose')

const ebookRequestSchema = new mongoose.Schema({
  bookName: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  author: { type: String, trim: true, default: '' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'fulfilled'], default: 'pending' },
  ebookUrl: { type: String, default: '' },
  paymentId: { type: String, default: '' },
  isFree: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('EbookRequest', ebookRequestSchema)
