const router = require('express').Router()
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const { protect } = require('../middleware/auth')

// Get all conversations for user
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email')
      .populate('lastMessage')
      .populate('listing', 'title images price')
      .sort({ updatedAt: -1 })

    // Add unread count per conversation
    const withUnread = await Promise.all(conversations.map(async (conv) => {
      const unread = await Message.countDocuments({
        conversation: conv._id,
        receiver: req.user._id,
        read: false
      })
      return { ...conv.toObject(), unreadCount: unread }
    }))

    res.json({ conversations: withUnread })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Start or get conversation (with optional listingId)
router.post('/conversations', protect, async (req, res) => {
  try {
    const { receiverId, listingId } = req.body
    const buyerId = req.user._id.toString()
    const sellerId = receiverId

    // Generate unique chatId
    const chatId = listingId
      ? `${buyerId}_${sellerId}_${listingId}`
      : [buyerId, sellerId].sort().join('_')

    let conversation = await Conversation.findOne({ chatId })
      .populate('participants', 'name email')
      .populate('listing', 'title images price')

    if (!conversation) {
      conversation = await Conversation.create({
        chatId,
        participants: [buyerId, sellerId],
        listing: listingId || null,
      })
      await conversation.populate('participants', 'name email')
      if (listingId) await conversation.populate('listing', 'title images price')
    }

    res.json({ conversation })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get messages by chatId
router.get('/messages/chat/:chatId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 })
    await Message.updateMany({ chatId: req.params.chatId, receiver: req.user._id, read: false }, { read: true })
    res.json({ messages })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get messages by conversationId (legacy)
router.get('/messages/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
    if (!conversation?.participants.map(p => p.toString()).includes(req.user._id.toString())) 
      return res.status(403).json({ message: 'Not authorized' })
    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 })
    await Message.updateMany({ conversation: req.params.conversationId, receiver: req.user._id, read: false }, { read: true })
    res.json({ messages })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
