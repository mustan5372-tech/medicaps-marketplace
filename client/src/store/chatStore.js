import { create } from 'zustand'
import api from '../utils/api'
import { encryptMessage, decryptMessage } from '../utils/encryption'

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null,
  activeChatId: null,
  activeListingId: null,
  socket: null,
  onlineUsers: [],
  typing: {},
  chatError: null,

  setSocket: (socket) => set({ socket }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setChatError: (err) => set({ chatError: err }),

  fetchConversations: async () => {
    try {
      const res = await api.get('/chat/conversations')
      set({ conversations: res.data.conversations })
    } catch {}
  },

  fetchMessages: async (conversationId, chatId) => {
    try {
      const url = chatId ? `/chat/messages/chat/${chatId}` : `/chat/messages/${conversationId}`
      const res = await api.get(url)
      const decrypted = res.data.messages.map(m => ({
        ...m,
        text: decryptMessage(m.encryptedText, m.iv)
      }))
      set({ messages: decrypted, activeConversation: conversationId, activeChatId: chatId, chatError: null })
    } catch {}
  },

  sendMessage: (text, receiverId) => {
    const { socket, activeConversation, activeChatId, activeListingId } = get()
    if (!socket || !text.trim()) return
    const { encryptedText, iv } = encryptMessage(text)
    socket.emit('send_message', {
      chatId: activeChatId || activeConversation,
      conversationId: activeConversation,
      encryptedText,
      iv,
      receiverId,
      listingId: activeListingId,
    })
  },

  receiveMessage: (message) => {
    const decrypted = { ...message, text: decryptMessage(message.encryptedText, message.iv) }
    set(state => {
      if (state.messages.find(m => m._id && m._id === decrypted._id)) return state
      return {
        messages: [...state.messages, decrypted],
        conversations: state.conversations.map(c =>
          c._id === message.conversationId ? { ...c, lastMessage: decrypted, updatedAt: new Date() } : c
        )
      }
    })
  },

  setTyping: (userId, isTyping) => set({ typing: { ...get().typing, [userId]: isTyping } }),

  startConversation: async (receiverId, listingId) => {
    const res = await api.post('/chat/conversations', { receiverId, listingId })
    if (listingId) set({ activeListingId: listingId })
    return res.data.conversation
  },

  clearMessages: () => set({ messages: [], activeConversation: null, activeChatId: null, activeListingId: null, chatError: null }),
}))
