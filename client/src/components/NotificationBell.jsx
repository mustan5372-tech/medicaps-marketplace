import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiCheck, FiMessageSquare, FiBook } from 'react-icons/fi'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore } from '../store/authStore'
import { getSocket } from '../utils/socket'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function NotificationBell() {
  const { user } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, addNotification, markRead, markAllRead } = useNotificationStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    const socket = getSocket()
    if (socket) {
      socket.on('new_notification', (notif) => {
        addNotification(notif)

        // Rich toast for ebook requests (admin only)
        if (notif.type === 'ebookRequest') {
          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-start gap-3 bg-gray-900 border border-purple-500/30 rounded-2xl px-4 py-3 shadow-2xl shadow-purple-500/20 max-w-sm cursor-pointer ${t.visible ? '' : 'opacity-0'}`}
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/admin?tab=ebooks')
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <FiBook className="text-purple-400" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">📚 New Ebook Request</p>
                <p className="text-white/60 text-xs mt-0.5 truncate">{notif.message?.replace('📚 New ebook request: ', '')}</p>
                <p className="text-purple-400 text-xs mt-1 font-medium">Tap to fulfill →</p>
              </div>
            </motion.div>
          ), { duration: 8000, position: 'top-right' })
        }

        // Browser push notification
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          const isEbook = notif.type === 'ebookRequest'
          new Notification(isEbook ? '📚 New Ebook Request' : `New message from ${notif.senderId?.name || 'Someone'}`, {
            body: notif.message,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: isEbook ? 'ebook-request' : 'message',
          })
        }
      })
    }

    return () => { socket?.off('new_notification') }
  }, [user])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = async (notif) => {
    await markRead(notif._id)
    setOpen(false)
    if (notif.type === 'ebookRequest') {
      navigate('/admin?tab=ebooks')
    } else if (notif.conversationId) {
      navigate(`/chat?conv=${notif.conversationId}`)
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
      >
        <motion.div
          animate={unreadCount > 0 ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : {}}
          transition={unreadCount > 0 ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          <FiBell className="w-5 h-5" />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FiBell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const isEbook = notif.type === 'ebookRequest'
                  return (
                    <motion.button
                      key={notif._id}
                      whileHover={{ backgroundColor: isEbook ? 'rgba(168,85,247,0.05)' : 'rgba(59,130,246,0.05)' }}
                      onClick={() => handleClick(notif)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-50 dark:border-gray-800 transition ${!notif.isRead ? (isEbook ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'bg-blue-50/50 dark:bg-blue-900/10') : ''}`}
                    >
                      {/* Icon / Avatar */}
                      {isEbook ? (
                        <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                          <FiBook className="text-purple-400 w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                          {notif.senderId?.avatar
                            ? <img src={notif.senderId.avatar} alt="" className="w-full h-full object-cover" />
                            : notif.senderId?.name?.[0]?.toUpperCase()
                          }
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                          {isEbook ? '📚 Ebook Request' : notif.senderId?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          {isEbook
                            ? <><FiBook className="w-3 h-3 text-purple-400" /> {notif.message?.replace('📚 New ebook request: ', '')}</>
                            : <><FiMessageSquare className="w-3 h-3" /> {notif.message}</>
                          }
                        </p>
                        {isEbook && (
                          <p className="text-xs text-purple-400 font-medium mt-0.5">Tap to fulfill →</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${isEbook ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
