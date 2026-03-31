const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
  chatId: { type: String, unique: true, sparse: true }, // buyerId_sellerId_listingId
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true })

module.exports = mongoose.model('Conversation', conversationSchema)
