import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { initSocket } from '../utils/socket'
import { formatDistanceToNow } from 'date-fns'
import { FiSend, FiMessageSquare, FiArrowLeft, FiLock, FiAlertCircle } from 'react-icons/fi'

export default function Chat() {
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const listingId = searchParams.get('listing')
  const { user } = useAuthStore()
  const {
    conversations, messages, activeConversation, activeChatId,
    fetchConversations, fetchMessages, sendMessage, receiveMessage,
    setSocket, setOnlineUsers, setTyping, typing, onlineUsers,
    startConversation, chatError, setChatError
  } = useChatStore()

  const [text, setText] = useState('')
  const [activeConvObj, setActiveConvObj] = useState(null)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const [listingStatus, setListingStatus] = useState('active')
  const messagesEndRef = useRef(null)
  const typingTimeout = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = initSocket(user._id)
    socketRef.current = socket
    setSocket(socket)
    socket.on('receive_message', receiveMessage)
    socket.on('newMessage', receiveMessage)
    socket.on('onlineUsers', setOnlineUsers)
    socket.on('typing', ({ userId: uid, isTyping }) => setTyping(uid, isTyping))
    socket.on('chat_error', ({ message }) => setChatError(message))
    fetchConversations()
    return () => {
      socket.off('receive_message'); socket.off('newMessage')
      socket.off('onlineUsers'); socket.off('typing'); socket.off('chat_error')
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    startConversation(userId, listingId).then(conv => openConversation(conv))
  }, [userId, listingId])

  const openConversation = useCallback((conv) => {
    setActiveConvObj(conv)
    setMobileShowChat(true)
    setChatError(null)
    const chatId = conv.chatId || conv._id
    socketRef.current?.emit('join_chat', { chatId })
    socketRef.current?.emit('joinConversation', conv._id)
    fetchMessages(conv._id, conv.chatId)
    // Check listing status
    if (conv.listing) setListingStatus(conv.listing.status || 'active')
    else setListingStatus('active')
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const isSold = listingStatus === 'sold'
  const isDeleted = listingStatus === 'deleted'
  const chatDisabled = isSold || isDeleted

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim() || !activeConvObj || chatDisabled) return
    const receiver = activeConvObj.participants?.find(p => p._id !== user._id)
    sendMessage(text, receiver?._id)
    setText('')
    socketRef.current?.emit('typing', { chatId: activeChatId || activeConversation, isTyping: false })
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    const chatId = activeChatId || activeConversation
    if (!chatId || chatDisabled) return
    socketRef.current?.emit('typing', { chatId, isTyping: true })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('typing', { chatId, isTyping: false })
    }, 1500)
  }

  const getOtherUser = (conv) => conv?.participants?.find(p => p._id !== user._id)
  const isOnline = (conv) => onlineUsers.includes(getOtherUser(conv)?._id)
  const isTypingOther = Object.entries(typing).some(([uid, t]) => t && uid !== user._id)

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 h-[calc(100vh-72px)]">
      <div className="flex h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">

        {/* Sidebar */}
        <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 shrink-0 flex-col border-r border-gray-200 dark:border-gray-800`}>
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <FiMessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
            {conversations.map(conv => {
              const other = getOtherUser(conv)
              const online = isOnline(conv)
              const isActive = activeConvObj?._id === conv._id
              const convSold = conv.listing?.status === 'sold'
              return (
                <motion.button key={conv._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  onClick={() => openConversation(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left border-b border-gray-100 dark:border-gray-800 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500' : ''}`}>
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {other?.avatar ? <img src={other.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : other?.name?.[0]?.toUpperCase()}
                    </div>
                    {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{other?.name}</p>
                    {conv.listing && (
                      <p className="text-xs text-blue-500 truncate flex items-center gap-1">
                        {conv.listing.title}
                        {convSold && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">SOLD</span>}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                      {conv.lastMessage ? <><FiLock className="w-2.5 h-2.5" /> encrypted</> : 'Start chatting'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {online && <span className="text-xs text-green-500">Online</span>}
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Chat area */}
        <AnimatePresence mode="wait">
          {activeConvObj ? (
            <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
              className={`${mobileShowChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>

              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button onClick={() => setMobileShowChat(false)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                {(() => {
                  const other = getOtherUser(activeConvObj)
                  const online = isOnline(activeConvObj)
                  return (
                    <>
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                          {other?.avatar ? <img src={other.avatar} className="w-full h-full object-cover" alt="" /> : other?.name?.[0]?.toUpperCase()}
                        </div>
                        {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">{other?.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          {online ? <><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online</> : 'Offline'}
                          <span className="mx-1">·</span>
                          <FiLock className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">E2E Encrypted</span>
                        </p>
                      </div>
                      {activeConvObj.listing && (
                        <Link to={`/listing/${activeConvObj.listing._id}`}
                          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition max-w-[180px]">
                          {activeConvObj.listing.images?.[0] && <img src={activeConvObj.listing.images[0]} className="w-6 h-6 rounded object-cover" alt="" />}
                          <span className="truncate">{activeConvObj.listing.title}</span>
                          {isSold && <span className="text-orange-500 font-semibold shrink-0">SOLD</span>}
                        </Link>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Sold/Deleted banner */}
              {isSold && (
                <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800">
                  <FiAlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">This item has been sold. Chat is closed — you can still view old messages.</p>
                </div>
              )}
              {isDeleted && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                  <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">This listing has been deleted.</p>
                </div>
              )}

              {/* Chat error */}
              {chatError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mx-4 mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{chatError}</p>
                </motion.div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMine = msg.sender === user._id || msg.sender?._id === user._id
                    return (
                      <motion.div key={msg._id || i} initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'}`}>
                          <p className="leading-relaxed break-words">{msg.text}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'just now'}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                <AnimatePresence>
                  {isTypingOther && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1 items-center">
                          {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {chatDisabled ? (
                <div className="flex items-center justify-center gap-2 px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <FiLock className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isSold ? 'Chat closed — item sold' : 'Chat unavailable'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <input value={text} onChange={handleTyping} placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  <motion.button whileTap={{ scale: 0.88 }} type="submit" disabled={!text.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition">
                    <FiSend className="w-4 h-4" />
                  </motion.button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="hidden md:flex flex-1 items-center justify-center text-gray-400">
              <div className="text-center">
                <FiMessageSquare className="w-14 h-14 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm mt-1 opacity-60">or start one from a listing</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
