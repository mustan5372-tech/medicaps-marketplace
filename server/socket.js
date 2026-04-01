const Message = require('./models/Message')
const Conversation = require('./models/Conversation')
const Listing = require('./models/Listing')
const Notification = require('./models/Notification')
const { decryptMessage } = require('./utils/crypto')

const onlineUsers = new Map()

function initSocket(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    if (userId) {
      onlineUsers.set(userId, socket.id)
      socket.join(userId) // join personal room for notifications
      io.emit('onlineUsers', Array.from(onlineUsers.keys()))
    }

    socket.on('join_chat', ({ chatId }) => socket.join(chatId))
    socket.on('joinConversation', (id) => socket.join(id))

    socket.on('send_message', async ({ chatId, conversationId, encryptedText, iv, receiverId, listingId }) => {
      try {
        // Validate listing status
        if (listingId) {
          const listing = await Listing.findById(listingId).select('status')
          if (listing?.status === 'sold') return socket.emit('chat_error', { message: 'Chat is closed — this item has been sold.' })
          if (listing?.status === 'deleted') return socket.emit('chat_error', { message: 'This listing no longer exists.' })
        }

        const message = await Message.create({
          chatId, conversation: conversationId,
          listing: listingId || null,
          sender: userId, receiver: receiverId,
          encryptedText, iv,
        })

        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() })

        const populated = await message.populate('sender', 'name avatar')
        const payload = { ...populated.toObject(), conversationId, chatId }

        // Emit message to chat room
        io.to(chatId).emit('receive_message', payload)
        const receiverSocket = onlineUsers.get(receiverId)
        if (receiverSocket) io.to(receiverSocket).emit('receive_message', payload)

        // Create notification for receiver
        const notification = await Notification.create({
          userId: receiverId,
          senderId: userId,
          type: 'message',
          message: '🔒 New encrypted message',
          listingId: listingId || null,
          conversationId,
        })

        const populatedNotif = await notification.populate('senderId', 'name avatar')

        // Emit notification to receiver's personal room
        io.to(receiverId).emit('new_notification', {
          ...populatedNotif.toObject(),
          chatId,
          conversationId,
        })

      } catch (err) {
        console.error('Socket send_message error:', err)
        socket.emit('chat_error', { message: 'Failed to send message' })
      }
    })

    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('typing', { userId, isTyping })
    })

    // Legacy support
    socket.on('sendMessage', async ({ conversationId, encryptedText, iv, receiverId }) => {
      try {
        const message = await Message.create({ chatId: conversationId, conversation: conversationId, sender: userId, receiver: receiverId, encryptedText, iv })
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() })
        const populated = await message.populate('sender', 'name')
        const payload = { ...populated.toObject(), conversationId }
        const receiverSocket = onlineUsers.get(receiverId)
        if (receiverSocket) io.to(receiverSocket).emit('newMessage', payload)
        socket.emit('newMessage', payload)
      } catch (err) {
        console.error('sendMessage error:', err)
      }
    })

    socket.on('disconnect', () => {
      onlineUsers.delete(userId)
      io.emit('onlineUsers', Array.from(onlineUsers.keys()))
    })
  })
}

module.exports = { initSocket }
