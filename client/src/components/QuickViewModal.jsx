import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { FiX, FiMapPin, FiMessageSquare, FiHeart, FiExternalLink } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function QuickViewModal({ listing, onClose }) {
  const { user } = useAuthStore()
  const { startConversation } = useChatStore()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(listing.savedBy?.includes(user?._id))

  const handleContact = async () => {
    if (!user) { toast.error('Login to contact seller'); return }
    await startConversation(listing.seller._id, listing._id)
    navigate(`/chat/${listing.seller._id}?listing=${listing._id}`)
    onClose()
  }

  const toggleSave = async () => {
    if (!user) { toast.error('Login to save'); return }
    await api.post(`/listings/${listing._id}/save`)
    setSaved(!saved)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl"
        >
          {/* Image */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            <img
              src={listing.images?.[0] || `https://placehold.co/600x400/e2e8f0/94a3b8?text=${listing.category}`}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl backdrop-blur-sm transition">
              <FiX className="w-4 h-4" />
            </button>
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
              {listing.condition}
            </span>
          </div>

          {/* Info */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{listing.title}</h2>
              <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent shrink-0">
                ₹{listing.price?.toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{listing.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <FiMapPin className="w-3 h-3" /> {listing.location}
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">{listing.category}</span>
            </div>

            {/* Seller */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {listing.seller?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{listing.seller?.name}</p>
                <p className="text-xs text-gray-400">Seller</p>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleContact}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25">
                <FiMessageSquare className="w-4 h-4" /> Chat with Seller
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleSave}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-400 transition">
                <FiHeart className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </motion.button>
              <Link to={`/listing/${listing._id}`} onClick={onClose}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition">
                <FiExternalLink className="w-5 h-5 text-gray-500" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
