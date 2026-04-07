const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['message', 'reply', 'ebookRequest'], default: 'message' },
  message: { type: String, required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  ebookRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'EbookRequest' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)
