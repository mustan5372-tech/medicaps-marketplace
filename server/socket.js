const Message = require('./models/Message')
const Conversation = require('./models/Conversation')

const onlineUsers = new Map() // userId -> socketId

function initSocket(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    if (userId) {
      onlineUsers.set(userId, socket.id)
      io.emit('onlineUsers', Array.from(onlineUsers.keys()))
    }

    // Join a chat room by chatId (buyerId_sellerId_listingId)
    socket.on('join_chat', ({ chatId }) => {
      socket.join(chatId)
    })

    // Send message
    socket.on('send_message', async ({ chatId, conversationId, encryptedText, iv, receiverId }) => {
      try {
        const message = await Message.create({
          chatId,
          conversation: conversationId,
          sender: userId,
          receiver: receiverId,
          encryptedText,
          iv,
        })

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        })

        const populated = await message.populate('sender', 'name')
        const payload = { ...populated.toObject(), conversationId, chatId }

        // Emit to entire chat room (both users)
        io.to(chatId).emit('receive_message', payload)

        // Also emit directly to receiver socket if not in room
        const receiverSocket = onlineUsers.get(receiverId)
        if (receiverSocket) {
          io.to(receiverSocket).emit('receive_message', payload)
        }
      } catch (err) {
        console.error('Socket send_message error:', err)
      }
    })

    // Typing indicators
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('typing', { userId, isTyping })
    })

    // Legacy sendMessage support
    socket.on('sendMessage', async ({ conversationId, encryptedText, iv, receiverId }) => {
      try {
        const message = await Message.create({
          chatId: conversationId,
          conversation: conversationId,
          sender: userId,
          receiver: receiverId,
          encryptedText,
          iv,
        })
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() })
        const populated = await message.populate('sender', 'name')
        const payload = { ...populated.toObject(), conversationId }
        const receiverSocket = onlineUsers.get(receiverId)
        if (receiverSocket) io.to(receiverSocket).emit('newMessage', payload)
        socket.emit('newMessage', payload)
      } catch (err) {
        console.error('Socket sendMessage error:', err)
      }
    })

    socket.on('joinConversation', (conversationId) => socket.join(conversationId))

    socket.on('disconnect', () => {
      onlineUsers.delete(userId)
      io.emit('onlineUsers', Array.from(onlineUsers.keys()))
    })
  })
}

module.exports = { initSocket }
