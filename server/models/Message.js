const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true, index: true }, // buyerId_sellerId_listingId
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  encryptedText: { type: String, required: true },
  iv: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)
